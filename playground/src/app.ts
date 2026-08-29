import { EXAMPLES, type ExampleDefinition } from './examples.js';
import {
  renderToSvg,
  renderToHtml,
  validateGeometryMasks,
  validate4pxGrid,
  type LinterIssue
} from 'diagram-design';

export class PlaygroundApp {
  private container: HTMLElement;
  private activeExample: ExampleDefinition;
  private currentConfigText: string = '';
  private currentTheme: 'light' | 'dark' | 'terminal' = 'light';
  private currentMotion: 'none' | 'reveal' | 'step' | 'loop' = 'none';
  private currentViewMode: 'svg' | 'html' | 'raw-svg' | 'raw-html' = 'svg';
  private searchQuery: string = '';
  private zoomLevel: number = 1.0;
  private currentSvgOutput: string = '';
  private currentHtmlOutput: string = '';
  private currentIssues: LinterIssue[] = [];
  private renderError: string | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    const defaultEx = EXAMPLES.find(e => e.id === 'architecture') || EXAMPLES[0]!;
    this.activeExample = defaultEx;
    this.resetConfigText();
  }

  public init(): void {
    this.renderLayout();
    this.updateTheme();
    this.renderDiagram();
  }

  private resetConfigText(): void {
    if (this.activeExample.type === 'json') {
      this.currentConfigText = JSON.stringify(this.activeExample.defaultConfig, null, 2);
    } else {
      this.currentConfigText = this.activeExample.defaultConfig;
    }
  }

  private updateTheme(): void {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
  }

  private renderDiagram(): void {
    this.renderError = null;
    try {
      let parsedConfig: any;
      if (this.activeExample.type === 'json') {
        parsedConfig = JSON.parse(this.currentConfigText);
      } else {
        parsedConfig = this.currentConfigText;
      }

      const diagram = this.activeExample.buildDiagram(parsedConfig, {
        theme: this.currentTheme,
        motion: this.currentMotion
      });

      this.currentSvgOutput = renderToSvg(diagram);
      this.currentHtmlOutput = renderToHtml(diagram);

      // Run Taste Gate linters
      const geomIssues = validateGeometryMasks(this.currentSvgOutput);
      const gridIssues = validate4pxGrid(this.currentSvgOutput);
      this.currentIssues = [...geomIssues, ...gridIssues];
    } catch (err: any) {
      this.renderError = err?.message || String(err);
      this.currentSvgOutput = '';
      this.currentHtmlOutput = '';
      this.currentIssues = [];
    }

    this.updateCanvasView();
    this.updateLinterView();
  }

  private renderLayout(): void {
    this.container.innerHTML = `
      <!-- Header -->
      <header class="header">
        <div class="brand">
          <h1>Diagram Design</h1>
          <span class="badge">Playground</span>
        </div>
        <div class="controls-bar">
          <div class="control-group">
            <label for="theme-select">Theme:</label>
            <select id="theme-select">
              <option value="light" ${this.currentTheme === 'light' ? 'selected' : ''}>Light (Editorial)</option>
              <option value="dark" ${this.currentTheme === 'dark' ? 'selected' : ''}>Dark (Slate)</option>
              <option value="terminal" ${this.currentTheme === 'terminal' ? 'selected' : ''}>Terminal (Monochrome)</option>
            </select>
          </div>
          <div class="control-group">
            <label for="motion-select">Motion:</label>
            <select id="motion-select">
              <option value="none" ${this.currentMotion === 'none' ? 'selected' : ''}>None (Static)</option>
              <option value="reveal" ${this.currentMotion === 'reveal' ? 'selected' : ''}>Reveal (Editorial Flow)</option>
              <option value="step" ${this.currentMotion === 'step' ? 'selected' : ''}>Step (Staggered)</option>
              <option value="loop" ${this.currentMotion === 'loop' ? 'selected' : ''}>Loop (Continuous)</option>
            </select>
          </div>
          <button id="btn-export-svg" title="Download standalone SVG">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            SVG
          </button>
          <button id="btn-export-html" title="Download standalone HTML">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            HTML
          </button>
          <button id="btn-copy-svg" class="primary" title="Copy SVG to clipboard">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy SVG
          </button>
        </div>
      </header>

      <!-- Main Layout -->
      <div class="layout">
        <!-- Sidebar Navigation -->
        <aside class="sidebar">
          <div class="sidebar-search">
            <input type="text" id="search-input" placeholder="Search 39 diagrams, patterns, importers..." />
          </div>
          <nav class="sidebar-nav" id="sidebar-nav"></nav>
        </aside>

        <!-- Workbench (Editor + Preview) -->
        <main class="workbench">
          <!-- Editor Pane -->
          <section class="editor-pane">
            <div class="pane-header">
              <span class="pane-title" id="editor-title">${this.activeExample.name}</span>
              <button id="btn-reset-config" title="Reset to default example code">Reset Code</button>
            </div>
            <div class="editor-body">
              <textarea class="code-editor" id="code-editor" spellcheck="false"></textarea>
            </div>
            <div class="editor-footer">
              <span id="editor-desc">${this.activeExample.description}</span>
              <span id="editor-format">${this.activeExample.type.toUpperCase()}</span>
            </div>
          </section>

          <!-- Preview Pane -->
          <section class="preview-pane">
            <div class="preview-toolbar">
              <div class="pane-tabs">
                <button class="pane-tab ${this.currentViewMode === 'svg' ? 'active' : ''}" data-view="svg">SVG Canvas</button>
                <button class="pane-tab ${this.currentViewMode === 'html' ? 'active' : ''}" data-view="html">Editorial HTML</button>
                <button class="pane-tab ${this.currentViewMode === 'raw-svg' ? 'active' : ''}" data-view="raw-svg">Raw SVG</button>
                <button class="pane-tab ${this.currentViewMode === 'raw-html' ? 'active' : ''}" data-view="raw-html">Raw HTML</button>
              </div>
              <div class="control-group">
                <button id="btn-zoom-out" title="Zoom Out">−</button>
                <span id="zoom-text" style="font-family: var(--font-mono); font-size: 0.72rem; min-width: 40px; text-align: center;">100%</span>
                <button id="btn-zoom-in" title="Zoom In">+</button>
                <button id="btn-zoom-reset" title="Reset Zoom">1:1</button>
              </div>
            </div>

            <!-- Canvas Viewport -->
            <div class="preview-canvas-container" id="preview-canvas-container">
              <div class="canvas-wrapper" id="canvas-wrapper"></div>
            </div>

            <!-- Taste Gate Linter Drawer -->
            <div class="linter-drawer" id="linter-drawer">
              <div class="linter-header">
                <span>TASTE GATE LINTER AUDIT</span>
                <span id="linter-count-badge"></span>
              </div>
              <div class="linter-list" id="linter-list"></div>
            </div>
          </section>
        </main>
      </div>
    `;

    this.setupEventListeners();
    this.renderSidebar();
    this.updateEditor();
  }

  private setupEventListeners(): void {
    // Theme select
    const themeSelect = document.getElementById('theme-select') as HTMLSelectElement;
    themeSelect?.addEventListener('change', (e: any) => {
      this.currentTheme = e.target.value;
      this.updateTheme();
      this.renderDiagram();
    });

    // Motion select
    const motionSelect = document.getElementById('motion-select') as HTMLSelectElement;
    motionSelect?.addEventListener('change', (e: any) => {
      this.currentMotion = e.target.value;
      this.renderDiagram();
    });

    // Search input
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    searchInput?.addEventListener('input', (e: any) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderSidebar();
    });

    // Reset code
    document.getElementById('btn-reset-config')?.addEventListener('click', () => {
      this.resetConfigText();
      this.updateEditor();
      this.renderDiagram();
    });

    // Code Editor input (debounced)
    const codeEditor = document.getElementById('code-editor') as HTMLTextAreaElement;
    let debounceTimer: any = null;
    codeEditor?.addEventListener('input', (e: any) => {
      this.currentConfigText = e.target.value;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.renderDiagram();
      }, 250);
    });

    // View tabs
    const tabs = document.querySelectorAll('.pane-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e: any) => {
        tabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        this.currentViewMode = e.target.getAttribute('data-view');
        this.updateCanvasView();
      });
    });

    // Zoom controls
    document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
      this.zoomLevel = Math.min(2.5, this.zoomLevel + 0.15);
      this.applyZoom();
    });
    document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
      this.zoomLevel = Math.max(0.4, this.zoomLevel - 0.15);
      this.applyZoom();
    });
    document.getElementById('btn-zoom-reset')?.addEventListener('click', () => {
      this.zoomLevel = 1.0;
      this.applyZoom();
    });

    // Export SVG
    document.getElementById('btn-export-svg')?.addEventListener('click', () => {
      if (!this.currentSvgOutput) return;
      this.downloadFile(`${this.activeExample.id}.svg`, 'image/svg+xml', this.currentSvgOutput);
    });

    // Export HTML
    document.getElementById('btn-export-html')?.addEventListener('click', () => {
      if (!this.currentHtmlOutput) return;
      this.downloadFile(`${this.activeExample.id}.html`, 'text/html', this.currentHtmlOutput);
    });

    // Copy SVG
    document.getElementById('btn-copy-svg')?.addEventListener('click', () => {
      if (!this.currentSvgOutput) return;
      navigator.clipboard.writeText(this.currentSvgOutput);
      const btn = document.getElementById('btn-copy-svg');
      if (btn) {
        const original = btn.innerHTML;
        btn.innerText = 'Copied!';
        setTimeout(() => { btn.innerHTML = original; }, 1500);
      }
    });
  }

  private applyZoom(): void {
    const wrapper = document.getElementById('canvas-wrapper');
    const zoomText = document.getElementById('zoom-text');
    if (wrapper) {
      wrapper.style.transform = `scale(${this.zoomLevel})`;
      wrapper.style.transformOrigin = 'center center';
    }
    if (zoomText) {
      zoomText.innerText = `${Math.round(this.zoomLevel * 100)}%`;
    }
  }

  private renderSidebar(): void {
    const nav = document.getElementById('sidebar-nav');
    if (!nav) return;

    const categories: Array<ExampleDefinition['category']> = [
      'Structural',
      'Hierarchical',
      'Workflow',
      'Quantitative',
      'Data Platform',
      'Semantic Patterns',
      'Importers'
    ];

    let html = '';
    categories.forEach(cat => {
      const items = EXAMPLES.filter(e => {
        const matchesCat = e.category === cat;
        const matchesQuery = !this.searchQuery ||
          e.name.toLowerCase().includes(this.searchQuery) ||
          e.description.toLowerCase().includes(this.searchQuery) ||
          e.id.toLowerCase().includes(this.searchQuery);
        return matchesCat && matchesQuery;
      });

      if (items.length > 0) {
        html += `<div class="nav-category-title">${cat} (${items.length})</div>`;
        items.forEach(item => {
          const isActive = item.id === this.activeExample.id;
          html += `
            <button class="nav-item ${isActive ? 'active' : ''}" data-id="${item.id}">
              <span>${item.name}</span>
              <span class="tag">${item.type}</span>
            </button>
          `;
        });
      }
    });

    if (!html) {
      html = '<div style="padding: 1rem; color: var(--color-muted); font-size: 0.8rem;">No diagrams match your search.</div>';
    }

    nav.innerHTML = html;

    // Attach click handlers
    nav.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', (e: any) => {
        const id = e.currentTarget.getAttribute('data-id');
        const example = EXAMPLES.find(ex => ex.id === id);
        if (example) {
          this.activeExample = example;
          this.resetConfigText();
          this.renderSidebar();
          this.updateEditor();
          this.renderDiagram();
        }
      });
    });
  }

  private updateEditor(): void {
    const editor = document.getElementById('code-editor') as HTMLTextAreaElement;
    const title = document.getElementById('editor-title');
    const desc = document.getElementById('editor-desc');
    const format = document.getElementById('editor-format');

    if (editor) editor.value = this.currentConfigText;
    if (title) title.innerText = this.activeExample.name;
    if (desc) desc.innerText = this.activeExample.description;
    if (format) format.innerText = this.activeExample.type.toUpperCase();
  }

  private updateCanvasView(): void {
    const wrapper = document.getElementById('canvas-wrapper');
    if (!wrapper) return;

    if (this.renderError) {
      wrapper.innerHTML = `
        <div class="error-banner">
          <strong>Render Error:</strong><br>
          ${this.escapeHtml(this.renderError)}
        </div>
      `;
      return;
    }

    if (this.currentViewMode === 'svg') {
      wrapper.className = 'canvas-wrapper';
      wrapper.innerHTML = this.currentSvgOutput;
    } else if (this.currentViewMode === 'html') {
      wrapper.className = 'canvas-wrapper framed-view';
      wrapper.innerHTML = `
        <iframe
          srcdoc="${this.escapeAttr(this.currentHtmlOutput)}"
          style="width: 100%; min-height: 600px; border: 1px solid var(--color-rule); border-radius: 8px; background: white;"
        ></iframe>
      `;
    } else if (this.currentViewMode === 'raw-svg') {
      wrapper.className = 'canvas-wrapper';
      wrapper.innerHTML = `<pre class="raw-code-container">${this.escapeHtml(this.currentSvgOutput)}</pre>`;
    } else if (this.currentViewMode === 'raw-html') {
      wrapper.className = 'canvas-wrapper';
      wrapper.innerHTML = `<pre class="raw-code-container">${this.escapeHtml(this.currentHtmlOutput)}</pre>`;
    }

    this.applyZoom();
  }

  private updateLinterView(): void {
    const list = document.getElementById('linter-list');
    const countBadge = document.getElementById('linter-count-badge');
    if (!list || !countBadge) return;

    if (this.renderError) {
      countBadge.innerHTML = '<span class="linter-badge error">ERROR</span>';
      list.innerHTML = '<div class="linter-item" style="color: var(--color-error)">Syntax error prevents linting.</div>';
      return;
    }

    if (this.currentIssues.length === 0) {
      countBadge.innerHTML = '<span class="linter-badge pass">PASS (0 ISSUES)</span>';
      list.innerHTML = '<div class="linter-item" style="color: var(--color-success)">✓ Compliant with 4px orthogonal grid and geometry mask bounding box bounds.</div>';
    } else {
      const errorCount = this.currentIssues.filter(i => i.severity === 'error').length;
      const warnCount = this.currentIssues.filter(i => i.severity === 'warning').length;

      countBadge.innerHTML = `
        ${errorCount > 0 ? `<span class="linter-badge error">${errorCount} ERR</span>` : ''}
        ${warnCount > 0 ? `<span class="linter-badge warn">${warnCount} WARN</span>` : ''}
      `;

      list.innerHTML = this.currentIssues.map(issue => `
        <div class="linter-item">
          <span class="linter-badge ${issue.severity === 'error' ? 'error' : 'warn'}">${issue.severity}</span>
          <strong>${issue.rule}:</strong>
          <span>${this.escapeHtml(issue.message)}</span>
        </div>
      `).join('');
    }
  }

  private downloadFile(filename: string, mimeType: string, content: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private escapeAttr(str: string): string {
    return str.replace(/"/g, '&quot;');
  }
}
