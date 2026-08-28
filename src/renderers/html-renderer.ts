import type { BaseDiagram } from '../diagrams/base.js';
import { GOOGLE_FONTS_LINK, FONT_FAMILIES } from '../tokens/typography.js';

export interface HtmlRenderOptions {
  includeGoogleFonts?: boolean;
  inlineCss?: string;
  customHeaderHtml?: string;
  customFooterHtml?: string;
}

export function renderToHtml(diagram: BaseDiagram, options: HtmlRenderOptions = {}): string {
  const opts = diagram.options;
  const colors = diagram.colors;
  const svgContent = diagram.renderSvg();

  const title = opts.title || 'Diagram Design';
  const eyebrow = opts.eyebrow || 'Diagram Design';
  const subtitle = opts.subtitle ? `<p class="subtitle">${opts.subtitle}</p>` : '';
  const colophon = opts.colophon || 'Rendered with Diagram Design TypeScript';

  // Summary Cards HTML
  let cardsHtml = '';
  if (opts.summaryCards && opts.summaryCards.length > 0) {
    const cardsList = opts.summaryCards.map((card, idx) => {
      const dotColorClass = card.dotColor || (idx === 0 ? 'coral' : 'ink');
      const cardEyebrow = card.eyebrow ? `<p class="eyebrow">${card.eyebrow}</p>` : '';
      const itemsList = card.items.map(item => `<li>${item}</li>`).join('\n        ');

      return `      <div class="card">
        ${cardEyebrow}
        <div class="card-header">
          <span class="card-dot ${dotColorClass}"></span>
          <h3>${card.title}</h3>
        </div>
        <ul>
        ${itemsList}
        </ul>
      </div>`;
    }).join('\n');

    cardsHtml = `
    <div class="cards-grid">
${cardsList}
    </div>`;
  }

  const containerClass = opts.framed ? 'diagram-container framed' : 'diagram-container';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link href="${GOOGLE_FONTS_LINK}" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --color-paper:   ${colors.paper};
      --color-paper-2: ${colors.paper2};
      --color-ink:     ${colors.ink};
      --color-muted:   ${colors.muted};
      --color-accent:  ${colors.accent};
      --font-sans:     ${FONT_FAMILIES.sans};
      --font-serif:    ${FONT_FAMILIES.serif};
      --font-mono:     ${FONT_FAMILIES.mono};
    }

    body {
      font-family: var(--font-sans);
      background: var(--color-paper);
      color: var(--color-ink);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem 2rem;
    }

    .frame {
      max-width: 1200px;
      width: 100%;
    }

    .eyebrow {
      font-family: var(--font-mono);
      font-size: 0.66rem;
      font-weight: 500;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--color-muted);
      margin-bottom: 0.5rem;
    }

    h1 {
      font-family: var(--font-serif);
      font-size: clamp(1.75rem, 2.4vw + 0.75rem, 2.25rem);
      font-weight: 400;
      letter-spacing: -0.02em;
      line-height: 1.15;
      color: var(--color-ink);
      margin-bottom: 0.5rem;
    }

    .subtitle {
      font-size: 0.95rem;
      color: var(--color-muted);
      margin-bottom: 1.5rem;
    }

    .${containerClass} {
      width: 100%;
      margin-bottom: 2rem;
    }

    .diagram-container.framed {
      background: var(--color-paper-2);
      border: 1px solid rgba(45,49,66,0.12);
      border-radius: 8px;
      padding: 1.5rem;
      overflow-x: auto;
    }

    svg {
      width: 100%;
      height: auto;
      display: block;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.25rem;
      margin-top: 2rem;
    }

    .card {
      background: #ffffff;
      border: 1px solid rgba(45,49,66,0.12);
      border-radius: 6px;
      padding: 1.25rem;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .card-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }
    .card-dot.coral { background: var(--color-accent); }
    .card-dot.ink { background: var(--color-ink); }
    .card-dot.muted { background: var(--color-muted); }
    .card-dot.link { background: #2e5aa8; }

    .card h3 {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--color-ink);
    }

    .card ul {
      list-style: none;
    }

    .card li {
      font-size: 0.85rem;
      color: var(--color-muted);
      margin-bottom: 0.35rem;
      line-height: 1.4;
    }

    footer {
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(45,49,66,0.10);
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--color-muted);
    }
    ${options.inlineCss || ''}
  </style>
</head>
<body>
  <div class="frame">
    <p class="eyebrow">${eyebrow}</p>
    <h1>${title}</h1>
    ${subtitle}

    <div class="${containerClass}">
      ${svgContent}
    </div>
    ${cardsHtml}

    <footer>
      ${colophon}
    </footer>
  </div>
</body>
</html>`;
}

export function renderToSvg(diagram: BaseDiagram): string {
  return diagram.renderSvg();
}
