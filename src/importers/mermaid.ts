import { FlowchartDiagram } from '../diagrams/structural/flowchart.js';
import { SequenceDiagram } from '../diagrams/structural/sequence.js';
import { StateMachineDiagram } from '../diagrams/structural/state-machine.js';
import { ErDiagram } from '../diagrams/structural/er.js';
import type { BaseDiagram } from '../diagrams/base.js';

export interface MermaidImportOptions {
  title?: string;
  detail?: 'simplified' | 'balanced' | 'faithful';
  theme?: 'light' | 'dark' | 'terminal';
}

export function importMermaid(mermaidSource: string, options: MermaidImportOptions = {}): BaseDiagram {
  const clean = mermaidSource.trim();
  const title = options.title || 'Redrawn Mermaid Diagram';

  // 1. Sequence Diagram
  if (/^sequenceDiagram/m.test(clean)) {
    const lines = clean.split('\n');
    const participants: string[] = [];
    const messages: Array<{ from: string; to: string; label: string; kind?: 'sync' | 'return' | 'async' }> = [];

    for (const line of lines) {
      const trimmed = line.trim();
      const pMatch = trimmed.match(/^participant\s+(?:"([^"]+)"|(\w+))(?:\s+as\s+(\w+))?/);
      if (pMatch) {
        const id = pMatch[3] || pMatch[2] || pMatch[1]!;
        if (!participants.includes(id)) participants.push(id);
        continue;
      }

      const msgMatch = trimmed.match(/^(\w+)\s*(-->>|->>|-->|->)\s*(\w+)\s*:\s*(.+)$/);
      if (msgMatch) {
        const from = msgMatch[1]!;
        const arrow = msgMatch[2]!;
        const to = msgMatch[3]!;
        const label = msgMatch[4]!.trim();

        if (!participants.includes(from)) participants.push(from);
        if (!participants.includes(to)) participants.push(to);

        const kind = arrow === '-->>' || arrow === '-->' ? 'return' : arrow === '->>' ? 'sync' : 'async';
        messages.push({ from, to, label, kind });
      }
    }

    const actors = participants.map((p, idx) => ({
      id: p,
      label: p,
      focal: idx === 0
    }));

    const stepY = 56;
    const seqMessages = messages.map((m, idx) => ({
      from: m.from,
      to: m.to,
      label: m.label,
      kind: m.kind,
      y: 120 + idx * stepY
    }));

    return new SequenceDiagram({
      title,
      theme: options.theme || 'light',
      actors,
      messages: seqMessages
    });
  }

  // 2. State Machine Diagram
  if (/^stateDiagram(?:-v2)?/m.test(clean)) {
    const lines = clean.split('\n');
    const states = new Set<string>();
    const transitions: Array<{ from: string; to: string; event: string }> = [];

    for (const line of lines) {
      const match = line.trim().match(/^(\w+|\[\*\])\s*-->\s*(\w+|\[\*\])(?:\s*:\s*(.+))?$/);
      if (match) {
        const from = match[1] === '[*]' ? 'start' : match[1]!;
        const to = match[2] === '[*]' ? 'end' : match[2]!;
        const event = match[3]?.trim() || '';

        states.add(from);
        states.add(to);
        transitions.push({ from, to, event });
      }
    }

    const stateNodes = Array.from(states).map((s, idx) => ({
      id: s,
      label: s === 'start' ? 'Start' : s === 'end' ? 'End' : s,
      isInitial: s === 'start',
      isFinal: s === 'end',
      x: 64 + idx * 160,
      y: 180,
      focal: idx === 1
    }));

    return new StateMachineDiagram({
      title,
      theme: options.theme || 'light',
      states: stateNodes,
      transitions
    });
  }

  // 3. ER Diagram
  if (/^erDiagram/m.test(clean)) {
    const lines = clean.split('\n');
    const entities = new Map<string, Array<{ name: string; type?: string }>>();
    const rels: Array<{ from: string; to: string; label?: string; cardinality?: string }> = [];

    for (const line of lines) {
      const trimmed = line.trim();
      const relMatch = trimmed.match(/^(\w+)\s+([|o}{]+--[|o}{]+)\s+(\w+)\s*:\s*(.+)$/);
      if (relMatch) {
        const from = relMatch[1]!;
        const to = relMatch[3]!;
        const label = relMatch[4]!.replace(/"/g, '').trim();
        if (!entities.has(from)) entities.set(from, []);
        if (!entities.has(to)) entities.set(to, []);
        rels.push({ from, to, label });
      }
    }

    const entityList = Array.from(entities.keys()).map((name, idx) => ({
      id: name,
      name,
      x: 64 + idx * 220,
      y: 120,
      fields: [
        { name: 'id', type: 'uuid', isPk: true },
        { name: 'created_at', type: 'timestamptz' }
      ],
      focal: idx === 0
    }));

    return new ErDiagram({
      title,
      theme: options.theme || 'light',
      entities: entityList,
      relationships: rels
    });
  }

  // 4. Default: Flowchart / Graph
  const lines = clean.split('\n');
  const nodeMap = new Map<string, { label: string; type: 'step' | 'decision' | 'start' | 'end' }>();
  const connections: Array<{ from: string; to: string; label?: string }> = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // e.g. A[Label] -->|Yes| B{Decision}
    const arrowMatch = trimmed.match(/^(\w+)(?:\[(.*?)\]|\{(.*?)\})?\s*-->\s*(?:\|(.*?)\|\s*)?(\w+)(?:\[(.*?)\]|\{(.*?)\})?$/);
    if (arrowMatch) {
      const fromId = arrowMatch[1]!;
      const fromStepLabel = arrowMatch[2];
      const fromDecLabel = arrowMatch[3];
      const edgeLabel = arrowMatch[4];
      const toId = arrowMatch[5]!;
      const toStepLabel = arrowMatch[6];
      const toDecLabel = arrowMatch[7];

      if (!nodeMap.has(fromId)) {
        nodeMap.set(fromId, {
          label: fromDecLabel || fromStepLabel || fromId,
          type: fromDecLabel ? 'decision' : 'step'
        });
      }
      if (!nodeMap.has(toId)) {
        nodeMap.set(toId, {
          label: toDecLabel || toStepLabel || toId,
          type: toDecLabel ? 'decision' : 'step'
        });
      }

      connections.push({ from: fromId, to: toId, label: edgeLabel });
    }
  }

  const nodes = Array.from(nodeMap.entries()).map(([id, info], idx) => ({
    id,
    label: info.label,
    type: info.type,
    x: 100 + (idx % 3) * 220,
    y: 80 + Math.floor(idx / 3) * 120,
    focal: idx === 0
  }));

  return new FlowchartDiagram({
    title,
    theme: options.theme || 'light',
    nodes,
    connections
  });
}
