import { describe, it, expect } from 'vitest';
import { importMermaid } from './mermaid.js';
import { importDrawio } from './drawio.js';
import { renderToSvg } from '../renderers/html-renderer.js';

describe('Importers Test Suite', () => {
  it('should import Mermaid Sequence diagram and render to Diagram Design SVG', () => {
    const mermaid = `
sequenceDiagram
  participant Alice
  participant Bob
  Alice->>Bob: Hello Bob
  Bob-->>Alice: Hi Alice
    `;
    const diagram = importMermaid(mermaid, { title: 'Imported Sequence' });
    const svg = renderToSvg(diagram);

    expect(svg).toContain('Imported Sequence');
    expect(svg).toContain('Alice');
    expect(svg).toContain('Bob');
    expect(svg).toContain('Hello Bob');
  });

  it('should import Mermaid State Machine diagram', () => {
    const mermaid = `
stateDiagram-v2
  [*] --> Idle
  Idle --> Processing : EventReceived
  Processing --> [*]
    `;
    const diagram = importMermaid(mermaid, { title: 'Imported State Machine' });
    const svg = renderToSvg(diagram);

    expect(svg).toContain('Imported State Machine');
    expect(svg).toContain('Idle');
    expect(svg).toContain('Processing');
  });

  it('should import Mermaid Flowchart diagram', () => {
    const mermaid = `
graph TD
  A[Login] --> B{Authenticated?}
  B -->|Yes| C[Dashboard]
  B -->|No| D[Error Screen]
    `;
    const diagram = importMermaid(mermaid, { title: 'Imported Flowchart' });
    const svg = renderToSvg(diagram);

    expect(svg).toContain('Imported Flowchart');
    expect(svg).toContain('Login');
    expect(svg).toContain('Authenticated?');
  });

  it('should import Draw.io XML structure', () => {
    const drawioXml = `
<mxfile>
  <diagram id="d1" name="Page-1">
    <mxGraphModel>
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <mxCell id="n1" value="Web Server" vertex="1" parent="1">
          <mxGeometry x="80" y="100" width="140" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="n2" value="Database" vertex="1" parent="1">
          <mxGeometry x="320" y="100" width="140" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="e1" value="SQL Query" edge="1" source="n1" target="n2" parent="1">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
    `;
    const diagram = importDrawio(drawioXml, { title: 'Imported Drawio' });
    const svg = renderToSvg(diagram);

    expect(svg).toContain('Imported Drawio');
    expect(svg).toContain('Web Server');
    expect(svg).toContain('Database');
  });
});
