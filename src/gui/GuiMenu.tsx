import { Link } from 'react-router-dom';
import { GuiScreen } from './GuiScreen';
import { trackEvent } from '../analytics';
import styles from './Gui.module.css';

export function GuiMenu() {
  return (
    <GuiScreen screenName="menu" showBackToMenu={false}>
      <h1>&lt;ronniechong&#47;&gt;</h1>
      <p>Pick a page below, or head back to the terminal.</p>
      <ul className={styles.menuList}>
        <li>
          <Link
            className={styles.menuLink}
            to="/app/about"
            onClick={() => trackEvent('gui:menu:about')}
          >
            About
          </Link>
        </li>
        <li>
          <Link
            className={styles.menuLink}
            to="/app/resume"
            onClick={() => trackEvent('gui:menu:resume')}
          >
            Resume
          </Link>
        </li>
        <li>
          <Link
            className={styles.menuLink}
            to="/app/projects"
            onClick={() => trackEvent('gui:menu:projects')}
          >
            Projects
          </Link>
        </li>
      </ul>
    </GuiScreen>
  );
}
