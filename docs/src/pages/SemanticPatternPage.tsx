import { useOutletContext } from 'react-router-dom';
import { DiagramPreview } from '../components/DiagramPreview.js';
import { EXAMPLES } from '../../../shared/examples.js';
import type { ThemeMode } from '../../../shared/types.js';

interface OutletContext {
  theme: ThemeMode;
}

interface SemanticPatternPageProps {
  id: string;
}

export function SemanticPatternPage({ id }: SemanticPatternPageProps) {
  const { theme } = useOutletContext<OutletContext>();
  const example = EXAMPLES.find((e) => e.id === id && e.category === 'Semantic Patterns');

  if (!example) {
    return (
      <>
        <h1>Pattern not found</h1>
        <p>No documentation exists for semantic pattern &ldquo;{id}&rdquo;.</p>
      </>
    );
  }

  return (
    <>
      <h1>{example.name}</h1>
      <p>{example.description}</p>
      <DiagramPreview id={example.id} theme={theme} />
      <h2>Usage</h2>
      <p>
        Semantic patterns are factory functions that encode behavioral diagram semantics. Import from{' '}
        <code>@qillqa-latam/diagram-design</code> and pass structured arguments.
      </p>
      <pre>
        <code>{`import { renderToSvg } from '@qillqa-latam/diagram-design';

const diagram = /* create ${example.name} */;
const svg = renderToSvg(diagram);`}</code>
      </pre>
    </>
  );
}
