export interface ImageRef {
  linkpath: string;
  noteVaultPath: string;
  proposedAssetName: string;
}

export interface ConversionResult {
  markdown: string;
  imageRefs: ImageRef[];
}

function stripFrontmatter(md: string): string {
  return md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

export function convertForNotion(
  markdown: string,
  noteVaultPath: string,
  assetPathPrefix: string,
): ConversionResult {
  let md = stripFrontmatter(markdown);
  const imageRefs: ImageRef[] = [];

  // Embed images: ![[image.jpg]] or ![[path/file.jpg|200]]
  md = md.replace(/!\[\[([^\]]+)\]\]/g, (_, ref: string) => {
    const cleanRef = ref.split('|')[0].trim();
    const assetName = cleanRef.split('/').pop() ?? cleanRef;
    const altText = assetName.replace(/\.[^.]+$/, '');
    imageRefs.push({ linkpath: cleanRef, noteVaultPath, proposedAssetName: assetName });
    return `![${altText}](${assetPathPrefix}${assetName})`;
  });

  // Regular markdown images: ![alt](path) — skip external URLs
  md = md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt: string, src: string) => {
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
      return match;
    }
    const assetName = src.split('/').pop() ?? src;
    imageRefs.push({ linkpath: src, noteVaultPath, proposedAssetName: assetName });
    return `![${alt || assetName.replace(/\.[^.]+$/, '')}](${assetPathPrefix}${assetName})`;
  });

  // Wikilinks with alias: [[page|alias]] → [alias](page.md)
  md = md.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, (_, page: string, alias: string) => {
    const fileName = (page.trim().split('/').pop() ?? page.trim());
    return `[${alias.trim()}](${fileName}.md)`;
  });

  // Plain wikilinks: [[page]] → [page](page.md)
  md = md.replace(/\[\[([^\]]+)\]\]/g, (_, page: string) => {
    const pageName = page.trim();
    const fileName = pageName.split('/').pop() ?? pageName;
    return `[${pageName}](${fileName}.md)`;
  });

  return { markdown: md, imageRefs };
}
