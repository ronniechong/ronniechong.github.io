export interface ContentEntry {
  slug: string;
  frontmatter: Record<string, string>;
  body: string;
}

// Hand-rolled: our frontmatter is flat key: value pairs, so a full YAML
// parser (gray-matter pulls in js-yaml's eval-based engine) is unneeded.
function parseFrontmatter(raw: string): { data: Record<string, string>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };
  const [, frontmatter, content] = match;
  const data: Record<string, string> = {};
  for (const line of frontmatter.split(/\r?\n/)) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    const value = line
      .slice(colonIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
    if (key) data[key] = value;
  }
  return { data, content };
}

function loadCollection(rawModules: Record<string, string>): ContentEntry[] {
  return Object.entries(rawModules)
    .map(([path, raw]) => {
      const slug = path.split('/').pop()!.replace(/\.md$/, '');
      const { data, content } = parseFrontmatter(raw);
      return { slug, frontmatter: data, body: content.trim() };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

// Projects show newest-first (an `added: YYYY-MM-DD` frontmatter field),
// not alphabetically like pages — visitors browsing the list should see
// the latest work on top. Missing/equal dates fall back to slug order so
// this never throws on a project file someone forgets to date.
function sortProjectsByAddedDesc(entries: ContentEntry[]): ContentEntry[] {
  return [...entries].sort((a, b) => {
    const dateDiff = (b.frontmatter.added ?? '').localeCompare(a.frontmatter.added ?? '');
    return dateDiff !== 0 ? dateDiff : a.slug.localeCompare(b.slug);
  });
}

const pageModules = import.meta.glob('/content/pages/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const projectModules = import.meta.glob('/content/projects/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

// Deliberately outside content/pages/ so it's never picked up by the
// pages glob above — a 404 screen shouldn't be browsable via ls/cat.
const notFoundModules = import.meta.glob('/content/404.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export const pages: ContentEntry[] = loadCollection(pageModules);
export const projects: ContentEntry[] = sortProjectsByAddedDesc(loadCollection(projectModules));

export const notFound: ContentEntry = (() => {
  const raw = Object.values(notFoundModules)[0] ?? '';
  const { data, content } = parseFrontmatter(raw);
  return { slug: '404', frontmatter: data, body: content.trim() };
})();

export function getPage(slug: string): ContentEntry | undefined {
  return pages.find((p) => p.slug === slug);
}

export function getProject(slug: string): ContentEntry | undefined {
  return projects.find((p) => p.slug === slug);
}
