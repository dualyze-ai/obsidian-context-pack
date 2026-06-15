import { zipSync, strToU8 } from 'fflate';
import type { EpubBookInput } from './epubTypes';
import { stripFrontmatter, convertObsidianLinks } from './epubSanitizer';
import { markdownToXhtml } from './markdownToXhtml';
import { buildContainerXml, buildContentOpf, buildNavXhtml, buildChapterXhtml, EPUB_CSS } from './epubTemplates';

export function buildEpub(input: EpubBookInput): Uint8Array {
  const { options, briefMarkdown, chapters } = input;

  const uuid = crypto.randomUUID();
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const lang = options.language;

  function processMarkdown(md: string): string {
    let result = md;
    if (options.stripFrontmatter) result = stripFrontmatter(result);
    if (options.convertObsidianLinks) result = convertObsidianLinks(result);
    return result;
  }

  const hasBrief = options.includeBrief && !!briefMarkdown;
  const briefXhtml = hasBrief && briefMarkdown
    ? buildChapterXhtml({
        title: 'Preface',
        language: lang,
        bodyContent: markdownToXhtml(processMarkdown(briefMarkdown)),
      })
    : '';

  const processedChapters = chapters.map((ch, idx) => {
    const id = `chapter-${String(idx + 1).padStart(3, '0')}`;
    const body = markdownToXhtml(processMarkdown(ch.markdown));
    return {
      id,
      title: ch.title,
      xhtml: buildChapterXhtml({ title: ch.title, language: lang, bodyContent: body }),
    };
  });

  const chapterIds = processedChapters.map(c => c.id);
  const chapterList = processedChapters.map(c => ({ id: c.id, title: c.title }));

  const navXhtml = buildNavXhtml({ title: options.title, language: lang, hasBrief, chapters: chapterList });
  const opf = buildContentOpf({ title: options.title, language: lang, uuid, modifiedDate: now, hasBrief, chapterIds });

  type ZipEntry = Uint8Array | [Uint8Array, { level: number }];
  const files: Record<string, ZipEntry> = {
    'mimetype': [strToU8('application/epub+zip') as Uint8Array, { level: 0 }],
    'META-INF/container.xml': strToU8(buildContainerXml()) as Uint8Array,
    'OEBPS/content.opf': strToU8(opf) as Uint8Array,
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
