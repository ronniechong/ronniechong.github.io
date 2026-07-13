import { pages, projects } from './content';
import type { ContentEntry } from './content';

export interface FileNode {
  type: 'file';
  entry: ContentEntry;
}

export interface DirNode {
  type: 'dir';
  children: Record<string, FsNode>;
}

export type FsNode = FileNode | DirNode;

function toDir(entries: ContentEntry[]): DirNode {
  const children: Record<string, FsNode> = {};
  for (const entry of entries) {
    children[`${entry.slug}.md`] = { type: 'file', entry };
  }
  return { type: 'dir', children };
}

const root: DirNode = {
  type: 'dir',
  children: {
    pages: toDir(pages),
    projects: toDir(projects),
  },
};

export function resolvePath(cwd: string[], input: string): string[] {
  const base = input.startsWith('/') ? [] : cwd;
  const resolved: string[] = [...base];
  for (const part of input.split('/')) {
    if (part === '' || part === '.') continue;
    if (part === '..') resolved.pop();
    else resolved.push(part);
  }
  return resolved;
}

export function getNode(path: string[]): FsNode | undefined {
  let node: FsNode = root;
  for (const part of path) {
    if (node.type !== 'dir') return undefined;
    const next: FsNode | undefined = node.children[part];
    if (!next) return undefined;
    node = next;
  }
  return node;
}

export function formatPath(path: string[]): string {
  return path.length === 0 ? '~' : `~/${path.join('/')}`;
}
