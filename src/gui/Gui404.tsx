import { notFound } from '../terminal/content';
import { renderMarkdownHtml } from './markdown';
import { GuiScreen } from './GuiScreen';
import styles from './Gui.module.css';

export function Gui404() {
  return (
    <GuiScreen>
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: renderMarkdownHtml(notFound.body) }}
      />
    </GuiScreen>
  );
}
