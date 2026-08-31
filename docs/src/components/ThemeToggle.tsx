import { useEffect } from 'react';
import type { ThemeMode } from '../../../shared/types.js';

const THEMES: ThemeMode[] = ['light', 'dark', 'terminal'];

interface ThemeToggleProps {
  value: ThemeMode;
  onChange: (theme: ThemeMode) => void;
}

export function ThemeToggle({ value, onChange }: ThemeToggleProps) {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', value);
  }, [value]);

  return (
    <div className="theme-toggle" role="group" aria-label="Theme">
      {THEMES.map((theme) => (
        <button
          key={theme}
          type="button"
          className={value === theme ? 'active' : ''}
          onClick={() => onChange(theme)}
        >
          {theme}
        </button>
      ))}
    </div>
  );
}
