import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface SecurityMatrixRole {
  name: string;
  sublabel?: string;
  permissions: Array<'READ' | 'WRITE' | 'ADMIN' | 'DENY' | '—'>;
}

export interface DpSecurityMatrixDiagramOptions extends BaseDiagramOptions {
  components: string[]; // Column headers
  roles: SecurityMatrixRole[];
}

export class DpSecurityMatrixDiagram extends BaseDiagram<DpSecurityMatrixDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const { width } = this.viewBox;

    const startX = 64;
    const startY = 48;
    const roleColW = 160;
    const availableW = width - 128;
    const matrixW = availableW - roleColW;
    const colCount = this.options.components.length;
    const colW = snapToGrid(matrixW / colCount);

    // 1. Table Outline
    const rowCount = this.options.roles.length;
    const rowH = 44;
    const headerH = 40;
    const totalH = headerH + rowCount * rowH;

    output.push(`  <rect x="${startX}" y="${startY}" width="${availableW}" height="${totalH}" rx="6" fill="${this.colors.paper}"/>`);
    output.push(`  <rect x="${startX}" y="${startY}" width="${availableW}" height="${totalH}" rx="6" fill="#ffffff" stroke="${this.colors.ink}" stroke-width="1"/>`);

    // 2. Header Row
    output.push(`  <rect x="${startX}" y="${startY}" width="${availableW}" height="${headerH}" rx="6" fill="${this.colors.paper2}"/>`);
    output.push(`  <rect x="${startX}" y="${startY + headerH - 4}" width="${availableW}" height="4" fill="${this.colors.paper2}"/>`);
    output.push(`  <line x1="${startX}" y1="${startY + headerH}" x2="${startX + availableW}" y2="${startY + headerH}" stroke="${this.colors.rule}" stroke-width="1"/>`);

    output.push(`  <text x="${startX + 16}" y="${startY + 24}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" letter-spacing="0.1em">ROLE / PRINCIPAL</text>`);

    this.options.components.forEach((comp, idx) => {
      const cx = snapToGrid(startX + roleColW + idx * colW + colW / 2);
      output.push(`  <text x="${cx}" y="${startY + 24}" fill="${this.colors.ink}" font-size="11" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${comp}</text>`);
    });

    // 3. Rows
    this.options.roles.forEach((role, rIdx) => {
      const ry = snapToGrid(startY + headerH + rIdx * rowH);

      if (rIdx % 2 === 1) {
        output.push(`  <rect x="${startX + 1}" y="${ry}" width="${availableW - 2}" height="${rowH}" fill="rgba(45,49,66,0.02)"/>`);
      }
      output.push(`  <line x1="${startX}" y1="${ry + rowH}" x2="${startX + availableW}" y2="${ry + rowH}" stroke="${this.colors.rule}" stroke-width="0.8"/>`);

      // Role Name
      output.push(`  <text x="${startX + 16}" y="${role.sublabel ? ry + 20 : ry + 26}" fill="${this.colors.ink}" font-size="11" font-weight="600" font-family="${FONT_FAMILIES.sans}">${role.name}</text>`);
      if (role.sublabel) {
        output.push(`  <text x="${startX + 16}" y="${ry + 34}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}">${role.sublabel}</text>`);
      }

      // Permissions
      role.permissions.forEach((perm, cIdx) => {
        const cx = snapToGrid(startX + roleColW + cIdx * colW + colW / 2);
        const cy = snapToGrid(ry + rowH / 2);

        let badgeFill = this.colors.paper2;
        let badgeStroke = this.colors.ruleSolid;
        let textFill = this.colors.muted;

        if (perm === 'ADMIN' || perm === 'WRITE') {
          badgeFill = this.colors.accentTint;
          badgeStroke = this.colors.accent;
          textFill = this.colors.accent;
        } else if (perm === 'DENY') {
          badgeFill = 'rgba(45,49,66,0.05)';
          badgeStroke = this.colors.soft;
          textFill = this.colors.soft;
        }

        if (perm === '—') {
          output.push(`  <text x="${cx}" y="${cy + 4}" fill="${this.colors.muted}" font-size="10" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">—</text>`);
        } else {
          output.push(`  <rect x="${cx - 24}" y="${cy - 10}" width="48" height="20" rx="3" fill="${badgeFill}" stroke="${badgeStroke}" stroke-width="0.8"/>`);
          output.push(`  <text x="${cx}" y="${cy + 4}" fill="${textFill}" font-size="8" font-weight="600" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${perm}</text>`);
        }
      });
    });

    return output.join('\n');
  }
}
