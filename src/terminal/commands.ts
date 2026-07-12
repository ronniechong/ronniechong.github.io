import { pages, projects, getPage } from './content';

export type CommandHandler = (args: string[]) => string;

const CONTACT_URL = 'https://github.com/ronniechong/ronniechong.github.io/issues/new';

function ls(args: string[]): string {
  const target = args[0]?.replace(/\/$/, '');
  if (target === 'pages') {
    return pages.length ? pages.map((p) => p.slug).join('\n') : '(no pages yet)';
  }
  if (target === 'projects') {
    return projects.length ? projects.map((p) => p.slug).join('\n') : '(no projects yet)';
  }
  return `ls: unknown collection '${args[0] ?? ''}'. Try 'ls pages/' or 'ls projects/'.`;
}

function cat(args: string[]): string {
  const slug = args[0];
  if (!slug) return "cat: missing page name. Try 'cat about'.";
  const page = getPage(slug);
  if (!page) return `cat: no such page '${slug}'. Try 'ls pages/' to see what's available.`;
  return page.body;
}

function whoami(): string {
  return "ronniechong — [TODO: one-line bio]. Type 'cat about' for more.";
}

function contact(): string {
  return `Open an issue to get in touch: ${CONTACT_URL}`;
}

const descriptions: Record<string, string> = {
  help: 'list available commands',
  whoami: 'short bio',
  ls: "list a collection, e.g. 'ls pages/' or 'ls projects/'",
  cat: "print a page, e.g. 'cat about'",
  contact: 'how to reach me',
};

function help(): string {
  return Object.entries(descriptions)
    .map(([name, desc]) => `${name.padEnd(8)} ${desc}`)
    .join('\n');
}

export const commands: Record<string, CommandHandler> = {
  help,
  whoami,
  ls,
  cat,
  contact,
};
