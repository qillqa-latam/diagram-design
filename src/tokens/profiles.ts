import type { ThemeProfile } from './types.js';
import { DEFAULT_LIGHT_COLORS, DEFAULT_DARK_COLORS, DEFAULT_LIGHT_SERIES, DEFAULT_DARK_SERIES } from './palettes.js';

export function parseProfileMarkdown(markdown: string): ThemeProfile | null {
  const match = markdown.match(/<!--\s*diagram-design-profile([\s\S]*?)-->/);
  if (!match) return null;

  const header = match[1] || '';
  const lines = header.split('\n');
  const metadata: Record<string, string> = {};

  for (const line of lines) {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const key = parts[0]!.trim();
      const val = parts.slice(1).join(':').trim();
      metadata[key] = val;
    }
  }

  const name = metadata['name'] || 'Unnamed Profile';
  const slug = metadata['slug'] || 'custom';
  const sourceUrl = metadata['source-url'] !== 'none' ? metadata['source-url'] : undefined;
  const created = metadata['created'];
  const updated = metadata['updated'];
  const notes = metadata['notes'] !== 'none' ? metadata['notes'] : undefined;

  return {
    name,
    slug,
    sourceUrl,
    created,
    updated,
    notes,
    colors: {
      light: { ...DEFAULT_LIGHT_COLORS },
      dark: { ...DEFAULT_DARK_COLORS }
    },
    series: {
      light: { ...DEFAULT_LIGHT_SERIES },
      dark: { ...DEFAULT_DARK_SERIES }
    }
  };
}

export function serializeProfileMarkdown(profile: ThemeProfile, bodyContent: string): string {
  const cleanBody = bodyContent.replace(/<!--\s*diagram-design-profile[\s\S]*?-->\n?/g, '').trimStart();
  const header = [
    '<!-- diagram-design-profile',
    `name: ${profile.name}`,
    `slug: ${profile.slug}`,
    `source-url: ${profile.sourceUrl || 'none'}`,
    `created: ${profile.created || new Date().toISOString().split('T')[0]}`,
    `updated: ${profile.updated || new Date().toISOString().split('T')[0]}`,
    `notes: ${profile.notes || 'none'}`,
    '-->'
  ].join('\n');

  return `${header}\n\n${cleanBody}`;
}
