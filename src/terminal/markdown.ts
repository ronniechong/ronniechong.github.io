import { marked } from 'marked';
import { bold, yellow, linkStyle } from './colors';

// OSC 8 hyperlink: makes the text a real clickable link in supporting
// terminals (xterm.js included), independent of the SGR color/underline.
function hyperlink(url: string, label: string): string {
  return `\x1b]8;;${url}\x07${label}\x1b]8;;\x07`;
}

marked.use({
  renderer: {
    heading({ tokens }) {
      return `${bold(this.parser.parseInline(tokens))}\n\n`;
    },
    paragraph({ tokens }) {
      return `${this.parser.parseInline(tokens)}\n\n`;
    },
    strong({ tokens }) {
      return bold(this.parser.parseInline(tokens));
    },
    codespan({ text }) {
      return yellow(text);
    },
    code({ text }) {
      return `${yellow(text)}\n\n`;
    },
    link({ href, tokens }) {
      const label = this.parser.parseInline(tokens);
      return linkStyle(hyperlink(href, label));
    },
    list(token) {
      const items = token.items
        .map((item) => `  - ${this.parser.parseInline(item.tokens)}`)
        .join('\n');
      return `${items}\n\n`;
    },
    hr() {
      return '---\n\n';
    },
    br() {
      return '\n';
    },
    // Default renderer HTML-escapes plain text (&, <, > etc.) for HTML
    // output; we're rendering to a terminal, not HTML, so skip that.
    text(token) {
      return 'tokens' in token && token.tokens ? this.parser.parseInline(token.tokens) : token.text;
    },
  },
});

export function renderMarkdown(source: string): string {
  return (marked.parse(source, { async: false }) as string).replace(/\n{3,}/g, '\n\n').trimEnd();
}
