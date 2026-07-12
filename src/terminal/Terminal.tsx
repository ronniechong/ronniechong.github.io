import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { commands, type ShellState } from './commands';
import { formatPath } from './fs';
import { complete, replaceLastToken } from './complete';
import { green, dimGray, cyan, red } from './colors';
import styles from './Terminal.module.css';

const BACKSPACE = '';
const ENTER = '\r';
const TAB = '\t';
const ARROW_UP = '\x1b[A';
const ARROW_DOWN = '\x1b[B';

export function Terminal() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      fontFamily: 'Menlo, Consolas, monospace',
      fontSize: 20,
      theme: {
        background: '#0d0d0d',
        foreground: '#e0e0e0',
        green: '#5fd75f',
        cyan: '#56b6c2',
        red: '#e06c75',
        brightBlack: '#767676',
      },
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);
    fitAddon.fit();

    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);

    const state: ShellState = { cwd: [] };
    const prompt = () =>
      `${green('guest')}${dimGray('@ronniechong')}:${cyan(formatPath(state.cwd))}$ `;

    let line = '';
    const writePrompt = () => term.write(`\r\n${prompt()}`);

    const setLine = (newLine: string) => {
      if (line.length > 0) term.write('\b \b'.repeat(line.length));
      term.write(newLine);
      line = newLine;
    };

    const history: string[] = [];
    let historyIndex = 0;

    const runCommand = (input: string) => {
      const [name, ...args] = input.trim().split(/\s+/).filter(Boolean);
      if (!name) return;
      const handler = commands[name];
      const output = handler
        ? handler(args, state)
        : `command not found: ${name}. Type 'help' for a list of commands.`;
      if (state.pendingLink) {
        window.open(state.pendingLink, '_blank', 'noopener,noreferrer');
        state.pendingLink = undefined;
      }
      const isError = !handler || output.startsWith(`${name}: `);
      if (output) {
        output
          .split('\n')
          .forEach((outputLine) => term.write(`\r\n${isError ? red(outputLine) : outputLine}`));
      }
    };

    term.writeln("Welcome. Type 'help' to get started.");
    term.write(prompt());

    const disposable = term.onData((data) => {
      if (data === ENTER) {
        if (line.trim() && history[history.length - 1] !== line) {
          history.push(line);
        }
        historyIndex = history.length;
        runCommand(line);
        line = '';
        writePrompt();
      } else if (data === BACKSPACE) {
        if (line.length > 0) {
          line = line.slice(0, -1);
          term.write('\b \b');
        }
      } else if (data === TAB) {
        const candidates = complete(line, state);
        if (candidates.length === 1) {
          setLine(replaceLastToken(line, candidates[0]));
        } else if (candidates.length > 1) {
          term.write(`\r\n${candidates.join('  ')}`);
          writePrompt();
          term.write(line);
        }
      } else if (data === ARROW_UP) {
        if (historyIndex > 0) {
          historyIndex -= 1;
          setLine(history[historyIndex]);
        }
      } else if (data === ARROW_DOWN) {
        if (historyIndex < history.length - 1) {
          historyIndex += 1;
          setLine(history[historyIndex]);
        } else if (historyIndex < history.length) {
          historyIndex += 1;
          setLine('');
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
