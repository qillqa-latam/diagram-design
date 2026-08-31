import { useOutletContext } from 'react-router-dom';
import { DiagramPreview } from '../components/DiagramPreview.js';
import { EXAMPLES } from '../../../shared/examples.js';
import { categorySlug } from '../nav.js';
import type { ThemeMode } from '../../../shared/types.js';

interface OutletContext {
  theme: ThemeMode;
}

interface DiagramPageProps {
  category: string;
  id: string;
}

export function DiagramPage({ category, id }: DiagramPageProps) {
  const { theme } = useOutletContext<OutletContext>();
  const example = EXAMPLES.find((e) => e.id === id && categorySlug(e.category) === category);

  if (!example) {
    return (
      <>
        <h1>Diagram not found</h1>
        <p>No documentation page exists for &ldquo;{id}&rdquo; in category &ldquo;{category}&rdquo;.</p>
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
        Import the diagram class from <code>@qillqa-latam/diagram-design</code>, build a config object, and render
        with <code>renderToSvg</code> or <code>renderToHtml</code>.
      </p>
      <pre>
        <code>{`import { renderToSvg } from '@qillqa-latam/diagram-design';

const diagram = /* build ${example.name} */;
const svg = renderToSvg(diagram);`}</code>
      </pre>
      <p>
        See the{' '}
        <a href="https://github.com/qillqa-latam/diagram-design/blob/main/shared/examples.ts">
          shared examples
        </a>{' '}
        for a full working configuration.
      </p>
    </>
  );
}
