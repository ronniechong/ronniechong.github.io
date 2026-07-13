import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../analytics';
import styles from './Gui.module.css';

interface GuiScreenProps {
  children: ReactNode;
  screenName: string;
  showBackToMenu?: boolean;
}

export function GuiScreen({ children, screenName, showBackToMenu = true }: GuiScreenProps) {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {children}
        <div className={styles.backLinks}>
          {showBackToMenu && (
            <Link
              className={styles.backLink}
              to="/app"
              onClick={() => trackEvent(`gui:back-to-menu:${screenName}`)}
            >
              ← Back to menu
            </Link>
          )}
          <Link
            className={styles.backLink}
            to="/"
            onClick={() => trackEvent(`gui:back-to-terminal:${screenName}`)}
          >
            ← Back to terminal
          </Link>
        </div>
      </div>
    </div>
  );
}
