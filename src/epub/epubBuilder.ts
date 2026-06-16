import { zipSync, strToU8 } from 'fflate';
import type { EpubBookInput, EpubCluster } from './epubTypes';
import { stripFrontmatter, convertObsidianLinks, stripTitleH1, stripBriefSections } from './epubSanitizer';
import { markdownToXhtml } from './markdownToXhtml';
import {
  buildContainerXml, buildContentOpf, buildCoverXhtml, buildOverviewXhtml,
  buildNavXhtml, buildClusterXhtml, buildChapterXhtml, EPUB_CSS,
} from './epubTemplates';

function extractImageUrls(markdown: string): string[] {
  const urls: string[] = [];
  const re = /!\[[^\]]*\]\((https?:\/\/[^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown)) !== null) {
    urls.push(m[1]);
  }
  return urls;
}

function guessMediaType(url: string): string {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg',
    png: 'image/png', gif: 'image/gif',
    svg: 'image/svg+xml', webp: 'image/webp',
  };
  return map[ext] ?? 'image/jpeg';
}

async function downloadImage(url: string): Promise<{ data: Uint8Array; mediaType: string } | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!resp.ok) return null;
    const contentType = resp.headers.get('content-type') ?? '';
    const mediaType = contentType.split(';')[0].trim() || guessMediaType(url);
    const buffer = await resp.arrayBuffer();
    return { data: new Uint8Array(buffer), mediaType };
  } catch {
    return null;
  }
}

export async function buildEpub(input: EpubBookInput): Promise<Uint8Array> {
  const { options, briefMarkdown, chapters, clusters } = input;

  // Collect and download all external images
  const allMarkdown = [
    briefMarkdown ?? '',
    ...chapters.map(ch => ch.markdown),
  ];
  const uniqueUrls = [...new Set(allMarkdown.flatMap(extractImageUrls))];
  const imageMap = new Map<string, string>();
  type ImageEntry = { id: string; href: string; mediaType: string; data: Uint8Array };
  const imageEntries: ImageEntry[] = [];

  await Promise.all(uniqueUrls.map(async (url, idx) => {
    const result = await downloadImage(url);
    if (!result) return;
    const ext = result.mediaType === 'image/svg+xml' ? 'svg'
      : result.mediaType === 'image/png' ? 'png'
      : result.mediaType === 'image/gif' ? 'gif'
      : result.mediaType === 'image/webp' ? 'webp'
      : 'jpg';
    const id = `img-${String(idx + 1).padStart(3, '0')}`;
    const href = `images/${id}.${ext}`;
    imageMap.set(url, `../${href}`);
    imageEntries.push({ id, href, mediaType: result.mediaType, data: result.data });
  }));

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

  // Overview is always included in manifest/spine/nav
  const hasOverview = true;
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
        bodyContent: markdownToXhtml(processMarkdown(stripBriefSections(briefMarkdown)), imageMap),
      })
    : '';

  // Chapters
  const processedChapters = chapters.map((ch, idx) => {
    const id = `chapter-${String(idx + 1).padStart(3, '0')}`;
    const body = markdownToXhtml(processMarkdown(ch.markdown, ch.title), imageMap);
    return {
      id,
      title: ch.title,
      xhtml: buildChapterXhtml({ title: ch.title, language: lang, bodyContent: body }),
    };
  });

  const chapterList = processedChapters.map(c => ({ id: c.id, title: c.title }));

  // Filter clusters that actually have chapters, then generate a cluster landing page for each
  const epubClusters: EpubCluster[] | undefined = clusters && clusters.length > 0
    ? clusters.filter(c => c.chapterIndices.length > 0)
    : undefined;

  type ClusterPage = { id: string; href: string; xhtml: string };
  const clusterPages: ClusterPage[] = [];

  if (epubClusters) {
    epubClusters.forEach((cluster, i) => {
      const id = `cluster-${String(i + 1).padStart(3, '0')}`;
      cluster.clusterId = id;
      const clusterChapters = cluster.chapterIndices
        .map(idx => processedChapters[idx])
        .filter((ch): ch is typeof processedChapters[0] => !!ch);
      const xhtml = buildClusterXhtml({
        name: cluster.name,
        language: lang,
        chapters: clusterChapters.map(ch => ({ id: ch.id, title: ch.title })),
      });
      clusterPages.push({ id, href: `${id}.xhtml`, xhtml });
    });
  }

  // Build spine-order content items: cluster page → its chapters, then unclustered chapters
  const contentItems: { id: string; href: string }[] = [];
  if (epubClusters) {
    const assignedChapterIds = new Set<string>();
    for (const cluster of epubClusters) {
      const page = clusterPages.find(p => p.id === cluster.clusterId);
      if (page) contentItems.push({ id: page.id, href: page.href });
      for (const idx of cluster.chapterIndices) {
        const ch = processedChapters[idx];
        if (ch && !assignedChapterIds.has(ch.id)) {
          assignedChapterIds.add(ch.id);
          contentItems.push({ id: ch.id, href: `${ch.id}.xhtml` });
        }
      }
    }
    for (const ch of processedChapters) {
      if (!assignedChapterIds.has(ch.id)) {
        contentItems.push({ id: ch.id, href: `${ch.id}.xhtml` });
      }
    }
  } else {
    for (const ch of processedChapters) {
      contentItems.push({ id: ch.id, href: `${ch.id}.xhtml` });
    }
  }

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
    contentItems,
    imageItems: imageEntries.map(({ id, href, mediaType }) => ({ id, href, mediaType })),
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

  for (const page of clusterPages) {
    files[`OEBPS/${page.href}`] = strToU8(page.xhtml) as Uint8Array;
  }

  for (const ch of processedChapters) {
    files[`OEBPS/${ch.id}.xhtml`] = strToU8(ch.xhtml) as Uint8Array;
  }

  for (const img of imageEntries) {
    files[`OEBPS/${img.href}`] = img.data;
  }

  return zipSync(files as Parameters<typeof zipSync>[0]) as Uint8Array;
}
