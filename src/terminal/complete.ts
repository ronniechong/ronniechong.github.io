import { getNode, resolvePath } from './fs';
import { projects } from './content';
import { commands, type ShellState } from './commands';

const PATH_AWARE_COMMANDS = new Set(['ls', 'cd', 'cat']);

// Returns candidate replacements for the token currently being typed
// (the command name if completing the first word, otherwise its argument).
export function complete(line: string, state: ShellState): string[] {
  const endsWithSpace = line.endsWith(' ');
  const tokens = line.trim().split(/\s+/).filter(Boolean);

  if (tokens.length === 0 || (tokens.length === 1 && !endsWithSpace)) {
    const partial = tokens[0] ?? '';
    return Object.keys(commands).filter((name) => name.startsWith(partial));
  }

  const commandName = tokens[0];
  const currentArg = endsWithSpace ? '' : tokens[tokens.length - 1];

  if (commandName === 'open') {
    return projects.map((p) => p.slug).filter((slug) => slug.startsWith(currentArg));
  }

  if (!PATH_AWARE_COMMANDS.has(commandName)) return [];

  const lastSlash = currentArg.lastIndexOf('/');
  const dirPart = lastSlash === -1 ? '' : currentArg.slice(0, lastSlash);
  const prefix = lastSlash === -1 ? currentArg : currentArg.slice(lastSlash + 1);
  const dirPath = dirPart ? resolvePath(state.cwd, dirPart) : state.cwd;
  const node = getNode(dirPath);
  if (!node || node.type !== 'dir') return [];

  return Object.keys(node.children)
    .filter((name) => name.startsWith(prefix))
    .map((name) => (dirPart ? `${dirPart}/${name}` : name));
}

// Replaces the token currently being typed with `replacement`, trailed by
// a space so the user can keep typing the next argument.
export function replaceLastToken(line: string, replacement: string): string {
  if (line.endsWith(' ') || line === '') return `${line}${replacement} `;
  const idx = line.lastIndexOf(' ');
  const prefix = idx === -1 ? '' : line.slice(0, idx + 1);
  return `${prefix}${replacement} `;
}
