import { zipSync, strToU8 } from 'fflate';
import type { EpubBookInput, EpubCluster } from './epubTypes';
import { stripFrontmatter, convertObsidianLinks, stripTitleH1 } from './epubSanitizer';
import { markdownToXhtml } from './markdownToXhtml';
import {
  buildContainerXml, buildContentOpf, buildCoverXhtml, buildOverviewXhtml,
  buildNavXhtml, buildChapterXhtml, EPUB_CSS,
} from './epubTemplates';

export function buildEpub(input: EpubBookInput): Uint8Array {
  const { options, briefMarkdown, chapters, clusters } = input;

  const uuid = crypto.randomUUID();
  const now = new Date();
  const modifiedDate = now.toISOString().replace(/\.\d{3}Z$/, 'Z');
  const generatedDate = now.toISOString().slice(0, 10);
  const lang = options.language;

  function processMarkdown(md: string, title?: string): string {
    let result = md;
    if (options.stripFrontmatter) result = stripFrontmatter(result);
    if (options.convertObsidianLinks) result = convertObsidianLinks(result);
    // Only strip H1 if it exactly matches the note title
    if (title) result = stripTitleH1(result, title);
    return result;
  }

  // Cover
  const coverXhtml = buildCoverXhtml({
    title: options.title,
    language: lang,
    noteCount: chapters.length,
    generatedDate,
  });

  // Knowledge Overview (shown when clusters are available or always)
  const hasOverview = clusters !== undefined && clusters.length > 0;
  const overviewXhtml = buildOverviewXhtml({
    title: options.title,
    language: lang,
    noteCount: chapters.length,
    clusters: clusters ?? [],
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

  // Chapters
  const processedChapters = chapters.map((ch, idx) => {
    const id = `chapter-${String(idx + 1).padStart(3, '0')}`;
    const body = markdownToXhtml(processMarkdown(ch.markdown, ch.title));
    return {
      id,
      title: ch.title,
      xhtml: buildChapterXhtml({ title: ch.title, language: lang, bodyContent: body }),
    };
  });

  const chapterIds = processedChapters.map(c => c.id);
  const chapterList = processedChapters.map(c => ({ id: c.id, title: c.title }));

  const epubClusters: EpubCluster[] | undefined = clusters && clusters.length > 0
    ? clusters.filter(c => c.chapterIndices.length > 0)
    : undefined;

  const navXhtml = buildNavXhtml({
    title: options.title,
    language: lang,
    hasBrief,
    hasOverview,
    chapters: chapterList,
    clusters: epubClusters,
  });

  const opf = buildContentOpf({
    title: options.title,
    language: lang,
    uuid,
    modifiedDate,
    hasBrief,
    hasOverview,
    chapterIds,
  });

  type ZipEntry = Uint8Array | [Uint8Array, { level: number }];
  const files: Record<string, ZipEntry> = {
    'mimetype': [strToU8('application/epub+zip') as Uint8Array, { level: 0 }],
    'META-INF/container.xml': strToU8(buildContainerXml()) as Uint8Array,
    'OEBPS/content.opf': strToU8(opf) as Uint8Array,
    'OEBPS/cover.xhtml': strToU8(coverXhtml) as Uint8Array,
    'OEBPS/overview.xhtml': strToU8(overviewXhtml) as Uint8Array,
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
