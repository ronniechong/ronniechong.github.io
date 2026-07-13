import { Marked } from 'marked';

// Separate instance from terminal/markdown.ts's ANSI-terminal renderer —
// this one renders real HTML for the GUI pages. Links open in a new tab
// since they're all external (LinkedIn, GitHub, project demos).
const guiMarked = new Marked({
  renderer: {
    link({ href, title, tokens }) {
      const label = this.parser.parseInline(tokens);
      const titleAttr = title ? ` title="${title}"` : '';
      return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${label}</a>`;
    },
  },
});

export function renderMarkdownHtml(source: string): string {
  return guiMarked.parse(source, { async: false }) as string;
}
