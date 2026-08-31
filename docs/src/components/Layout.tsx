import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.js';
import { ThemeToggle } from './ThemeToggle.js';
import type { ThemeMode } from '../../../shared/types.js';

export function Layout() {
  const [theme, setTheme] = useState<ThemeMode>('light');

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__brand">
          <Link to="/">Diagram Design</Link>
          <span className="app-header__badge">Docs</span>
        </div>
        <div className="app-header__actions">
          <ThemeToggle value={theme} onChange={setTheme} />
          <a
            className="app-header__link"
            href="https://www.npmjs.com/package/@qillqa-latam/diagram-design"
            target="_blank"
            rel="noreferrer"
          >
            npm
          </a>
          <a
            className="app-header__link"
            href="https://github.com/qillqa-latam/diagram-design"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </header>
      <div className="app-body">
        <Sidebar />
        <main className="app-main">
          <article className="app-content prose">
            <Outlet context={{ theme }} />
          </article>
          <footer className="app-footer">
            MIT License ·{' '}
            <a href="https://github.com/qillqa-latam/diagram-design">qillqa-latam/diagram-design</a>
          </footer>
        </main>
      </div>
    </div>
  );
}
