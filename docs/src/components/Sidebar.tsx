import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_SECTIONS } from '../nav.js';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <nav className="app-sidebar" aria-label="Documentation">
      {NAV_SECTIONS.map((section) => {
        const isCollapsed = collapsed[section.id] ?? false;
        return (
          <div key={section.id} className="sidebar-section">
            <button
              type="button"
              className="sidebar-section__title"
              onClick={() => toggle(section.id)}
              aria-expanded={!isCollapsed}
            >
              <span>{section.title}</span>
              <span aria-hidden="true">{isCollapsed ? '+' : '−'}</span>
            </button>
            {!isCollapsed && (
              <ul className="sidebar-section__links">
                {section.items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => (isActive ? 'active' : '')}
                      end={item.path === '/'}
                    >
                      {item.title}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}
