import { ArchitectureDiagram } from '../diagrams/structural/architecture.js';
import { DataFlowDiagram } from '../diagrams/data-platform/data-flow.js';
import { ProcessDiagram } from '../diagrams/workflow/process.js';
import { FlowchartDiagram } from '../diagrams/structural/flowchart.js';
import { LayerStackDiagram } from '../diagrams/hierarchical/layers.js';
import type { BaseDiagramOptions } from '../diagrams/base.js';

// 1. Fan-in Queue / Bottleneck Pattern
export interface FanInQueueOptions extends BaseDiagramOptions {
  sources: Array<{ name: string; rate?: string }>;
  queueCapacity: number;
  queueDepth: number;
  bottleneckService: { name: string; capacityRate: string };
  admittedPath: string;
  deferredPath?: string;
}

export function createFanInQueueDiagram(options: FanInQueueOptions): DataFlowDiagram {
  const nodes = [
    ...options.sources.map((s, idx) => ({
      id: `src-${idx}`,
      name: s.name,
      sublabel: s.rate,
      tag: 'SRC',
      x: 48,
      y: 64 + idx * 80,
      width: 132,
      height: 56
    })),
    {
      id: 'queue',
      name: `Queue (${options.queueDepth}/${options.queueCapacity})`,
      sublabel: 'Finite buffer',
      tag: 'QUEUE',
      x: 260,
      y: 160,
      width: 160,
      height: 64
    },
    {
      id: 'bottleneck',
      name: options.bottleneckService.name,
      sublabel: `Cap: ${options.bottleneckService.capacityRate}`,
      tag: 'GATE',
      x: 480,
      y: 160,
      width: 160,
      height: 64,
      focal: true
    },
    {
      id: 'admitted',
      name: options.admittedPath,
      sublabel: 'Admitted',
      tag: 'OUT',
      x: 720,
      y: 120,
      width: 140,
      height: 56
    },
    ...(options.deferredPath
      ? [{
          id: 'deferred',
          name: options.deferredPath,
          sublabel: 'Backpressure / Spilled',
          tag: 'DROP',
          x: 720,
          y: 220,
          width: 140,
          height: 56,
          kind: 'optional' as const
        }]
      : [])
  ];

  const edges = [
    ...options.sources.map((_, idx) => ({
      from: `src-${idx}`,
      to: 'queue',
      label: 'Ingress'
    })),
    { from: 'queue', to: 'bottleneck', label: 'Drain' },
    { from: 'bottleneck', to: 'admitted', label: 'Admit', focal: true },
    ...(options.deferredPath
      ? [{ from: 'bottleneck', to: 'deferred', label: 'Defer' }]
      : [])
  ];

  return new DataFlowDiagram({
    ...options,
    nodes,
    edges
  });
}

// 2. Stage Framework with Semantic Slots
export interface SemanticStageSlot {
  stage: string;
  question: string;
  input: string;
  governance: string;
  output: string;
  focal?: boolean;
}

export function createStageFrameworkDiagram(options: BaseDiagramOptions & { stages: SemanticStageSlot[] }): ProcessDiagram {
  const processStages = options.stages.map(s => ({
    name: s.stage,
    actor: s.governance,
    actions: [
      `Q: ${s.question}`,
      `In: ${s.input}`,
      `Out: ${s.output}`
    ],
    focal: s.focal
  }));

  return new ProcessDiagram({
    ...options,
    stages: processStages
  });
}

// 3. Unstructured Input -> Structured Artifact
export interface UnstructuredInputOptions extends BaseDiagramOptions {
  utterance: string;
  transformName: string;
  fields: Array<{ key: string; value: string }>;
  focalField?: string;
}

export function createUnstructuredInputDiagram(options: UnstructuredInputOptions): DataFlowDiagram {
  const nodes = [
    {
      id: 'input',
      name: 'Unstructured Utterance',
      sublabel: `"${options.utterance}"`,
      tag: 'IN',
      x: 48,
      y: 160,
      width: 200,
      height: 80,
      kind: 'input' as const
    },
    {
      id: 'transform',
      name: options.transformName,
      sublabel: 'Extract & Validate',
      tag: 'TRANSFORM',
      x: 320,
      y: 160,
      width: 180,
      height: 80,
      focal: true
    },
    {
      id: 'artifact',
      name: 'Structured Record',
      sublabel: options.fields.map(f => `${f.key}: ${f.value}`).join(' | '),
      tag: 'SCHEMA',
      x: 580,
      y: 140,
      width: 260,
      height: 120,
      kind: 'backend' as const
    }
  ];

  const edges = [
    { from: 'input', to: 'transform', label: 'Elicit' },
    { from: 'transform', to: 'artifact', label: 'Emit schema', focal: true }
  ];

  return new DataFlowDiagram({
    ...options,
    nodes,
    edges
  });
}

// 4. Paired Policy-Evaluation Traces
export interface PolicyTraceRule {
  name: string;
  traceA: 'PASS' | 'FAIL' | 'SKIPPED' | 'NOT REACHED';
  traceB: 'PASS' | 'FAIL' | 'SKIPPED' | 'NOT REACHED';
}

export function createPolicyTracesDiagram(options: BaseDiagramOptions & {
  rules: PolicyTraceRule[];
  traceAName: string;
  traceBName: string;
}): FlowchartDiagram {
  const nodes = [
    { id: 'start', label: 'Request Entry', type: 'start' as const, x: 400, y: 32, width: 140, height: 44 },
    ...options.rules.map((r, idx) => ({
      id: `rule-${idx}`,
      label: r.name,
      sublabel: `${options.traceAName}: ${r.traceA} | ${options.traceBName}: ${r.traceB}`,
      type: 'decision' as const,
      x: 380,
      y: 104 + idx * 80,
      width: 180,
      height: 60,
      focal: r.traceA !== r.traceB
    })),
    { id: 'out-a', label: `${options.traceAName} Outcome`, type: 'end' as const, x: 180, y: 104 + options.rules.length * 80, width: 140, height: 48 },
    { id: 'out-b', label: `${options.traceBName} Outcome`, type: 'end' as const, x: 580, y: 104 + options.rules.length * 80, width: 140, height: 48, focal: true }
  ];

  const connections = [
    { from: 'start', to: 'rule-0', label: 'Evaluate' },
    ...options.rules.slice(0, -1).map((_, idx) => ({
      from: `rule-${idx}`,
      to: `rule-${idx + 1}`
    })),
    { from: `rule-${options.rules.length - 1}`, to: 'out-a', label: options.traceAName },
    { from: `rule-${options.rules.length - 1}`, to: 'out-b', label: options.traceBName, focal: true }
  ];

  return new FlowchartDiagram({
    ...options,
    nodes,
    connections
  });
}

// 5. Secure Paved Road
export function createSecurePavedRoadDiagram(options: BaseDiagramOptions & {
  ingressSources: string[];
  pavedRouteComponents: string[];
  blockedRoute?: string;
}): ArchitectureDiagram {
  const nodes = [
    ...options.ingressSources.map((s, idx) => ({
      id: `ing-${idx}`,
      label: s,
      tag: 'INGRESS',
      x: 48,
      y: 120 + idx * 90,
      width: 140,
      height: 60,
      kind: 'input' as const
    })),
    ...options.pavedRouteComponents.map((c, idx) => ({
      id: `paved-${idx}`,
      label: c,
      tag: 'PAVED',
      x: 260 + idx * 200,
      y: 160,
      width: 160,
      height: 64,
      focal: idx === options.pavedRouteComponents.length - 1
    })),
    ...(options.blockedRoute
      ? [{
          id: 'blocked',
          label: options.blockedRoute,
          tag: 'FORBIDDEN',
          x: 260,
          y: 280,
          width: 160,
          height: 60,
          kind: 'security' as const
        }]
      : [])
  ];

  const connections = [
    { from: 'ing-0', to: 'paved-0', label: 'Permitted', kind: 'link' as const },
    ...options.pavedRouteComponents.slice(0, -1).map((_, idx) => ({
      from: `paved-${idx}`,
      to: `paved-${idx + 1}`,
      kind: 'accent' as const,
      label: 'Signed deploy'
    }))
  ];

  const zones = [
    {
      id: 'trust-boundary',
      label: 'ISOLATED RUNTIME / TRUST ZONE',
      x: 230,
      y: 100,
      width: options.pavedRouteComponents.length * 200 + 40,
      height: 270
    }
  ];

  return new ArchitectureDiagram({
    ...options,
    zones,
    nodes,
    connections
  });
}

// 6. Governance / Control Catalog & 7. Compensating Security Layers
export function createControlCatalogDiagram(options: BaseDiagramOptions & {
  surfaces: Array<{
    name: string;
    controls: Array<{ name: string; timing: 'write' | 'merge' | 'deploy' | 'run'; actor: string; focal?: boolean }>;
  }>;
}): LayerStackDiagram {
  const layers = options.surfaces.map(s => ({
    name: s.name,
    items: s.controls.map(c => ({
      id: c.name.toLowerCase().replace(/\s+/g, '-'),
      name: `${c.name} [${c.timing}]`,
      sublabel: `Enforced by: ${c.actor}`,
      focal: c.focal
    }))
  }));

  return new LayerStackDiagram({
    ...options,
    layers
  });
}
