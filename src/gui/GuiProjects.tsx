import { projects } from '../terminal/content';
import { renderMarkdownHtml } from './markdown';
import { GuiScreen } from './GuiScreen';
import { trackEvent } from '../analytics';
import styles from './Gui.module.css';

// Project bodies open with a `# Title` heading for the terminal's `cat`/
// `open` output; the GUI already shows the title as the link above, so
// drop that leading heading line here to avoid rendering it twice.
function stripLeadingHeading(body: string): string {
  return body.replace(/^#\s+.+\n+/, '');
}

export function GuiProjects() {
  return (
    <GuiScreen screenName="projects">
      <h1>Projects</h1>
      {projects.map((project) => {
        const { title, link } = project.frontmatter;
        return (
          <div className={styles.projectCard} key={project.slug}>
            {link ? (
              <a
                className={styles.projectTitle}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent(`gui:project:${project.slug}`)}
              >
                {title ?? project.slug}
              </a>
            ) : (
              <span className={styles.projectTitle}>{title ?? project.slug}</span>
            )}
            <div
              className={styles.content}
              dangerouslySetInnerHTML={{
                __html: renderMarkdownHtml(stripLeadingHeading(project.body)),
              }}
            />
          </div>
        );
      })}
    </GuiScreen>
  );
}
