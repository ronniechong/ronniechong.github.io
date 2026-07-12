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

export const pages: ContentEntry[] = loadCollection(pageModules);
export const projects: ContentEntry[] = loadCollection(projectModules);

export function getPage(slug: string): ContentEntry | undefined {
  return pages.find((p) => p.slug === slug);
}

export function getProject(slug: string): ContentEntry | undefined {
  return projects.find((p) => p.slug === slug);
}
