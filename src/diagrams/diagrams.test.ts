import { describe, it, expect } from 'vitest';
import { ArchitectureDiagram } from './structural/architecture.js';
import { FlowchartDiagram } from './structural/flowchart.js';
import { SequenceDiagram } from './structural/sequence.js';
import { DbSchemaDiagram } from './structural/db-schema.js';
import { SankeyDiagram } from './quantitative/sankey.js';
import { LoopDiagram } from './data-platform/loop.js';
import { renderToHtml, renderToSvg } from '../renderers/html-renderer.js';

describe('Diagrams Generation Test Suite', () => {
  it('should render an ArchitectureDiagram to SVG and HTML', () => {
    const diag = new ArchitectureDiagram({
      title: 'Test Architecture',
      eyebrow: 'System Overview',
      nodes: [
        { id: 'client', label: 'Client App', tag: 'UI', x: 64, y: 160, width: 140, height: 60, kind: 'input' },
        { id: 'api', label: 'API Gateway', tag: 'GATEWAY', x: 280, y: 160, width: 140, height: 60, focal: true }
      ],
      connections: [
        { from: 'client', to: 'api', label: 'HTTPS', kind: 'accent' }
      ]
    });

    const svg = renderToSvg(diag);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Test Architecture');
    expect(svg).toContain('Client App');
    expect(svg).toContain('API Gateway');

    const html = renderToHtml(diag);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Test Architecture');
  });

  it('should render a SankeyDiagram conserving volume', () => {
    const diag = new SankeyDiagram({
      title: 'CI Compute Allocation',
      columnHeaders: ['Ingress', 'Test Stages', 'Outcomes'],
      nodes: [
        { id: 'total', name: 'CI Total', column: 0, quantity: 1000 },
        { id: 'unit', name: 'Unit Tests', column: 1, quantity: 600 },
        { id: 'e2e', name: 'E2E Tests', column: 1, quantity: 400 },
        { id: 'pass', name: 'Passed', column: 2, quantity: 900 },
        { id: 'fail', name: 'Failed', column: 2, quantity: 100, focal: true }
      ],
      flows: [
        { from: 'total', to: 'unit', quantity: 600 },
        { from: 'total', to: 'e2e', quantity: 400 },
        { from: 'unit', to: 'pass', quantity: 550 },
        { from: 'unit', to: 'fail', quantity: 50 },
        { from: 'e2e', to: 'pass', quantity: 350 },
        { from: 'e2e', to: 'fail', quantity: 50, focal: true }
      ]
    });

    const svg = renderToSvg(diag);
    expect(svg).toContain('CI Compute Allocation');
    expect(svg).toContain('Unit Tests');
    expect(svg).toContain('Passed');
  });

  it('should render a parametric LoopDiagram with central hub and spokes', () => {
    const diag = new LoopDiagram({
      title: 'The Continuous Learning Flywheel',
      hub: { name: 'Operating Model', sublabel: 'shared state' },
      stations: [
        { name: 'Observe', sublabel: 'metrics' },
        { name: 'Orient', sublabel: 'analysis' },
        { name: 'Decide', sublabel: 'approval', focal: true },
        { name: 'Act', sublabel: 'execution' },
        { name: 'Measure', sublabel: 'feedback' }
      ]
    });

    const svg = renderToSvg(diag);
    expect(svg).toContain('Operating Model');
    expect(svg).toContain('SHARED HUB');
    expect(svg).toContain('Observe');
    expect(svg).toContain('Decide');
  });

  it('should render a Database Schema diagram with column rows and FK connectors', () => {
    const diag = new DbSchemaDiagram({
      title: 'E-commerce Physical Schema',
      tables: [
        {
          id: 'users',
          name: 'users',
          schema: 'public',
          x: 64,
          y: 64,
          columns: [
            { name: 'id', type: 'uuid', isPk: true },
            { name: 'email', type: 'varchar(255)', isUnique: true }
          ]
        },
        {
          id: 'orders',
          name: 'orders',
          schema: 'public',
          x: 360,
          y: 64,
          focal: true,
          columns: [
            { name: 'id', type: 'uuid', isPk: true },
            { name: 'user_id', type: 'uuid', isFk: true },
            { name: 'total_amount', type: 'numeric(12,2)' }
          ]
        }
      ],
      foreignKeys: [
        {
          fromTable: 'orders',
          fromColumn: 'user_id',
          toTable: 'users',
          toColumn: 'id',
          action: 'CASCADE',
          focal: true
        }
      ]
    });

    const svg = renderToSvg(diag);
    expect(svg).toContain('public.users');
    expect(svg).toContain('public.orders');
    expect(svg).toContain('ON DELETE CASCADE');
  });
});
