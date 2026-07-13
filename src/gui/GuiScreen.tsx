import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './Gui.module.css';

interface GuiScreenProps {
  children: ReactNode;
  showBackToMenu?: boolean;
}

export function GuiScreen({ children, showBackToMenu = true }: GuiScreenProps) {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {children}
        <div className={styles.backLinks}>
          {showBackToMenu && (
            <Link className={styles.backLink} to="/app">
              ← Back to menu
            </Link>
          )}
          <Link className={styles.backLink} to="/">
            ← Back to terminal
          </Link>
        </div>
      </div>
    </div>
  );
}
