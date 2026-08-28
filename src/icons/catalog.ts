export interface IconDefinition {
  name: string;
  category: 'compute' | 'people' | 'storage' | 'cloud' | 'security' | 'network' | 'misc';
  svgPath: string;
  viewBox?: string;
  fill?: boolean;
}

export const ICON_CATALOG: Record<string, IconDefinition> = {
  laptop: {
    name: 'laptop',
    category: 'compute',
    svgPath: '<path d="M3 19l18 0" /> <path d="M5 7a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1l0 -8" />'
  },
  phone: {
    name: 'phone',
    category: 'compute',
    svgPath: '<path d="M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-14" /> <path d="M11 4h2" /> <path d="M12 17v.01" />'
  },
  desktop: {
    name: 'desktop',
    category: 'compute',
    svgPath: '<path d="M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10" /> <path d="M7 20h10" /> <path d="M9 16v4" /> <path d="M15 16v4" />'
  },
  server: {
    name: 'server',
    category: 'compute',
    svgPath: '<path d="M3 7a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v2a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3" /> <path d="M3 15a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v2a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3l0 -2" /> <path d="M7 8l0 .01" /> <path d="M7 16l0 .01" />'
  },
  container: {
    name: 'container',
    category: 'compute',
    svgPath: '<path d="M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5" /> <path d="M12 12l8 -4.5" /> <path d="M12 12l0 9" /> <path d="M12 12l-8 -4.5" /> <path d="M16 5.25l-8 4.5" />'
  },
  vm: {
    name: 'vm',
    category: 'compute',
    svgPath: '<path d="M21 16.008v-8.018a1.98 1.98 0 0 0 -1 -1.717l-7 -4.008a2.016 2.016 0 0 0 -2 0l-7 4.008c-.619 .355 -1 1.01 -1 1.718v8.018c0 .709 .381 1.363 1 1.717l7 4.008a2.016 2.016 0 0 0 2 0l7 -4.008c.619 -.355 1 -1.01 1 -1.718" /> <path d="M12 22v-10" /> <path d="M12 12l8.73 -5.04" /> <path d="M3.27 6.96l8.73 5.04" />'
  },
  user: {
    name: 'user',
    category: 'people',
    svgPath: '<path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /> <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />'
  },
  users: {
    name: 'users',
    category: 'people',
    svgPath: '<path d="M5 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /> <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" /> <path d="M16 3.13a4 4 0 0 1 0 7.75" /> <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />'
  },
  admin: {
    name: 'admin',
    category: 'people',
    svgPath: '<path d="M6 21v-2a4 4 0 0 1 4 -4h2" /> <path d="M22 16c0 4 -2.5 6 -3.5 6s-3.5 -2 -3.5 -6c1 0 2.5 -.5 3.5 -1.5c1 1 2.5 1.5 3.5 1.5" /> <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />'
  },
  robot: {
    name: 'robot',
    category: 'people',
    svgPath: '<path d="M6 6a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2l0 -4" /> <path d="M12 2v2" /> <path d="M9 12v9" /> <path d="M15 12v9" /> <path d="M5 16l4 -2" /> <path d="M15 14l4 2" /> <path d="M9 18h6" /> <path d="M10 8v.01" /> <path d="M14 8v.01" />'
  },
  database: {
    name: 'database',
    category: 'storage',
    svgPath: '<path d="M12 6m-8 0a8 3 0 1 0 16 0a8 3 0 1 0 -16 0" /> <path d="M4 6v6a8 3 0 0 0 16 0v-6" /> <path d="M4 12v6a8 3 0 0 0 16 0v-6" />'
  },
  cloud: {
    name: 'cloud',
    category: 'cloud',
    svgPath: '<path d="M6.657 18c-2.572 0 -4.657 -2.007 -4.657 -4.483c0 -2.475 2.085 -4.482 4.657 -4.482c.393 -1.762 1.794 -3.2 3.675 -3.773c1.88 -.572 3.956 -.193 5.444 1c1.488 1.19 2.162 3.007 1.77 4.769c2.085 .361 3.454 2.213 3.454 4.486c0 2.476 -2.085 4.483 -4.657 4.483h-9.686z" />'
  },
  lock: {
    name: 'lock',
    category: 'security',
    svgPath: '<path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z" /> <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" /> <path d="M8 11v-4a4 4 0 1 1 8 0v4" />'
  },
  shield: {
    name: 'shield',
    category: 'security',
    svgPath: '<path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3" />'
  },
  key: {
    name: 'key',
    category: 'security',
    svgPath: '<path d="M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .586l-3.348 .4a1 1 0 0 1 -1.107 -1.107l.4 -3.348a2 2 0 0 1 .586 -1.239l6.558 -6.558l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0z" /> <path d="M15 9h.01" />'
  }
};

/**
 * Render an icon as an SVG group element.
 */
export function renderIconSvg(
  iconName: string,
  options: {
    x?: number;
    y?: number;
    size?: number;
    color?: string;
  } = {}
): string {
  const icon = ICON_CATALOG[iconName];
  if (!icon) return '';

  const size = options.size ?? 24;
  const scale = size / 24;
  const x = options.x ?? 0;
  const y = options.y ?? 0;
  const color = options.color ?? 'currentColor';

  const transform = scale !== 1 || x !== 0 || y !== 0
    ? ` transform="translate(${x}, ${y}) scale(${scale})"`
    : '';

  return `<g aria-hidden="true"${transform} stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none">\n    ${icon.svgPath}\n  </g>`;
}
