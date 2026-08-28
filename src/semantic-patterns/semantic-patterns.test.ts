import { describe, it, expect } from 'vitest';
import {
  createFanInQueueDiagram,
  createStageFrameworkDiagram,
  createUnstructuredInputDiagram,
  createPolicyTracesDiagram,
  createSecurePavedRoadDiagram,
  createControlCatalogDiagram
} from './index.js';
import { renderToSvg } from '../renderers/html-renderer.js';

describe('7 Semantic Behavioral Patterns Test Suite', () => {
  it('should create Fan-in Queue / Bottleneck diagram', () => {
    const diag = createFanInQueueDiagram({
      title: 'Fan-in Ingestion Bottleneck',
      sources: [{ name: 'App Events', rate: '2k/sec' }, { name: 'Batch ETL', rate: '500/sec' }],
      queueCapacity: 10000,
      queueDepth: 8200,
      bottleneckService: { name: 'Compaction Worker', capacityRate: '800/sec' },
      admittedPath: 'Bronze S3 Table',
      deferredPath: 'Spill Bucket'
    });

    const svg = renderToSvg(diag);
    expect(svg).toContain('Fan-in Ingestion Bottleneck');
    expect(svg).toContain('Compaction Worker');
    expect(svg).toContain('Queue (8200/10000)');
  });

  it('should create Stage Framework with Semantic Slots diagram', () => {
    const diag = createStageFrameworkDiagram({
      title: 'Model Evaluation Lifecycle',
      stages: [
        {
          stage: 'Intake',
          question: 'Is dataset consented?',
          input: 'Raw prompt pairs',
          governance: 'Legal / Trust',
          output: 'Validated dataset'
        },
        {
          stage: 'Fine-Tuning',
          question: 'Does loss converge?',
          input: 'Curated tokens',
          governance: 'ML Platform',
          output: 'Checkpoint weights',
          focal: true
        }
      ]
    });

    const svg = renderToSvg(diag);
    expect(svg).toContain('Model Evaluation Lifecycle');
    expect(svg).toContain('Intake');
    expect(svg).toContain('Fine-Tuning');
  });

  it('should create Unstructured Input -> Structured Artifact diagram', () => {
    const diag = createUnstructuredInputDiagram({
      title: 'Support Elicitation Pipeline',
      utterance: 'My cluster node-04 died after OOM on kernel 6.2',
      transformName: 'Incident Schema Extractor',
      fields: [
        { key: 'node_id', value: 'node-04' },
        { key: 'root_cause', value: 'OOM' },
        { key: 'kernel', value: '6.2' }
      ]
    });

    const svg = renderToSvg(diag);
    expect(svg).toContain('Support Elicitation Pipeline');
    expect(svg).toContain('Incident Schema Extractor');
    expect(svg).toContain('Structured Record');
  });

  it('should create Paired Policy-Evaluation Traces diagram', () => {
    const diag = createPolicyTracesDiagram({
      title: 'OAuth Scope Policy Divergence',
      traceAName: 'Internal Service Token',
      traceBName: 'Public Client Token',
      rules: [
        { name: 'Issuer Check', traceA: 'PASS', traceB: 'PASS' },
        { name: 'Scope: admin', traceA: 'PASS', traceB: 'FAIL' },
        { name: 'Audit Logged', traceA: 'PASS', traceB: 'NOT REACHED' }
      ]
    });

    const svg = renderToSvg(diag);
    expect(svg).toContain('OAuth Scope Policy Divergence');
    expect(svg).toContain('Issuer Check');
    expect(svg).toContain('Scope: admin');
  });

  it('should create Secure Paved Road diagram', () => {
    const diag = createSecurePavedRoadDiagram({
      title: 'Zero-Trust Deployment Highway',
      ingressSources: ['Developer PR', 'Scheduled Job'],
      pavedRouteComponents: ['Signed Build', 'SLSA Attestation', 'Isolated Pod Cluster'],
      blockedRoute: 'Direct SSH / Manual Override'
    });

    const svg = renderToSvg(diag);
    expect(svg).toContain('Zero-Trust Deployment Highway');
    expect(svg).toContain('ISOLATED RUNTIME / TRUST ZONE');
    expect(svg).toContain('Signed Build');
  });

  it('should create Governance / Control Catalog diagram', () => {
    const diag = createControlCatalogDiagram({
      title: 'Security Controls by Enforcement Surface',
      surfaces: [
        {
          name: 'Authoring / IDE',
          controls: [
            { name: 'Secret Linting', timing: 'write', actor: 'githooks' },
            { name: 'Dependency Audit', timing: 'write', actor: 'package-manager' }
          ]
        },
        {
          name: 'CI / Merge Gate',
          controls: [
            { name: 'Branch Protection', timing: 'merge', actor: 'GitHub', focal: true },
            { name: 'Static Analysis', timing: 'merge', actor: 'SonarQube' }
          ]
        }
      ]
    });

    const svg = renderToSvg(diag);
    expect(svg).toContain('Security Controls by Enforcement Surface');
    expect(svg).toContain('AUTHORING / IDE');
    expect(svg).toContain('CI / MERGE GATE');
  });
});
