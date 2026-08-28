import type { ThemeColors, ThemeMode, SizePreset, ViewBox, DetailLevel, AudienceLevel } from '../tokens/types.js';
import { getThemeColors } from '../tokens/palettes.js';
import { SIZE_PRESETS } from '../tokens/typography.js';
import { buildSvgDefs } from '../svg/defs.js';

export interface SummaryCardItem {
  eyebrow?: string;
  title: string;
  items: string[];
  dotColor?: 'coral' | 'ink' | 'muted' | 'link' | 'soft';
}

export interface BaseDiagramOptions {
  id?: string;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  description?: string;
  theme?: ThemeMode;
  customColors?: Partial<ThemeColors>;
  preset?: SizePreset;
  customViewBox?: ViewBox;
  detail?: DetailLevel;
  audience?: AudienceLevel;
  dottedBackground?: boolean;
  sketchy?: boolean;
  framed?: boolean;
  summaryCards?: SummaryCardItem[];
  colophon?: string;
}

export interface RenderedDiagram {
  svg: string;
  options: BaseDiagramOptions;
  colors: ThemeColors;
  viewBox: ViewBox;
}

export abstract class BaseDiagram<TConfig extends BaseDiagramOptions = BaseDiagramOptions> {
  public options: TConfig;
  public colors: ThemeColors;
  public viewBox: ViewBox;
  public id: string;

  constructor(options: TConfig) {
    this.options = options;
    this.id = options.id || `diag-${Math.random().toString(36).substring(2, 9)}`;
    this.colors = getThemeColors(options.theme, options.customColors);

    if (options.customViewBox) {
      this.viewBox = options.customViewBox;
    } else {
      const presetConfig = SIZE_PRESETS[options.preset || 'doc-inline'];
      this.viewBox = presetConfig ? presetConfig.viewBox : { minX: 0, minY: 0, width: 960, height: 600 };
    }
  }

  /**
   * Subclasses implement the inner SVG content (zones, connectors, nodes, labels, etc.)
   */
  abstract renderInnerSvg(): string;

  /**
   * Render complete standalone SVG string with a11y, defs, backgrounds, and content.
   */
  renderSvg(): string {
    const { minX, minY, width, height } = this.viewBox;
    const titleId = `${this.id}-title`;
    const descId = `${this.id}-desc`;
    const descText = this.options.description || this.options.subtitle || this.options.title;

    const defs = buildSvgDefs(this.colors, {
      includeDotsPattern: this.options.dottedBackground,
      includeSketchyFilter: this.options.sketchy,
      idPrefix: this.id
    });

    const bgRect = `  <rect width="100%" height="100%" fill="${this.colors.paper}"/>`;
    const dotsRect = this.options.dottedBackground
      ? `\n  <rect width="100%" height="100%" fill="url(#${this.id}-dots)" opacity="0.6"/>`
      : '';

    const innerContent = this.renderInnerSvg();
    const contentWrapped = this.options.sketchy
      ? `  <g filter="url(#${this.id}-sketchy)">\n${innerContent}\n  </g>`
      : innerContent;

    return `<svg viewBox="${minX} ${minY} ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="${titleId} ${descId}">
  <title id="${titleId}">${this.options.title}</title>
  <desc id="${descId}">${descText}</desc>
${defs}
${bgRect}${dotsRect}
${contentWrapped}
</svg>`;
  }
}
