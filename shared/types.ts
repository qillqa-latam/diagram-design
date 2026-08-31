import type { BaseDiagram } from '../src/diagrams/base.js';

export type ExampleCategory =
  | 'Structural'
  | 'Hierarchical'
  | 'Workflow'
  | 'Quantitative'
  | 'Data Platform'
  | 'Semantic Patterns'
  | 'Importers';

export type ExampleType = 'json' | 'mermaid' | 'drawio';

export type ThemeMode = 'light' | 'dark' | 'terminal';
export type MotionMode = 'none' | 'reveal' | 'step' | 'loop';

export interface ExampleDefinition {
  id: string;
  name: string;
  category: ExampleCategory;
  type: ExampleType;
  description: string;
  defaultConfig: unknown;
  buildDiagram: (
    config: unknown,
    options: { theme?: ThemeMode; motion?: MotionMode }
  ) => BaseDiagram;
}
