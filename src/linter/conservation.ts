import type { LinterIssue } from './geometry.js';
import type { SankeyDiagramOptions } from '../diagrams/quantitative/sankey.js';

export function validateSankeyConservation(options: SankeyDiagramOptions): LinterIssue[] {
  const issues: LinterIssue[] = [];

  // 1. Column sums
  const colSums = [0, 0, 0];
  for (const node of options.nodes) {
    if (node.column >= 0 && node.column <= 2) {
      colSums[node.column] = (colSums[node.column] || 0) + node.quantity;
    }
  }

  if (colSums[0] !== colSums[1] || colSums[1] !== colSums[2]) {
    issues.push({
      rule: 'sankey-column-balance',
      severity: 'error',
      message: `Sankey column totals must balance! Col 1: ${colSums[0]}, Col 2: ${colSums[1]}, Col 3: ${colSums[2]}`
    });
  }

  // 2. Node in/out flow balance
  const inFlows = new Map<string, number>();
  const outFlows = new Map<string, number>();

  for (const flow of options.flows) {
    outFlows.set(flow.from, (outFlows.get(flow.from) || 0) + flow.quantity);
    inFlows.set(flow.to, (inFlows.get(flow.to) || 0) + flow.quantity);
  }

  for (const node of options.nodes) {
    if (node.column === 0) {
      const outSum = outFlows.get(node.id) || 0;
      if (outSum !== node.quantity) {
        issues.push({
          rule: 'sankey-flow-conservation',
          severity: 'error',
          message: `Node "${node.name}" outgoing flows (${outSum}) do not equal node quantity (${node.quantity})`
        });
      }
    } else if (node.column === 2) {
      const inSum = inFlows.get(node.id) || 0;
      if (inSum !== node.quantity) {
        issues.push({
          rule: 'sankey-flow-conservation',
          severity: 'error',
          message: `Node "${node.name}" incoming flows (${inSum}) do not equal node quantity (${node.quantity})`
        });
      }
    } else {
      // Column 1 (middle)
      const inSum = inFlows.get(node.id) || 0;
      const outSum = outFlows.get(node.id) || 0;
      if (inSum !== node.quantity || outSum !== node.quantity) {
        issues.push({
          rule: 'sankey-flow-conservation',
          severity: 'error',
          message: `Middle node "${node.name}" (qty ${node.quantity}) has in: ${inSum}, out: ${outSum}`
        });
      }
    }
  }

  return issues;
}
