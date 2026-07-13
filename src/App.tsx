import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Terminal } from './terminal/Terminal';
import { GuiMenu } from './gui/GuiMenu';
import { GuiPage } from './gui/GuiPage';
import { GuiProjects } from './gui/GuiProjects';
import { Gui404 } from './gui/Gui404';

function AppShell() {
  const { pathname } = useLocation();
  const showTerminal = pathname === '/';

  return (
    <>
      {/* Terminal stays mounted across GUI navigation (hidden via CSS, not
          unmounted) so its cwd/command history survive a round-trip to /app. */}
      <div style={{ display: showTerminal ? 'block' : 'none' }}>
        <Terminal visible={showTerminal} />
      </div>
      <Routes>
        <Route path="/" element={null} />
        <Route path="/app" element={<GuiMenu />} />
        <Route path="/app/about" element={<GuiPage slug="about" />} />
        <Route path="/app/resume" element={<GuiPage slug="resume" />} />
        <Route path="/app/projects" element={<GuiProjects />} />
        <Route path="*" element={<Gui404 />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
