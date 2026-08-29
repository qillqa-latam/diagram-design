import {
  // Structural
  ArchitectureDiagram,
  ItStateDiagram,
  FlowchartDiagram,
  SequenceDiagram,
  StateMachineDiagram,
  ErDiagram,
  DeploymentDiagram,
  DependencyDiagram,
  UmlClassDiagram,
  DbSchemaDiagram,
  // Hierarchical
  TreeDiagram,
  OrgChartDiagram,
  NestedDiagram,
  LayerStackDiagram,
  HighLevelDiagram,
  // Workflow
  TimelineDiagram,
  SwimlaneDiagram,
  GanttDiagram,
  ProcessDiagram,
  UserJourneyDiagram,
  KanbanDiagram,
  StoryMapDiagram,
  // Quantitative
  BarChartDiagram,
  LineChartDiagram,
  ScatterPlotDiagram,
  TreemapDiagram,
  SankeyDiagram,
  RadarDiagram,
  PolarChartDiagram,
  QuadrantDiagram,
  VennDiagram,
  PyramidDiagram,
  // Data Platform & Strategic
  MedallionDiagram,
  DataFlowDiagram,
  DpIntegrationDiagram,
  DpSecurityMatrixDiagram,
  FishboneDiagram,
  WardleyMapDiagram,
  LoopDiagram,
  // Semantic Patterns
  createFanInQueueDiagram,
  createStageFrameworkDiagram,
  createUnstructuredInputDiagram,
  createPolicyTracesDiagram,
  createSecurePavedRoadDiagram,
  createControlCatalogDiagram,
  // Importers
  importMermaid,
  importDrawio,
  // Base
  type BaseDiagram
} from 'diagram-design';

export interface ExampleDefinition {
  id: string;
  name: string;
  category: 'Structural' | 'Hierarchical' | 'Workflow' | 'Quantitative' | 'Data Platform' | 'Semantic Patterns' | 'Importers';
  type: 'json' | 'mermaid' | 'drawio';
  description: string;
  defaultConfig: any;
  buildDiagram: (config: any, options: { theme?: 'light' | 'dark' | 'terminal'; motion?: 'none' | 'reveal' | 'step' | 'loop' }) => BaseDiagram;
}

export const EXAMPLES: ExampleDefinition[] = [
  // ==========================================
  // STRUCTURAL / SYSTEMS
  // ==========================================
  {
    id: 'architecture',
    name: 'Architecture Diagram',
    category: 'Structural',
    type: 'json',
    description: 'System topology with zones, focal services, and orthogonal connections.',
    defaultConfig: {
      title: 'Content Site in Production',
      eyebrow: 'Architecture · Production Topology',
      subtitle: 'Orthogonal routing with edge CDN ingress and isolated origin cluster.',
      framed: true,
      summaryCards: [
        { title: 'Edge Layer', eyebrow: 'Ingress', dotColor: 'coral', items: ['Cloudflare CDN & WAF', 'Global Anycast DNS'] },
        { title: 'Core Cluster', eyebrow: 'Backend', dotColor: 'ink', items: ['Astro Node SSR Origin', 'PostgreSQL Primary + Replica'] }
      ],
      zones: [
        { id: 'content', label: 'ORIGIN & DATA SERVICES', x: 400, y: 128, width: 380, height: 260 }
      ],
      nodes: [
        { id: 'reader', label: 'Reader', sublabel: 'Browser Client', tag: 'EXT', x: 48, y: 220, width: 132, height: 60, kind: 'input' },
        { id: 'edge', label: 'Cloudflare', sublabel: 'CDN & WAF', tag: 'EDGE', x: 220, y: 220, width: 140, height: 60, kind: 'backend' },
        { id: 'origin', label: 'Astro Origin', sublabel: 'SSR / Node', tag: 'CORE', x: 424, y: 220, width: 152, height: 60, focal: true },
        { id: 'db', label: 'PostgreSQL', sublabel: 'Primary Replica', tag: 'STORAGE', x: 620, y: 220, width: 140, height: 60, kind: 'storage' }
      ],
      connections: [
        { from: 'reader', to: 'edge', label: 'HTTPS', kind: 'link' },
        { from: 'edge', to: 'origin', label: 'SSR Request', kind: 'accent' },
        { from: 'origin', to: 'db', label: 'SQL Connection', kind: 'link' }
      ]
    },
    buildDiagram: (config, opts) => new ArchitectureDiagram({ ...config, ...opts })
  },
  {
    id: 'it-state',
    name: 'IT Current-State Diagram',
    category: 'Structural',
    type: 'json',
    description: 'Enterprise IT estate showing target status, sunset systems, and operational health.',
    defaultConfig: {
      title: 'Global Core Banking IT Estate',
      eyebrow: 'IT State · Q3 Audit',
      systems: [
        { id: 'legacy-core', name: 'Legacy Core Host', status: 'critical', owner: 'Mainframe Ops', tier: 'Tier 1' },
        { id: 'auth-gateway', name: 'OAuth Identity Platform', status: 'healthy', owner: 'SecOps', tier: 'Tier 0', focal: true },
        { id: 'batch-etl', name: 'Nightly Batch Settlement', status: 'sunset', owner: 'Data Ops', tier: 'Tier 2' },
        { id: 'mobile-api', name: 'Omnichannel API', status: 'healthy', owner: 'App Team', tier: 'Tier 1' }
      ]
    },
    buildDiagram: (config, opts) => new ItStateDiagram({ ...config, ...opts })
  },
  {
    id: 'flowchart',
    name: 'Flowchart Diagram',
    category: 'Structural',
    type: 'json',
    description: 'Branching logic, decisions, and sequential execution paths.',
    defaultConfig: {
      title: 'Payment Authorization Decision Flow',
      eyebrow: 'Workflow · Fraud Engine',
      nodes: [
        { id: 'start', label: 'Incoming Order', type: 'start', x: 380, y: 48, width: 140, height: 44 },
        { id: 'check-fraud', label: 'Risk Score < 30?', type: 'decision', x: 370, y: 132, width: 160, height: 56, focal: true },
        { id: 'auto-capture', label: 'Instant Capture', type: 'process', x: 180, y: 236, width: 152, height: 52 },
        { id: 'manual-review', label: 'Manual Review Queue', type: 'process', x: 560, y: 236, width: 160, height: 52 },
        { id: 'end-ok', label: 'Order Confirmed', type: 'end', x: 180, y: 336, width: 152, height: 48 },
        { id: 'end-reject', label: 'Order Rejected', type: 'end', x: 560, y: 336, width: 160, height: 48 }
      ],
      connections: [
        { from: 'start', to: 'check-fraud', label: 'Evaluate' },
        { from: 'check-fraud', to: 'auto-capture', label: 'Pass (Low Risk)', kind: 'link' },
        { from: 'check-fraud', to: 'manual-review', label: 'Flagged (High Risk)', kind: 'accent' },
        { from: 'auto-capture', to: 'end-ok', label: 'Captured' },
        { from: 'manual-review', to: 'end-reject', label: 'Declined' }
      ]
    },
    buildDiagram: (config, opts) => new FlowchartDiagram({ ...config, ...opts })
  },
  {
    id: 'sequence',
    name: 'Sequence Diagram',
    category: 'Structural',
    type: 'json',
    description: 'Time-ordered interaction traces between lifelines.',
    defaultConfig: {
      title: 'OAuth 2.0 Authorization Code Grant with PKCE',
      eyebrow: 'Security · Auth Flow',
      participants: [
        { id: 'user', name: 'User / Browser' },
        { id: 'client', name: 'SPA Client' },
        { id: 'authz', name: 'Authz Server', focal: true },
        { id: 'api', name: 'Resource API' }
      ],
      messages: [
        { from: 'user', to: 'client', label: 'Click Login' },
        { from: 'client', to: 'authz', label: 'GET /authorize + code_challenge' },
        { from: 'authz', to: 'user', label: 'Render Consent Screen' },
        { from: 'user', to: 'authz', label: 'Approve Scopes' },
        { from: 'authz', to: 'client', label: 'Redirect with Auth Code' },
        { from: 'client', to: 'authz', label: 'POST /token + code_verifier', focal: true },
        { from: 'authz', to: 'client', label: 'Return JWT Access Token' },
        { from: 'client', to: 'api', label: 'GET /api/profile (Bearer JWT)' }
      ]
    },
    buildDiagram: (config, opts) => new SequenceDiagram({ ...config, ...opts })
  },
  {
    id: 'state-machine',
    name: 'State Machine Diagram',
    category: 'Structural',
    type: 'json',
    description: 'State transitions, trigger events, and guarded state bounds.',
    defaultConfig: {
      title: 'Subscription Lifecycle State Machine',
      eyebrow: 'Billing · State Machine',
      states: [
        { id: 'trial', name: 'Trialing', sublabel: '14 days left', x: 80, y: 140, width: 140, height: 60 },
        { id: 'active', name: 'Active', sublabel: 'Paid tier', x: 300, y: 140, width: 140, height: 60, focal: true },
        { id: 'past_due', name: 'Past Due', sublabel: 'Grace period', x: 520, y: 140, width: 140, height: 60 },
        { id: 'canceled', name: 'Canceled', sublabel: 'Churned', x: 740, y: 140, width: 140, height: 60 }
      ],
      transitions: [
        { from: 'trial', to: 'active', label: 'Card Charged' },
        { from: 'active', to: 'past_due', label: 'Charge Failed' },
        { from: 'past_due', to: 'active', label: 'Retry Success' },
        { from: 'past_due', to: 'canceled', label: 'Grace Expired' }
      ]
    },
    buildDiagram: (config, opts) => new StateMachineDiagram({ ...config, ...opts })
  },
  {
    id: 'er',
    name: 'Entity Relationship Diagram',
    category: 'Structural',
    type: 'json',
    description: 'Logical entities, attributes, primary keys, and cardinalities.',
    defaultConfig: {
      title: 'E-commerce Core Domain Model',
      eyebrow: 'Domain Model · Relational',
      entities: [
        { id: 'customer', name: 'Customer', attributes: ['id (UUID, PK)', 'email (VARCHAR)', 'created_at (TIMESTAMP)'], x: 60, y: 80, width: 180, height: 120 },
        { id: 'order', name: 'Order', attributes: ['id (UUID, PK)', 'customer_id (FK)', 'total (DECIMAL)', 'status (ENUM)'], x: 340, y: 80, width: 180, height: 136, focal: true },
        { id: 'item', name: 'OrderItem', attributes: ['id (UUID, PK)', 'order_id (FK)', 'product_id (FK)', 'qty (INT)'], x: 620, y: 80, width: 180, height: 136 }
      ],
      relationships: [
        { from: 'customer', to: 'order', label: '1 : N (places)' },
        { from: 'order', to: 'item', label: '1 : N (contains)', focal: true }
      ]
    },
    buildDiagram: (config, opts) => new ErDiagram({ ...config, ...opts })
  },
  {
    id: 'deployment',
    name: 'Deployment Diagram',
    category: 'Structural',
    type: 'json',
    description: 'Infrastructure clusters, availability zones, and hardware allocations.',
    defaultConfig: {
      title: 'Multi-Region Kubernetes Edge Architecture',
      eyebrow: 'Infrastructure · AWS Deployment',
      nodes: [
        { id: 'nlb', name: 'AWS Network Load Balancer', type: 'LoadBalancer', x: 60, y: 160, width: 160, height: 64 },
        { id: 'k8s-us-east', name: 'EKS Cluster (us-east-1)', type: 'Kubernetes Cluster', x: 300, y: 90, width: 220, height: 90, focal: true },
        { id: 'k8s-eu-west', name: 'EKS Cluster (eu-west-1)', type: 'Kubernetes Cluster', x: 300, y: 220, width: 220, height: 90 },
        { id: 'aurora', name: 'Aurora Global Database', type: 'Database Engine', x: 600, y: 160, width: 200, height: 72 }
      ],
      connections: [
        { from: 'nlb', to: 'k8s-us-east', label: 'Traffic Route' },
        { from: 'nlb', to: 'k8s-eu-west', label: 'Traffic Route' },
        { from: 'k8s-us-east', to: 'aurora', label: 'Write Primary', focal: true },
        { from: 'k8s-eu-west', to: 'aurora', label: 'Read Replica' }
      ]
    },
    buildDiagram: (config, opts) => new DeploymentDiagram({ ...config, ...opts })
  },
  {
    id: 'dependency',
    name: 'Dependency Graph',
    category: 'Structural',
    type: 'json',
    description: 'Software module dependencies, acyclic graphs, and impact cascades.',
    defaultConfig: {
      title: 'Monorepo Package Dependency Topology',
      eyebrow: 'Build Graph · Turborepo',
      nodes: [
        { id: 'app', name: '@repo/web-app', layer: 'Application', x: 60, y: 140, width: 160, height: 56 },
        { id: 'ui', name: '@repo/ui-kit', layer: 'Design System', x: 300, y: 80, width: 160, height: 56, focal: true },
        { id: 'api-client', name: '@repo/api-client', layer: 'SDK', x: 300, y: 200, width: 160, height: 56 },
        { id: 'tokens', name: '@repo/tokens', layer: 'Core Tokens', x: 560, y: 140, width: 160, height: 56 }
      ],
      dependencies: [
        { from: 'app', to: 'ui', label: 'imports' },
        { from: 'app', to: 'api-client', label: 'imports' },
        { from: 'ui', to: 'tokens', label: 'depends on', focal: true }
      ]
    },
    buildDiagram: (config, opts) => new DependencyDiagram({ ...config, ...opts })
  },
  {
    id: 'uml-class',
    name: 'UML Class Diagram',
    category: 'Structural',
    type: 'json',
    description: 'Object-oriented class structures, methods, fields, and inheritance.',
    defaultConfig: {
      title: 'Payment Processor Class Hierarchy',
      eyebrow: 'OOP Architecture · Core Module',
      classes: [
        {
          id: 'base-processor',
          name: 'PaymentProcessor',
          isAbstract: true,
          attributes: ['- apiKey: string', '# timeout: number'],
          methods: ['+ processPayment(amount: number): Result', '+ refund(txId: string): boolean'],
          x: 60,
          y: 70,
          width: 260,
          height: 140
        },
        {
          id: 'stripe-processor',
          name: 'StripeProcessor',
          attributes: ['- stripeClient: Stripe', '- webhookSecret: string'],
          methods: ['+ createPaymentIntent(): Intent', '+ processPayment(amount: number): Result'],
          x: 400,
          y: 70,
          width: 260,
          height: 140,
          focal: true
        }
      ],
      relations: [
        { from: 'stripe-processor', to: 'base-processor', type: 'extends', label: 'implements' }
      ]
    },
    buildDiagram: (config, opts) => new UmlClassDiagram({ ...config, ...opts })
  },
  {
    id: 'db-schema',
    name: 'Database Schema Diagram',
    category: 'Structural',
    type: 'json',
    description: 'Physical database tables with columns, primary/foreign keys, and data types.',
    defaultConfig: {
      title: 'E-commerce Physical Schema',
      eyebrow: 'Relational Database · PostgreSQL',
      tables: [
        {
          id: 'users',
          name: 'users',
          schema: 'public',
          x: 64,
          y: 64,
          columns: [
            { name: 'id', type: 'uuid', isPk: true },
            { name: 'email', type: 'varchar(255)', isUnique: true },
            { name: 'created_at', type: 'timestamptz' }
          ]
        },
        {
          id: 'orders',
          name: 'orders',
          schema: 'public',
          x: 380,
          y: 64,
          focal: true,
          columns: [
            { name: 'id', type: 'uuid', isPk: true },
            { name: 'user_id', type: 'uuid', isFk: true },
            { name: 'total_amount', type: 'numeric(12,2)' },
            { name: 'status', type: 'order_status' }
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
    },
    buildDiagram: (config, opts) => new DbSchemaDiagram({ ...config, ...opts })
  },

  // ==========================================
  // HIERARCHICAL
  // ==========================================
  {
    id: 'tree',
    name: 'Tree Diagram',
    category: 'Hierarchical',
    type: 'json',
    description: 'Branching tree nodes and hierarchical parent-child taxonomies.',
    defaultConfig: {
      title: 'Content Taxonomy Category Hierarchy',
      eyebrow: 'Taxonomy · Tree Structure',
      root: {
        id: 'root',
        label: 'Design Engineering',
        children: [
          {
            id: 'foundations',
            label: 'Foundations',
            children: [
              { id: 'tokens', label: 'Design Tokens' },
              { id: 'grid', label: '4px Orthogonal Grid', focal: true }
            ]
          },
          {
            id: 'components',
            label: 'Visual Grammar',
            children: [
              { id: 'diagrams', label: '39 Visual Types' },
              { id: 'patterns', label: '7 Semantic Patterns' }
            ]
          }
        ]
      }
    },
    buildDiagram: (config, opts) => new TreeDiagram({ ...config, ...opts })
  },
  {
    id: 'org-chart',
    name: 'Org Chart Diagram',
    category: 'Hierarchical',
    type: 'json',
    description: 'Organizational reporting structures and team leadership.',
    defaultConfig: {
      title: 'Product & Engineering Organization',
      eyebrow: 'Leadership Hierarchy',
      nodes: [
        { id: 'cto', role: 'Chief Technology Officer', name: 'Alex Rivera', team: 'Executive', x: 380, y: 40 },
        { id: 'vp-eng', role: 'VP of Engineering', name: 'Sara Chen', team: 'Engineering', x: 220, y: 150, parentId: 'cto' },
        { id: 'head-design', role: 'Head of Design', name: 'Liam Vance', team: 'Design', x: 540, y: 150, parentId: 'cto', focal: true }
      ]
    },
    buildDiagram: (config, opts) => new OrgChartDiagram({ ...config, ...opts })
  },
  {
    id: 'nested',
    name: 'Nested Diagram',
    category: 'Hierarchical',
    type: 'json',
    description: 'Enclosing containers, scopes, and nested module boundaries.',
    defaultConfig: {
      title: 'Application Runtime Boundary Scopes',
      eyebrow: 'Encapsulation · Nested Containers',
      rootBoxes: [
        {
          id: 'os',
          label: 'Operating System Host',
          sublabel: 'Debian Linux',
          x: 64,
          y: 64,
          width: 760,
          height: 280,
          children: [
            {
              id: 'docker',
              label: 'Docker Container Runtime',
              sublabel: 'cgroups isolation',
              x: 100,
              y: 110,
              width: 680,
              height: 200,
              children: [
                {
                  id: 'node',
                  label: 'Node.js 22 V8 Engine',
                  sublabel: 'Fastify App',
                  x: 140,
                  y: 160,
                  width: 300,
                  height: 120,
                  focal: true
                }
              ]
            }
          ]
        }
      ]
    },
    buildDiagram: (config, opts) => new NestedDiagram({ ...config, ...opts })
  },
  {
    id: 'layers',
    name: 'Layer Stack Diagram',
    category: 'Hierarchical',
    type: 'json',
    description: 'Layered architecture tiers and stacked capability levels.',
    defaultConfig: {
      title: 'Modern Web Application Layer Stack',
      eyebrow: 'Architecture · 4-Tier Stack',
      layers: [
        {
          name: 'Presentation & UI Layer',
          items: [
            { id: 'react', name: 'React 19 / Astro Islands' },
            { id: 'tailwind', name: 'Editorial Design Tokens' }
          ]
        },
        {
          name: 'Application & API Services',
          items: [
            { id: 'trpc', name: 'tRPC Endpoints & Fastify', focal: true },
            { id: 'auth', name: 'Session & Authz Guardian' }
          ]
        },
        {
          name: 'Data Storage & Cache',
          items: [
            { id: 'pg', name: 'PostgreSQL 16 Multi-AZ' },
            { id: 'redis', name: 'Redis Cache Cluster' }
          ]
        }
      ]
    },
    buildDiagram: (config, opts) => new LayerStackDiagram({ ...config, ...opts })
  },
  {
    id: 'high-level',
    name: 'High-Level Diagram',
    category: 'Hierarchical',
    type: 'json',
    description: 'Executive overview boxes representing major macro subsystems.',
    defaultConfig: {
      title: 'Enterprise Platform Macro Overview',
      eyebrow: 'Executive Architecture Overview',
      clusterName: 'ENTERPRISE SERVICE MESH',
      tiers: [
        {
          name: 'Edge Tier',
          nodes: [
            { name: 'Anycast DNS', sublabel: 'Global Edge' },
            { name: 'API Gateway', sublabel: 'WAF & Auth', focal: true }
          ]
        },
        {
          name: 'Processing Tier',
          nodes: [
            { name: 'Compute Core', sublabel: 'K8s Cluster' },
            { name: 'Event Queue', sublabel: 'Kafka / Redpanda' }
          ]
        }
      ]
    },
    buildDiagram: (config, opts) => new HighLevelDiagram({ ...config, ...opts })
  },

  // ==========================================
  // WORKFLOW / CHRONOLOGICAL
  // ==========================================
  {
    id: 'timeline',
    name: 'Timeline Diagram',
    category: 'Workflow',
    type: 'json',
    description: 'Chronological events and milestone phases along a timeline axis.',
    defaultConfig: {
      title: 'Design System Migration Milestones',
      eyebrow: 'Roadmap · 2026 Timeline',
      milestones: [
        { date: 'Q1 2026', title: 'Token Harmonization', description: 'Unified semantic color palettes and 4px grid rules.' },
        { date: 'Q2 2026', title: '39 Visual Types', description: 'Implemented complete diagram grammar in isomorphic TS.', focal: true },
        { date: 'Q3 2026', title: 'Taste Gate Linters', description: 'Automated CI/CD mask clipping & volume checks.' },
        { date: 'Q4 2026', title: 'Production Launch', description: 'Global documentation and interactive playground.' }
      ]
    },
    buildDiagram: (config, opts) => new TimelineDiagram({ ...config, ...opts })
  },
  {
    id: 'swimlane',
    name: 'Swimlane Diagram',
    category: 'Workflow',
    type: 'json',
    description: 'Cross-functional lanes mapping responsibilities across departments.',
    defaultConfig: {
      title: 'Incident Response & Post-Mortem Flow',
      eyebrow: 'Operations · Cross-Functional Lanes',
      lanes: [
        {
          name: 'Site Reliability Engineering',
          nodes: [
            { id: 'sre-1', name: 'Alert Triggered (PagerDuty)' },
            { id: 'sre-2', name: 'Mitigate & Triage', focal: true }
          ]
        },
        {
          name: 'Product Engineering',
          nodes: [
            { id: 'dev-1', name: 'Root Cause Fix' },
            { id: 'dev-2', name: 'Deploy Hotfix' }
          ]
        },
        {
          name: 'Communications',
          nodes: [
            { id: 'comms-1', name: 'Update Status Page' },
            { id: 'comms-2', name: 'Publish Post-Mortem' }
          ]
        }
      ]
    },
    buildDiagram: (config, opts) => new SwimlaneDiagram({ ...config, ...opts })
  },
  {
    id: 'gantt',
    name: 'Gantt Diagram',
    category: 'Workflow',
    type: 'json',
    description: 'Schedule tracking, duration bars, and task dependencies.',
    defaultConfig: {
      title: 'Q1 Product Launch Schedule',
      eyebrow: 'Project Management · Gantt Tracking',
      columns: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
      phases: [
        {
          name: 'Phase 1: Architecture',
          tasks: [
            { name: 'Research & Tokens', startCol: 0, spanCols: 2, progress: 1 },
            { name: 'Core Router & Engine', startCol: 1, spanCols: 3, progress: 0.8, focal: true }
          ]
        },
        {
          name: 'Phase 2: Release',
          tasks: [
            { name: 'Taste Gate QA Audit', startCol: 3, spanCols: 2, progress: 0.4 },
            { name: 'GA Launch Milestone', startCol: 5, spanCols: 1, isMilestone: true, focal: true }
          ]
        }
      ]
    },
    buildDiagram: (config, opts) => new GanttDiagram({ ...config, ...opts })
  },
  {
    id: 'process',
    name: 'Process Diagram',
    category: 'Workflow',
    type: 'json',
    description: 'Linear stages with inputs, governance actors, and outputs.',
    defaultConfig: {
      title: 'Software Release Promotion Pipeline',
      eyebrow: 'Continuous Delivery · Process',
      stages: [
        { name: 'Commit & Lint', actor: 'GitHub Actions', actions: ['Typecheck', 'Lint 4px Grid', 'Unit Tests'] },
        { name: 'Staging Validation', actor: 'QA Engine', actions: ['E2E Cypress Tests', 'Taste Gate Verification'], focal: true },
        { name: 'Canary Rollout', actor: 'ArgoCD / K8s', actions: ['5% Traffic Shift', 'Error Budget Watch'] },
        { name: 'Full Production', actor: 'SRE Lead', actions: ['100% Traffic', 'Metric Signoff'] }
      ]
    },
    buildDiagram: (config, opts) => new ProcessDiagram({ ...config, ...opts })
  },
  {
    id: 'journey',
    name: 'User Journey Diagram',
    category: 'Workflow',
    type: 'json',
    description: 'Customer experience journey with touchpoints, thoughts, and sentiment.',
    defaultConfig: {
      title: 'New Developer Onboarding Journey',
      eyebrow: 'Developer Experience (DX) Audit',
      stages: [
        { name: 'Discovery', actions: ['Reads README', 'Stars repo'], touchpoint: 'GitHub', sentiment: 0.6 },
        { name: 'Install', actions: ['Runs pnpm add', 'Checks types'], touchpoint: 'Terminal', sentiment: 0.8 },
        { name: 'Authoring', actions: ['Creates Architecture Diagram', 'Adjusts 4px nodes'], touchpoint: 'VSCode', sentiment: -0.2, painPoint: 'Desires live preview playground', focal: true },
        { name: 'Shipped', actions: ['Embeds SVG in docs', 'CI passed'], touchpoint: 'Browser', sentiment: 0.9 }
      ]
    },
    buildDiagram: (config, opts) => new UserJourneyDiagram({ ...config, ...opts })
  },
  {
    id: 'kanban',
    name: 'Kanban Diagram',
    category: 'Workflow',
    type: 'json',
    description: 'Agile visual workflow columns with work-in-progress cards.',
    defaultConfig: {
      title: 'Design Engine Sprint Backlog',
      eyebrow: 'Agile Workflow · Kanban Board',
      columns: [
        {
          name: 'To Do',
          wipLimit: 5,
          cards: [
            { id: 'c1', title: 'Draw.io VDX Parser', tag: 'IMPORTER', owner: 'Alex' },
            { id: 'c2', title: 'Figma Plugin Sync', tag: 'SYNC' }
          ]
        },
        {
          name: 'In Progress',
          wipLimit: 3,
          cards: [
            { id: 'c3', title: 'Interactive Web Playground', tag: 'DX', owner: 'Liam', focal: true },
            { id: 'c4', title: 'Taste Gate CLI Linter', tag: 'CORE', isBlocked: true }
          ]
        },
        {
          name: 'Done',
          cards: [
            { id: 'c5', title: '39 Visual Diagram Types', tag: 'RELEASE' },
            { id: 'c6', title: '7 Semantic Patterns', tag: 'RELEASE' }
          ]
        }
      ]
    },
    buildDiagram: (config, opts) => new KanbanDiagram({ ...config, ...opts })
  },
  {
    id: 'story-map',
    name: 'Story Map Diagram',
    category: 'Workflow',
    type: 'json',
    description: 'User story mapping across backbone activities and release slices.',
    defaultConfig: {
      title: 'Diagram Library Release Story Map',
      eyebrow: 'Product Strategy · Slicing',
      activities: ['Authoring', 'Validating', 'Publishing'],
      slices: [
        { name: 'Release 1 (MVP)', isCutLine: true },
        { name: 'Release 2 (Enhance)' }
      ],
      stories: [
        { title: 'TypeScript DSL', activityIndex: 0, sliceIndex: 0 },
        { title: '4px Grid Linter', activityIndex: 1, sliceIndex: 0, focal: true },
        { title: 'SVG Exporter', activityIndex: 2, sliceIndex: 0 },
        { title: 'Mermaid Parser', activityIndex: 0, sliceIndex: 1 },
        { title: 'Resvg PNG Engine', activityIndex: 2, sliceIndex: 1 }
      ]
    },
    buildDiagram: (config, opts) => new StoryMapDiagram({ ...config, ...opts })
  },

  // ==========================================
  // QUANTITATIVE / ANALYTICAL
  // ==========================================
  {
    id: 'bar',
    name: 'Bar Chart Diagram',
    category: 'Quantitative',
    type: 'json',
    description: 'Horizontal or vertical editorial bar chart with units.',
    defaultConfig: {
      title: 'Render Engine Performance Comparison (ops/sec)',
      eyebrow: 'Benchmark · Throughput',
      orientation: 'horizontal',
      units: 'ops/ms',
      items: [
        { name: 'Diagram Design TS', value: 4200, focal: true },
        { name: 'Puppeteer Headless', value: 120 },
        { name: 'Client Canvas Raster', value: 850 },
        { name: 'WASM SVG Renderer', value: 2900 }
      ]
    },
    buildDiagram: (config, opts) => new BarChartDiagram({ ...config, ...opts })
  },
  {
    id: 'line',
    name: 'Line Chart Diagram',
    category: 'Quantitative',
    type: 'json',
    description: 'Continuous editorial line curves with data points.',
    defaultConfig: {
      title: 'Monthly CI Build Duration Trend',
      eyebrow: 'Engineering Productivity · Minutes',
      xLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      series: [
        { name: 'Build Time (min)', data: [18, 16, 14, 9, 6, 4], focal: true }
      ]
    },
    buildDiagram: (config, opts) => new LineChartDiagram({ ...config, ...opts })
  },
  {
    id: 'scatter',
    name: 'Scatter Plot Diagram',
    category: 'Quantitative',
    type: 'json',
    description: 'Correlation scatter points across 2 numerical axes.',
    defaultConfig: {
      title: 'Codebase Complexity vs Test Coverage',
      eyebrow: 'Quality Matrix · Correlation',
      xLabel: 'Complexity Index',
      yLabel: 'Coverage %',
      points: [
        { x: 20, y: 85, label: 'Core Router' },
        { x: 45, y: 72, label: 'Linter Engine' },
        { x: 80, y: 92, label: 'SVG Primitives', focal: true },
        { x: 60, y: 65, label: 'Importers' }
      ]
    },
    buildDiagram: (config, opts) => new ScatterPlotDiagram({ ...config, ...opts })
  },
  {
    id: 'treemap',
    name: 'Treemap Diagram',
    category: 'Quantitative',
    type: 'json',
    description: 'Nested rectangular volume area visualization.',
    defaultConfig: {
      title: 'Production Bundle Weight Allocation',
      eyebrow: 'Bundle Analyzer · KB Weight',
      units: 'KB',
      items: [
        { id: 'geo', name: 'SVG Geometry Core', value: 45, focal: true },
        { id: 'types', name: 'Visual Diagram Types', value: 35 },
        { id: 'patterns', name: 'Semantic Patterns', value: 15 },
        { id: 'linters', name: 'Taste Gate Linters', value: 12 }
      ]
    },
    buildDiagram: (config, opts) => new TreemapDiagram({ ...config, ...opts })
  },
  {
    id: 'sankey',
    name: 'Sankey Diagram',
    category: 'Quantitative',
    type: 'json',
    description: 'Volume flow conservation across multistage columns.',
    defaultConfig: {
      title: 'CI Compute Allocation & Test Outcomes',
      eyebrow: 'Infrastructure · Volume Flow',
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
    },
    buildDiagram: (config, opts) => new SankeyDiagram({ ...config, ...opts })
  },
  {
    id: 'radar',
    name: 'Radar / Spider Chart',
    category: 'Quantitative',
    type: 'json',
    description: 'Multivariate radial comparison across feature axes.',
    defaultConfig: {
      title: 'Architecture Evaluation Matrix',
      eyebrow: 'Evaluation Criteria · Radar',
      axes: [
        { name: 'Scalability', max: 100 },
        { name: 'Security', max: 100 },
        { name: 'Observability', max: 100 },
        { name: 'DX Velocity', max: 100 },
        { name: 'Simplicity', max: 100 }
      ],
      series: [
        { name: 'Target Architecture', values: [90, 95, 80, 85, 75], focal: true }
      ]
    },
    buildDiagram: (config, opts) => new RadarDiagram({ ...config, ...opts })
  },
  {
    id: 'polar',
    name: 'Polar Chart / Radial Lollipop',
    category: 'Quantitative',
    type: 'json',
    description: 'Radial lollipop values radiating from central origin.',
    defaultConfig: {
      title: 'Global Traffic Distribution by Region',
      eyebrow: 'Network Ingress · Radial Lollipop',
      categories: [
        { name: 'North America', value: 45, focal: true },
        { name: 'Europe', value: 30 },
        { name: 'Asia Pacific', value: 18 },
        { name: 'Latin America', value: 7 }
      ]
    },
    buildDiagram: (config, opts) => new PolarChartDiagram({ ...config, ...opts })
  },
  {
    id: 'quadrant',
    name: 'Quadrant Diagram',
    category: 'Quantitative',
    type: 'json',
    description: '2x2 Matrix mapping items by impact and effort/feasibility.',
    defaultConfig: {
      title: 'Feature Prioritization Matrix (Impact vs Effort)',
      eyebrow: 'Strategy Matrix · 2x2 Quadrant',
      xAxisLabel: 'Implementation Effort',
      yAxisLabel: 'Strategic Business Value',
      items: [
        { label: 'Interactive Playground', x: 0.3, y: 0.85, focal: true },
        { label: 'Mermaid Importer', x: 0.4, y: 0.75 },
        { label: '3D Spatial View', x: 0.9, y: 0.2 },
        { label: 'Basic SVG Exporter', x: 0.15, y: 0.6 }
      ]
    },
    buildDiagram: (config, opts) => new QuadrantDiagram({ ...config, ...opts })
  },
  {
    id: 'venn',
    name: 'Venn Diagram',
    category: 'Quantitative',
    type: 'json',
    description: 'Set intersections and overlapping capability domains.',
    defaultConfig: {
      title: 'Design Engineering Discipline Intersection',
      eyebrow: 'Skill Sets · Domain Overlap',
      sets: [
        { label: 'Typography & Design', focal: false },
        { label: 'Systems & Infrastructure', focal: false },
        { label: 'Editorial Storytelling', focal: true }
      ],
      intersectionLabel: 'Editorial Diagrams'
    },
    buildDiagram: (config, opts) => new VennDiagram({ ...config, ...opts })
  },
  {
    id: 'pyramid',
    name: 'Pyramid / Funnel Diagram',
    category: 'Quantitative',
    type: 'json',
    description: 'Hierarchical pyramid tiers or conversion funnel stages.',
    defaultConfig: {
      title: 'Automated Testing Pyramid',
      eyebrow: 'Software QA Architecture',
      tiers: [
        { name: 'E2E User Journey Tests', metric: '5%', focal: false },
        { name: 'Integration & API Tests', metric: '20%', focal: false },
        { name: 'Taste Gate Geometry Mask Linters', metric: '35%', focal: true },
        { name: 'Unit Tests & 4px Grid Checks', metric: '40%', focal: false }
      ]
    },
    buildDiagram: (config, opts) => new PyramidDiagram({ ...config, ...opts })
  },

  // ==========================================
  // DATA PLATFORM & STRATEGIC
  // ==========================================
  {
    id: 'medallion',
    name: 'Medallion Architecture',
    category: 'Data Platform',
    type: 'json',
    description: 'Bronze raw, Silver curated, and Gold aggregated data layers.',
    defaultConfig: {
      title: 'Lakehouse Medallion Data Pipeline',
      eyebrow: 'Data Architecture · Delta Lake',
      tiers: [
        {
          type: 'bronze',
          title: 'Bronze Ingestion',
          tables: [{ name: 'Kafka Stream' }, { name: 'Raw Webhook JSON' }]
        },
        {
          type: 'silver',
          title: 'Silver Cleansed',
          focal: true,
          tables: [{ name: 'Deduplicated Records', focal: true }, { name: 'Enriched Customers' }]
        },
        {
          type: 'gold',
          title: 'Gold Aggregates',
          tables: [{ name: 'Daily Revenue Cube' }, { name: 'Executive Metrics' }]
        }
      ]
    },
    buildDiagram: (config, opts) => new MedallionDiagram({ ...config, ...opts })
  },
  {
    id: 'data-flow',
    name: 'Data Flow Diagram',
    category: 'Data Platform',
    type: 'json',
    description: 'Data pipelines with sources, transformations, queues, and sinks.',
    defaultConfig: {
      title: 'Real-time Event Streaming Architecture',
      eyebrow: 'Data Platform · Event Streaming',
      nodes: [
        { id: 'mobile', name: 'Mobile App', tag: 'SRC', x: 48, y: 160, width: 140, height: 60, kind: 'input' },
        { id: 'kafka', name: 'Kafka Topic (events)', tag: 'QUEUE', x: 260, y: 160, width: 160, height: 64 },
        { id: 'flink', name: 'Apache Flink Job', tag: 'STREAM', x: 480, y: 160, width: 160, height: 64, focal: true },
        { id: 'clickhouse', name: 'ClickHouse OLAP', tag: 'STORAGE', x: 700, y: 160, width: 150, height: 60, kind: 'storage' }
      ],
      edges: [
        { from: 'mobile', to: 'kafka', label: 'Emit JSON' },
        { from: 'kafka', to: 'flink', label: 'Stream Drain' },
        { from: 'flink', to: 'clickhouse', label: 'Window Batch', focal: true }
      ]
    },
    buildDiagram: (config, opts) => new DataFlowDiagram({ ...config, ...opts })
  },
  {
    id: 'dp-integration',
    name: 'DP Integration Diagram',
    category: 'Data Platform',
    type: 'json',
    description: 'Data platform partner integrations and sync patterns.',
    defaultConfig: {
      title: 'CRM & ERP Bi-Directional Integration',
      eyebrow: 'Enterprise Integration · iPaaS',
      sources: [
        { id: 'sfdc', name: 'Salesforce CRM', tag: 'SOURCE' },
        { id: 'netsuite', name: 'NetSuite ERP', tag: 'SOURCE' }
      ],
      core: [
        { id: 'snowflake', name: 'Snowflake Lakehouse', tag: 'CORE', focal: true }
      ],
      consumers: [
        { id: 'hubspot', name: 'HubSpot Marketing', tag: 'TARGET' },
        { id: 'looker', name: 'Looker Analytics', tag: 'BI' }
      ]
    },
    buildDiagram: (config, opts) => new DpIntegrationDiagram({ ...config, ...opts })
  },
  {
    id: 'dp-security-matrix',
    name: 'DP Security Matrix',
    category: 'Data Platform',
    type: 'json',
    description: 'Access control matrices, masking rules, and governance policies.',
    defaultConfig: {
      title: 'Data Governance Access Matrix',
      eyebrow: 'Compliance · Column Masking',
      components: ['Customer PII', 'Financial Tx', 'Raw Logs'],
      roles: [
        { name: 'Data Analyst', sublabel: 'Marketing Team', permissions: ['READ', '—', 'DENY'] },
        { name: 'ML Engineer', sublabel: 'Core Algorithm', permissions: ['ADMIN', 'WRITE', 'READ'] },
        { name: 'SecOps Auditor', sublabel: 'Compliance Officer', permissions: ['READ', 'READ', 'ADMIN'] }
      ]
    },
    buildDiagram: (config, opts) => new DpSecurityMatrixDiagram({ ...config, ...opts })
  },
  {
    id: 'fishbone',
    name: 'Fishbone (Ishikawa) Diagram',
    category: 'Data Platform',
    type: 'json',
    description: 'Root cause analysis mapping failure factors into spine categories.',
    defaultConfig: {
      title: 'Root Cause Analysis: Production Latency Spike',
      eyebrow: 'Incident Analysis · Ishikawa Fishbone',
      effect: 'High Latency (>1500ms)',
      branches: [
        {
          category: 'Compute & EBS',
          position: 'top',
          spineOffset: 0.25,
          causes: ['CPU Saturation 95%', 'IOPS Throttling']
        },
        {
          category: 'Code & Queries',
          position: 'top',
          spineOffset: 0.65,
          causes: ['Missing Index', 'N+1 Loop Query'],
          focal: true
        },
        {
          category: 'Network & NAT',
          position: 'bottom',
          spineOffset: 0.35,
          causes: ['DNS Timeout', 'Bandwidth Cap']
        },
        {
          category: 'Database Config',
          position: 'bottom',
          spineOffset: 0.75,
          causes: ['Connection Pool Max', 'WAL Backlog']
        }
      ]
    },
    buildDiagram: (config, opts) => new FishboneDiagram({ ...config, ...opts })
  },
  {
    id: 'wardley',
    name: 'Wardley Map',
    category: 'Data Platform',
    type: 'json',
    description: 'Strategic value chain versus evolutionary maturity stages.',
    defaultConfig: {
      title: 'Diagram Design Strategic Value Chain',
      eyebrow: 'Wardley Map · Evolution vs Visibility',
      userType: 'Software Architect',
      components: [
        { id: 'c1', name: 'Editorial Diagrams', visibility: 0.85, evolution: 0.25 },
        { id: 'c2', name: 'TypeScript Grammar DSL', visibility: 0.65, evolution: 0.55, focal: true, targetEvolution: 0.75 },
        { id: 'c3', name: 'Orthogonal 4px Router', visibility: 0.45, evolution: 0.7 },
        { id: 'c4', name: 'SVG DOM Engine', visibility: 0.25, evolution: 0.85 },
        { id: 'c5', name: 'Node.js Runtime', visibility: 0.1, evolution: 0.95 }
      ],
      links: [
        { from: 'c1', to: 'c2', focal: true },
        { from: 'c2', to: 'c3' },
        { from: 'c3', to: 'c4' },
        { from: 'c4', to: 'c5' }
      ]
    },
    buildDiagram: (config, opts) => new WardleyMapDiagram({ ...config, ...opts })
  },
  {
    id: 'loop',
    name: 'Parametric Loop / Flywheel',
    category: 'Data Platform',
    type: 'json',
    description: 'Continuous feedback flywheel with central hub and radiating stations.',
    defaultConfig: {
      title: 'The Continuous Learning Flywheel',
      eyebrow: 'Operating Model · Self-Improving Loop',
      hub: { name: 'Shared Memory', sublabel: 'one record, every loop' },
      stations: [
        { name: 'Capture', sublabel: 'signals in', spokeLabel: 'SIGNALS' },
        { name: 'Research', sublabel: 'evidence gathered' },
        { name: 'Decide', sublabel: 'peer approval', focal: true },
        { name: 'Act', sublabel: 'work ships', spokeLabel: 'OUTCOMES' },
        { name: 'Learn', sublabel: 'playbook updated' }
      ]
    },
    buildDiagram: (config, opts) => new LoopDiagram({ ...config, ...opts })
  },

  // ==========================================
  // 7 SEMANTIC BEHAVIORAL PATTERNS
  // ==========================================
  {
    id: 'pattern-fan-in',
    name: '1. Fan-in Queue / Bottleneck',
    category: 'Semantic Patterns',
    type: 'json',
    description: 'Multiple upstream producers converging into a finite queue with rate-limited drain.',
    defaultConfig: {
      title: 'Real-time Event Ingestion Bottleneck',
      eyebrow: 'Semantic Pattern · Fan-in Buffer',
      sources: [
        { name: 'Mobile App Ingress', rate: '14k req/s' },
        { name: 'Web Storefront', rate: '8k req/s' },
        { name: 'Partner Webhooks', rate: '5k req/s' }
      ],
      queueCapacity: 50000,
      queueDepth: 42000,
      bottleneckService: { name: 'Kafka Consumer Group', capacityRate: '15k req/s' },
      admittedPath: 'ClickHouse Lakehouse Sink',
      deferredPath: 'S3 Dead-Letter Spill Bucket'
    },
    buildDiagram: (config, opts) => createFanInQueueDiagram({ ...config, ...opts })
  },
  {
    id: 'pattern-stage-framework',
    name: '2. Stage Framework with Semantic Slots',
    category: 'Semantic Patterns',
    type: 'json',
    description: 'Fixed stage taxonomy with Question, Input, Governance, and Output slots.',
    defaultConfig: {
      title: 'Architecture Review & Release Framework',
      eyebrow: 'Semantic Pattern · Stage Governance',
      stages: [
        {
          stage: '1. Intent & RFC',
          question: 'What problem are we solving?',
          input: 'Product Spec & PRD',
          governance: 'Staff Engineer & PM',
          output: 'Approved Design Doc'
        },
        {
          stage: '2. Implementation',
          question: 'Does the code satisfy Taste Gate?',
          input: 'Pull Request & 4px Grid',
          governance: 'CI/CD Automated Linters',
          output: 'Signed Artifacts',
          focal: true
        },
        {
          stage: '3. Production Verification',
          question: 'Is the system healthy?',
          input: 'Canary Metrics',
          governance: 'SRE On-Call',
          output: '100% Traffic Shift'
        }
      ]
    },
    buildDiagram: (config, opts) => createStageFrameworkDiagram({ ...config, ...opts })
  },
  {
    id: 'pattern-unstructured-input',
    name: '3. Unstructured Input → Structured Artifact',
    category: 'Semantic Patterns',
    type: 'json',
    description: 'Natural language or fuzzy inputs normalized into a validated schema record.',
    defaultConfig: {
      title: 'LLM Function Calling Schema Normalizer',
      eyebrow: 'Semantic Pattern · Schema Extraction',
      utterance: 'Book a roundtrip flight to Tokyo departing next Tuesday for 2 passengers.',
      transformName: 'Gemini Function Calling',
      fields: [
        { key: 'destination', value: 'HND / NRT' },
        { key: 'passengers', value: '2' },
        { key: 'class', value: 'Economy' },
        { key: 'date_departure', value: '2026-09-01' }
      ]
    },
    buildDiagram: (config, opts) => createUnstructuredInputDiagram({ ...config, ...opts })
  },
  {
    id: 'pattern-policy-traces',
    name: '4. Paired Policy-Evaluation Traces',
    category: 'Semantic Patterns',
    type: 'json',
    description: 'Visual step-by-step trace comparing two requests through security policy rules.',
    defaultConfig: {
      title: 'Zero-Trust Access Policy Evaluation',
      eyebrow: 'Semantic Pattern · Paired Traces',
      traceAName: 'Compliant Laptop',
      traceBName: 'Unmanaged Device',
      rules: [
        { name: '1. Valid Corporate Certificate', traceA: 'PASS', traceB: 'FAIL' },
        { name: '2. CrowdStrike EDR Active', traceA: 'PASS', traceB: 'NOT REACHED' },
        { name: '3. Geo-IP Location Permitted', traceA: 'PASS', traceB: 'NOT REACHED' }
      ]
    },
    buildDiagram: (config, opts) => createPolicyTracesDiagram({ ...config, ...opts })
  },
  {
    id: 'pattern-paved-road',
    name: '5. Secure Paved Road',
    category: 'Semantic Patterns',
    type: 'json',
    description: 'Golden path with guardrails contrasted against blocked insecure paths.',
    defaultConfig: {
      title: 'Container Supply Chain Golden Path',
      eyebrow: 'Semantic Pattern · Secure Paved Road',
      ingressSources: ['Developer Git Push', 'Dependabot Security PR'],
      pavedRouteComponents: [
        'GitHub Actions (Build & Test)',
        'Cosign Container Signing',
        'Production EKS Cluster'
      ],
      blockedRoute: 'Direct SSH Push (Blocked by OIDC)'
    },
    buildDiagram: (config, opts) => createSecurePavedRoadDiagram({ ...config, ...opts })
  },
  {
    id: 'pattern-control-catalog',
    name: '6 & 7. Governance / Control Catalog & Defense in Depth',
    category: 'Semantic Patterns',
    type: 'json',
    description: 'Multi-layer compensating security surfaces across development lifecycle timing.',
    defaultConfig: {
      title: 'Defense in Depth Application Security Controls',
      eyebrow: 'Semantic Pattern · Layered Controls',
      surfaces: [
        {
          name: 'Developer IDE & Pre-Commit',
          controls: [
            { name: 'Secret Detection (Gitleaks)', timing: 'write', actor: 'Local Hook' },
            { name: 'TypeScript Strict Mode', timing: 'write', actor: 'IDE Language Server' }
          ]
        },
        {
          name: 'Continuous Integration & Pull Request',
          controls: [
            { name: 'Taste Gate Mask & 4px Linter', timing: 'merge', actor: 'GitHub Actions', focal: true },
            { name: 'Snyk Vulnerability Scanner', timing: 'merge', actor: 'Automated Bot' }
          ]
        },
        {
          name: 'Production Kubernetes Runtime',
          controls: [
            { name: 'Kyverno Policy Enforcer', timing: 'deploy', actor: 'Cluster Admission' },
            { name: 'Falco eBPF Threat Sensor', timing: 'run', actor: 'DaemonSet' }
          ]
        }
      ]
    },
    buildDiagram: (config, opts) => createControlCatalogDiagram({ ...config, ...opts })
  },

  // ==========================================
  // IMPORTERS (Mermaid & Draw.io)
  // ==========================================
  {
    id: 'importer-mermaid-seq',
    name: 'Mermaid: Sequence Diagram',
    category: 'Importers',
    type: 'mermaid',
    description: 'Convert standard Mermaid sequence diagram syntax directly to editorial SVG.',
    defaultConfig: `sequenceDiagram
  autonumber
  actor User
  participant WebApp as Web Frontend
  participant Gateway as API Gateway
  participant Auth as Auth0 Provider
  participant DB as PostgreSQL

  User->>WebApp: Submit Login Credentials
  WebApp->>Gateway: POST /v1/auth/login
  Gateway->>Auth: Validate Credentials
  Auth-->>Gateway: Return Signed JWT
  Gateway->>DB: Record Audit Log
  Gateway-->>WebApp: 200 OK (Set HttpOnly Cookie)
  WebApp-->>User: Redirect to Dashboard`,
    buildDiagram: (code, opts) => importMermaid(typeof code === 'string' ? code : '', {
      title: 'Imported Mermaid Sequence',
      theme: opts.theme
    })
  },
  {
    id: 'importer-mermaid-flow',
    name: 'Mermaid: Flowchart Graph',
    category: 'Importers',
    type: 'mermaid',
    description: 'Convert Mermaid flowchart graphs into editorial orthogonal diagrams.',
    defaultConfig: `graph TD
  A[Incoming Web Request] --> B{Valid API Key?}
  B -->|Yes| C[Rate Limiter Check]
  B -->|No| D[401 Unauthorized Response]
  C -->|Token Bucket OK| E[Route to Microservice Origin]
  C -->|Exceeded Rate| F[429 Too Many Requests]
  E --> G[Cache in Redis Edge]`,
    buildDiagram: (code, opts) => importMermaid(typeof code === 'string' ? code : '', {
      title: 'Imported Mermaid Flowchart',
      theme: opts.theme
    })
  },
  {
    id: 'importer-mermaid-state',
    name: 'Mermaid: State Machine',
    category: 'Importers',
    type: 'mermaid',
    description: 'Convert Mermaid stateDiagram syntax into editorial state diagrams.',
    defaultConfig: `stateDiagram-v2
  [*] --> Standby
  Standby --> IngressReceiving : StreamStarted
  IngressReceiving --> Processing : BatchWindowReached
  Processing --> HealthySink : AllChecksPassed
  Processing --> DeadLetterSpill : ValidationFailed
  HealthySink --> [*]`,
    buildDiagram: (code, opts) => importMermaid(typeof code === 'string' ? code : '', {
      title: 'Imported State Machine',
      theme: opts.theme
    })
  },
  {
    id: 'importer-drawio',
    name: 'Draw.io: XML Redraw Engine',
    category: 'Importers',
    type: 'drawio',
    description: 'Convert Draw.io diagram XML documents into editorial diagrams.',
    defaultConfig: `<mxfile>
  <diagram id="d1" name="System Topology">
    <mxGraphModel>
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <mxCell id="n1" value="Web Client" vertex="1" parent="1">
          <mxGeometry x="64" y="140" width="140" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="n2" value="API Gateway" vertex="1" parent="1">
          <mxGeometry x="280" y="140" width="160" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="n3" value="Microservice Core" vertex="1" parent="1">
          <mxGeometry x="520" y="140" width="180" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="e1" value="HTTPS" edge="1" source="n1" target="n2" parent="1">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
        <mxCell id="e2" value="gRPC" edge="1" source="n2" target="n3" parent="1">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`,
    buildDiagram: (code, opts) => importDrawio(typeof code === 'string' ? code : '', {
      title: 'Imported Draw.io Topology',
      theme: opts.theme
    })
  }
];
