import type { ComponentType } from 'react';
import { DiagramPreview } from './components/DiagramPreview.js';
import { Callout } from './components/Callout.js';
import { CodeBlock } from './components/CodeBlock.js';

export const mdxComponents: Record<string, ComponentType> = {
  DiagramPreview,
  Callout,
  CodeBlock,
  pre: (props) => <pre {...props} />,
  code: (props) => <code {...props} />
};
