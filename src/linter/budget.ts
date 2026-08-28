import type { LinterIssue } from './geometry.js';

export interface DiagramComplexityMetrics {
  nodeCount?: number;
  arrowCount?: number;
  focalCount?: number;
  maxNodesBudget?: number;
  maxArrowsBudget?: number;
  maxFocalBudget?: number;
}

export function validateComplexityBudget(metrics: DiagramComplexityMetrics): LinterIssue[] {
  const issues: LinterIssue[] = [];
  const maxNodes = metrics.maxNodesBudget ?? 9;
  const maxArrows = metrics.maxArrowsBudget ?? 12;
  const maxFocal = metrics.maxFocalBudget ?? 2;

  if (metrics.nodeCount !== undefined && metrics.nodeCount > maxNodes) {
    issues.push({
      rule: 'complexity-node-budget',
      severity: 'warning',
      message: `Node count (${metrics.nodeCount}) exceeds recommended budget of ${maxNodes}. Consider splitting into overview + detail.`
    });
  }

  if (metrics.arrowCount !== undefined && metrics.arrowCount > maxArrows) {
    issues.push({
      rule: 'complexity-arrow-budget',
      severity: 'warning',
      message: `Arrow count (${metrics.arrowCount}) exceeds recommended budget of ${maxArrows}.`
    });
  }

  if (metrics.focalCount !== undefined && metrics.focalCount > maxFocal) {
    issues.push({
      rule: 'complexity-focal-budget',
      severity: 'error',
      message: `Coral/accent focal elements (${metrics.focalCount}) exceed hard rule of ${maxFocal}. Coral is editorial signal, not a flag.`
    });
  }

  return issues;
}
