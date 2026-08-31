import { useEffect, useMemo } from 'react';
import { renderToSvg } from 'diagram-design';
import { EXAMPLES } from '../../../shared/examples.js';
import type { ThemeMode } from '../../../shared/types.js';

interface DiagramPreviewProps {
  id: string;
  theme?: ThemeMode;
}

export function DiagramPreview({ id, theme = 'light' }: DiagramPreviewProps) {
  const svg = useMemo(() => {
    const example = EXAMPLES.find((e) => e.id === id);
    if (!example) return null;
    try {
      const diagram = example.buildDiagram(example.defaultConfig, { theme });
      return renderToSvg(diagram);
    } catch {
      return null;
    }
  }, [id, theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-docs-preview-theme', theme);
  }, [theme]);

  if (!svg) {
    return (
      <figure className="diagram-preview">
        <p>Preview unavailable for diagram &ldquo;{id}&rdquo;.</p>
      </figure>
    );
  }

  return (
    <figure
      className="diagram-preview"
      aria-label={`Diagram preview: ${id}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
