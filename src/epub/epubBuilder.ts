import { zipSync, strToU8 } from 'fflate';
import type { EpubBookInput, EpubCluster } from './epubTypes';
import { stripFrontmatter, convertObsidianLinks, stripLeadingH1 } from './epubSanitizer';
import { markdownToXhtml } from './markdownToXhtml';
import {
  buildContainerXml, buildContentOpf, buildCoverXhtml,
  buildNavXhtml, buildChapterXhtml, EPUB_CSS,
} from './epubTemplates';

export function buildEpub(input: EpubBookInput): Uint8Array {
  const { options, briefMarkdown, chapters, clusters } = input;

  const uuid = crypto.randomUUID();
  const now = new Date();
  const modifiedDate = now.toISOString().replace(/\.\d{3}Z$/, 'Z');
  const generatedDate = now.toISOString().slice(0, 10);
  const lang = options.language;

  function processMarkdown(md: string, isChapter = false): string {
    let result = md;
    if (options.stripFrontmatter) result = stripFrontmatter(result);
    if (options.convertObsidianLinks) result = convertObsidianLinks(result);
    if (isChapter) result = stripLeadingH1(result);
    return result;
  }

  // Cover
  const coverXhtml = buildCoverXhtml({
    title: options.title,
    language: lang,
    noteCount: chapters.length,
    generatedDate,
  });

  // AI Brief as preface
  const hasBrief = options.includeBrief && !!briefMarkdown;
  const briefXhtml = hasBrief && briefMarkdown
    ? buildChapterXhtml({
        title: lang === 'ja' ? 'まえがき' : 'Preface',
        language: lang,
        bodyContent: markdownToXhtml(processMarkdown(briefMarkdown)),
      })
    : '';

  // Chapters — strip leading H1 so it doesn't duplicate the template <h1>
  const processedChapters = chapters.map((ch, idx) => {
    const id = `chapter-${String(idx + 1).padStart(3, '0')}`;
    const body = markdownToXhtml(processMarkdown(ch.markdown, true));
    return {
      id,
      title: ch.title,
      xhtml: buildChapterXhtml({ title: ch.title, language: lang, bodyContent: body }),
    };
  });

  const chapterIds = processedChapters.map(c => c.id);
  const chapterList = processedChapters.map(c => ({ id: c.id, title: c.title }));

  // Remap cluster indices to use generated chapter IDs (indices stay the same)
  const epubClusters: EpubCluster[] | undefined = clusters && clusters.length > 0
    ? clusters.filter(c => c.chapterIndices.length > 0)
    : undefined;

  const navXhtml = buildNavXhtml({
    title: options.title,
    language: lang,
    hasBrief,
    chapters: chapterList,
    clusters: epubClusters,
  });

  const opf = buildContentOpf({
    title: options.title,
    language: lang,
    uuid,
    modifiedDate,
    hasBrief,
    chapterIds,
  });

  type ZipEntry = Uint8Array | [Uint8Array, { level: number }];
  const files: Record<string, ZipEntry> = {
    'mimetype': [strToU8('application/epub+zip') as Uint8Array, { level: 0 }],
    'META-INF/container.xml': strToU8(buildContainerXml()) as Uint8Array,
    'OEBPS/content.opf': strToU8(opf) as Uint8Array,
    'OEBPS/cover.xhtml': strToU8(coverXhtml) as Uint8Array,
    'OEBPS/nav.xhtml': strToU8(navXhtml) as Uint8Array,
    'OEBPS/styles.css': strToU8(EPUB_CSS) as Uint8Array,
  };

  if (hasBrief) {
    files['OEBPS/brief.xhtml'] = strToU8(briefXhtml) as Uint8Array;
  }

  for (const ch of processedChapters) {
    files[`OEBPS/${ch.id}.xhtml`] = strToU8(ch.xhtml) as Uint8Array;
  }

  return zipSync(files as Parameters<typeof zipSync>[0]);
}
