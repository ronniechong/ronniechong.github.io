import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { commands } from './commands';
import styles from './Terminal.module.css';

const PROMPT = 'guest@ronniechong:~$ ';
const BACKSPACE = '';
const ENTER = '\r';

export function Terminal() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      fontFamily: 'Menlo, Consolas, monospace',
      fontSize: 14,
      theme: {
        background: '#0d0d0d',
        foreground: '#e0e0e0',
      },
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);
    fitAddon.fit();

    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);

    let line = '';
    const writePrompt = () => term.write(`\r\n${PROMPT}`);

    const runCommand = (input: string) => {
      const [name, ...args] = input.trim().split(/\s+/).filter(Boolean);
      if (!name) return;
      const handler = commands[name];
      const output = handler
        ? handler(args)
        : `command not found: ${name}. Type 'help' for a list of commands.`;
      output.split('\n').forEach((outputLine) => term.write(`\r\n${outputLine}`));
    };

    term.writeln("Welcome. Type 'help' to get started.");
    term.write(PROMPT);

    const disposable = term.onData((data) => {
      if (data === ENTER) {
        runCommand(line);
        line = '';
        writePrompt();
      } else if (data === BACKSPACE) {
        if (line.length > 0) {
          line = line.slice(0, -1);
          term.write('\b \b');
        }
      } else if (data.charCodeAt(0) >= 32) {
        line += data;
        term.write(data);
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      disposable.dispose();
      term.dispose();
    };
  }, []);

  return <div ref={containerRef} className={styles.terminal} />;
}
