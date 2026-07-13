import { getPage } from '../terminal/content';
import { renderMarkdownHtml } from './markdown';
import { GuiScreen } from './GuiScreen';
import styles from './Gui.module.css';

export function GuiPage({ slug }: { slug: string }) {
  const page = getPage(slug);
  return (
    <GuiScreen screenName={slug}>
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{
          __html: page ? renderMarkdownHtml(page.body) : '<p>Content not found.</p>',
        }}
      />
    </GuiScreen>
  );
}
