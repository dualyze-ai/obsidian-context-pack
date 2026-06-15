import { escapeXml } from './epubSanitizer';

export function buildContainerXml(): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
}

export function buildContentOpf(params: {
  title: string;
  language: string;
  uuid: string;
  modifiedDate: string;
  hasBrief: boolean;
  chapterIds: string[];
}): string {
  const { title, language, uuid, modifiedDate, hasBrief, chapterIds } = params;

  const manifestItems: string[] = [
    `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
    `<item id="css" href="styles.css" media-type="text/css"/>`,
  ];
  if (hasBrief) {
    manifestItems.push(`<item id="brief" href="brief.xhtml" media-type="application/xhtml+xml"/>`);
  }
  for (const id of chapterIds) {
    manifestItems.push(`<item id="${id}" href="${id}.xhtml" media-type="application/xhtml+xml"/>`);
  }

  const spineItems: string[] = [`<itemref idref="nav"/>`];
  if (hasBrief) spineItems.push(`<itemref idref="brief"/>`);
  for (const id of chapterIds) spineItems.push(`<itemref idref="${id}"/>`);

  return `<?xml version="1.0" encoding="utf-8"?>
<package version="3.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:language>${language}</dc:language>
    <dc:creator>AI Context Pack</dc:creator>
    <dc:identifier id="bookid">urn:uuid:${uuid}</dc:identifier>
    <meta property="dcterms:modified">${modifiedDate}</meta>
  </metadata>
  <manifest>
    ${manifestItems.join('\n    ')}
  </manifest>
  <spine>
    ${spineItems.join('\n    ')}
  </spine>
</package>`;
}

export function buildNavXhtml(params: {
  title: string;
  language: string;
  hasBrief: boolean;
  chapters: { id: string; title: string }[];
}): string {
  const { title, language, hasBrief, chapters } = params;
  const items: string[] = [];
  if (hasBrief) items.push(`    <li><a href="brief.xhtml">Preface</a></li>`);
  for (const ch of chapters) {
    items.push(`    <li><a href="${ch.id}.xhtml">${escapeXml(ch.title)}</a></li>`);
  }

  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${language}">
<head>
  <title>${escapeXml(title)} — Table of Contents</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Table of Contents</h1>
    <ol>
${items.join('\n')}
    </ol>
  </nav>
</body>
</html>`;
}

export function buildChapterXhtml(params: {
  title: string;
  language: string;
  bodyContent: string;
}): string {
  const { title, language, bodyContent } = params;
  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="${language}">
<head>
  <title>${escapeXml(title)}</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
  <h1>${escapeXml(title)}</h1>
  ${bodyContent}
</body>
</html>`;
}

export const EPUB_CSS = `body {
  font-family: serif;
  line-height: 1.6;
  margin: 1em;
}

h1, h2, h3, h4, h5, h6 {
  line-height: 1.3;
  margin-top: 1.2em;
}

p {
  margin: 0.6em 0;
}

pre {
  white-space: pre-wrap;
  overflow-wrap: break-word;
  background: #f4f4f4;
  padding: 0.5em;
  font-size: 0.9em;
}

code {
  font-family: monospace;
  font-size: 0.9em;
}

table {
  border-collapse: collapse;
  width: 100%;
  margin: 0.8em 0;
}

td, th {
  border: 1px solid #999;
  padding: 0.3em 0.5em;
}

th {
  background: #eee;
}

blockquote {
  border-left: 3px solid #ccc;
  margin-left: 1em;
  padding-left: 0.8em;
  color: #555;
}

ul, ol {
  padding-left: 1.5em;
}

li {
  margin: 0.2em 0;
}

hr {
  border: none;
  border-top: 1px solid #ccc;
  margin: 1em 0;
}
`;
