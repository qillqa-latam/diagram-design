import { EXAMPLES } from '../../shared/examples.js';
import type { ExampleCategory } from '../../shared/types.js';

export interface NavItem {
  title: string;
  path: string;
}

export interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}

const CATEGORY_SLUG: Record<ExampleCategory, string> = {
  Structural: 'structural',
  Hierarchical: 'hierarchical',
  Workflow: 'workflow',
  Quantitative: 'quantitative',
  'Data Platform': 'data-platform',
  'Semantic Patterns': 'semantic-patterns',
  Importers: 'importers'
};

export function categorySlug(category: ExampleCategory): string {
  return CATEGORY_SLUG[category];
}

export function diagramPath(id: string, category: ExampleCategory): string {
  if (category === 'Semantic Patterns') {
    return `/semantic-patterns/${id}`;
  }
  if (category === 'Importers') {
    return `/guides/importers#${id}`;
  }
  return `/diagrams/${categorySlug(category)}/${id}`;
}

export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'start',
    title: 'Getting Started',
    items: [
      { title: 'Introduction', path: '/' },
      { title: 'Installation', path: '/getting-started/installation' },
      { title: 'Quick Start', path: '/getting-started/quick-start' }
    ]
  },
  {
    id: 'concepts',
    title: 'Concepts',
    items: [
      { title: 'Design Tokens', path: '/concepts/tokens' },
      { title: '4px Grid & Routing', path: '/concepts/layout-grid' },
      { title: 'Themes & Motion', path: '/concepts/themes-motion' },
      { title: 'Taste Gate', path: '/concepts/taste-gate' }
    ]
  },
  ...buildDiagramSections(),
  {
    id: 'guides',
    title: 'Guides',
    items: [
      { title: 'CLI', path: '/guides/cli' },
      { title: 'Importers', path: '/guides/importers' },
      { title: 'Export', path: '/guides/export' }
    ]
  }
];

function buildDiagramSections(): NavSection[] {
  const categories: ExampleCategory[] = [
    'Structural',
    'Hierarchical',
    'Workflow',
    'Quantitative',
    'Data Platform',
    'Semantic Patterns'
  ];

  return categories.map((category) => ({
    id: categorySlug(category),
    title: category === 'Data Platform' ? 'Data Platform' : category,
    items: EXAMPLES.filter((e) => e.category === category).map((e) => ({
      title: e.name,
      path: diagramPath(e.id, e.category)
    }))
  }));
}

export const ALL_ROUTES: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);
