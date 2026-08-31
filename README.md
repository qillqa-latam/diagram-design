# Diagram Design (TypeScript)

[![Documentation](https://img.shields.io/badge/docs-GitHub%20Pages-2d3142?style=flat&logo=github)](https://qillqa-latam.github.io/diagram-design/)
[![npm](https://img.shields.io/npm/v/@qillqa-latam/diagram-design)](https://www.npmjs.com/package/@qillqa-latam/diagram-design)

**Editorial diagrams your designer won't hate.**

📖 **[Documentation](https://qillqa-latam.github.io/diagram-design/)** · [npm](https://www.npmjs.com/package/@qillqa-latam/diagram-design) · [GitHub](https://github.com/qillqa-latam/diagram-design)

A modular, strongly-typed, isomorphic TypeScript library implementing the complete [Diagram Design](https://github.com/cathrynlavery/diagram-design) specification: **39 visual diagram types**, **7 behavioral semantic patterns**, strict 4px grid orthogonal routing, skinnable design tokens, accessible motion, Mermaid/Draw.io importers, and HTML/SVG/PNG export engines.

---

## Features

- **39 Visual Diagram Types**:
  - **Structural / Systems**: Architecture, IT Current-State, Flowchart, Sequence, State Machine, ER / Data Model, Deployment, Dependency Graph, UML Class, Database Schema.
  - **Hierarchical**: Tree, Org Chart, Nested, Layer Stack, High-Level.
  - **Workflow / Chronological**: Timeline, Swimlane, Gantt, Process, User Journey, Kanban, Story Map.
  - **Quantitative / Analytical**: Bar Chart, Line Chart, Scatter Plot / Bubble, Treemap, Sankey, Radar / Spider, Polar Chart / Radial Lollipop, Quadrant, Venn, Pyramid / Funnel.
  - **Data Platform & Strategic**: Medallion, Data Flow, DP Integration, DP Security Matrix, Fishbone (Ishikawa), Wardley Map, Loop / Flywheel.
- **7 Behavioral Semantic Patterns**:
  - Fan-in Queue / Bottleneck
  - Stage Framework with Semantic Slots
  - Unstructured Input → Structured Artifact
  - Paired Policy-Evaluation Traces
  - Secure Paved Road
  - Governance / Control Catalog
  - Compensating Security Layers
- **Universal Layout & Geometry Engine**:
  - Non-negotiable 4px grid alignment on all coordinates and dimensions.
  - 6 mandatory connector rules (orthogonal $r=8\text{px}$ quarter arcs, 6–10px label-to-stroke margin with paper masks, bridge/hop arcs for crossing lines, and attach-point fanning $\ge 12\text{px}$).
- **Skinnable Theming System**:
  - Semantic roles (`paper`, `paper-2`, `ink`, `muted`, `soft`, `rule`, `rule-solid`, `accent`, `accent-tint`, `link`).
  - Light, Dark, and Terminal skins + series palettes (`series-1..5`).
  - Client profile resolution (`.diagram-design` markers).
- **Primitivas & Motion**:
  - 80+ 24×24 monochrome SVG icons (`currentColor`).
  - Italic Instrument Serif annotation callouts (max 2 per figure).
  - Sketchy hand-drawn displacement filter (`feTurbulence` + `feDisplacementMap`).
  - Accessible motion engine (`none`, `reveal`, `step`, `loop`).
- **Taste Gate Linters**:
  - Geometry mask clipping detector, 4px grid linter, Sankey/Treemap volume conservation verifiers, and complexity budget checkers.
- **Importers & CLI**:
  - Redraw Mermaid (`.mmd`) and Draw.io (`.drawio`) sources into editorial diagrams.
  - Command-line interface (`diagram-design import-mermaid`, `diagram-design lint`, etc.).

---

## Installation

```bash
pnpm add @qillqa-latam/diagram-design
# or
npm install @qillqa-latam/diagram-design
```

---

## Quick Start

### 1. Architecture Diagram

```typescript
import { ArchitectureDiagram, renderToHtml, renderToSvg } from '@qillqa-latam/diagram-design';

const diagram = new ArchitectureDiagram({
  title: 'Content Site in Production',
  eyebrow: 'Architecture · Production',
  zones: [
    { id: 'content', label: 'CONTENT SERVICES', x: 616, y: 128, width: 164, height: 272 }
  ],
  nodes: [
    { id: 'reader', label: 'Reader', sublabel: 'Browser', tag: 'EXT', x: 40, y: 240, width: 128, height: 64, kind: 'input' },
    { id: 'edge', label: 'Cloudflare', sublabel: 'CDN & WAF', tag: 'EDGE', x: 220, y: 240, width: 144, height: 64, kind: 'backend' },
    { id: 'origin', label: 'Astro Origin', sublabel: 'SSR / Node', tag: 'CORE', x: 416, y: 240, width: 160, height: 64, focal: true }
  ],
  connections: [
    { from: 'reader', to: 'edge', label: 'HTTPS', kind: 'link' },
    { from: 'edge', to: 'origin', label: 'SSR', kind: 'accent' }
  ]
});

// Render as standalone SVG or full editorial HTML
const svg = renderToSvg(diagram);
const html = renderToHtml(diagram);
```

### 2. Sankey Volume Flow

```typescript
import { SankeyDiagram, renderToSvg } from '@qillqa-latam/diagram-design';

const sankey = new SankeyDiagram({
  title: 'CI Compute Allocation',
  columnHeaders: ['Ingress', 'Stage', 'Outcome'],
  nodes: [
    { id: 'total', name: 'Total CI', column: 0, quantity: 12000 },
    { id: 'tests', name: 'Unit & E2E', column: 1, quantity: 9200 },
    { id: 'build', name: 'Build', column: 1, quantity: 2800 },
    { id: 'pass', name: 'Passed', column: 2, quantity: 10400 },
    { id: 'fail', name: 'Failed', column: 2, quantity: 1600, focal: true }
  ],
  flows: [
    { from: 'total', to: 'tests', quantity: 9200 },
    { from: 'total', to: 'build', quantity: 2800 },
    { from: 'tests', to: 'pass', quantity: 8000 },
    { from: 'tests', to: 'fail', quantity: 1200 },
    { from: 'build', to: 'pass', quantity: 2400 },
    { from: 'build', to: 'fail', quantity: 400, focal: true }
  ]
});

const svg = renderToSvg(sankey);
```

### 3. Parametric Loop / Flywheel

```typescript
import { LoopDiagram, renderToSvg } from '@qillqa-latam/diagram-design';

const loop = new LoopDiagram({
  title: 'The Self-Improving Operating Loop',
  hub: { name: 'Shared Memory', sublabel: 'one record, every loop' },
  stations: [
    { name: 'Capture', sublabel: 'signals in', spokeLabel: 'SIGNALS' },
    { name: 'Research', sublabel: 'evidence' },
    { name: 'Decide', sublabel: 'approval', focal: true },
    { name: 'Act', sublabel: 'work ships', spokeLabel: 'OUTCOMES' },
    { name: 'Learn', sublabel: 'playbook updated' }
  ]
});

const svg = renderToSvg(loop);
```

### 4. Semantic Behavioral Patterns

```typescript
import { createFanInQueueDiagram, renderToSvg } from '@qillqa-latam/diagram-design';

const queueDiagram = createFanInQueueDiagram({
  title: 'Real-time Event Ingestion Bottleneck',
  sources: [
    { name: 'Mobile App', rate: '12k/s' },
    { name: 'Web Store', rate: '8k/s' }
  ],
  queueCapacity: 50000,
  queueDepth: 42000,
  bottleneckService: { name: 'Kafka Consumer Group', capacityRate: '15k/s' },
  admittedPath: 'ClickHouse Lakehouse',
  deferredPath: 'S3 Spill Bucket'
});
```

---

## CLI Usage

```bash
# Convert a Mermaid diagram into an editorial SVG or HTML
npx @qillqa-latam/diagram-design import-mermaid architecture.mmd -f html -o architecture.html

# Validate a diagram against the Taste Gate
npx @qillqa-latam/diagram-design lint architecture.html
```

---

## Documentation

Full documentation is published at **[qillqa-latam.github.io/diagram-design](https://qillqa-latam.github.io/diagram-design/)**.

```bash
# Run the documentation site locally
pnpm dev:docs

# Build static site for GitHub Pages
pnpm build:docs
```

---

## Interactive Playground

`diagram-design` includes an interactive web playground to preview, live-edit, and lint all 39 diagram types, 7 semantic patterns, and Mermaid/Draw.io importers.

```bash
# Launch the interactive local development playground
pnpm playground
# or
pnpm dev:playground
```

The playground is strictly isolated from npm/pnpm distributables and will never be bundled in the published package.

---

## License

MIT
