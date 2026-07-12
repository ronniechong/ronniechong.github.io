import { getNode, resolvePath, formatPath } from './fs';
import { getProject } from './content';
import { renderMarkdown } from './markdown';

export interface ShellState {
  cwd: string[];
  // Set by a handler (e.g. `open`) to request navigating to an external
  // URL; Terminal.tsx opens it in a new tab after the command runs.
  pendingLink?: string;
}

export type CommandHandler = (args: string[], state: ShellState) => string;

const CONTACT_URL = 'https://github.com/ronniechong/ronniechong.github.io/issues/new';

function ls(args: string[], state: ShellState): string {
  const target = args[0] ? resolvePath(state.cwd, args[0]) : state.cwd;
  const node = getNode(target);
  if (!node) return `ls: no such file or directory: ${args[0] ?? formatPath(target)}`;
  if (node.type === 'file') return target[target.length - 1] ?? '';
  const names = Object.keys(node.children).sort();
  return names.length ? names.join('\n') : '(empty)';
}

function cd(args: string[], state: ShellState): string {
  const target = args[0] ? resolvePath(state.cwd, args[0]) : [];
  const node = getNode(target);
  if (!node) return `cd: no such directory: ${args[0]}`;
  if (node.type !== 'dir') return `cd: not a directory: ${args[0]}`;
  state.cwd = target;
  return '';
}

function cat(args: string[], state: ShellState): string {
  const name = args[0];
  if (!name) return "cat: missing file name, e.g. 'cat about.md'";
  const target = resolvePath(state.cwd, name);
  const node = getNode(target);
  if (!node) return `cat: no such file: ${name}`;
  if (node.type !== 'file') return `cat: is a directory: ${name}`;
  return renderMarkdown(node.entry.body);
}

function open(args: string[], state: ShellState): string {
  const slug = args[0];
  if (!slug) return "open: missing project name, e.g. 'open generative-art'";
  const project = getProject(slug);
  if (!project) return `open: no such project: ${slug}`;
  const { title, link } = project.frontmatter;
  const parts = [`# ${title ?? slug}`, project.body];
  if (link) {
    parts.push(link);
    state.pendingLink = link;
  }
  return renderMarkdown(parts.join('\n\n'));
}

function whoami(): string {
  return "ronniechong — [TODO: one-line bio]. Type 'cat /pages/about.md' for more.";
}

function contact(): string {
  return `Open an issue to get in touch: ${CONTACT_URL}`;
}

// Clears the visible screen and scrollback, then homes the cursor.
function clear(): string {
  return '\x1b[2J\x1b[3J\x1b[H';
}

const descriptions: Record<string, string> = {
  help: 'list available commands',
  whoami: 'short bio',
  ls: 'list current directory, or a given path',
  cd: "change directory, e.g. 'cd projects'",
  cat: "print a file, e.g. 'cat about.md'",
  open: "open a project, e.g. 'open generative-art' (opens its link in a new tab)",
  clear: 'clear the screen',
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
  cd,
  cat,
  open,
  clear,
  contact,
};
