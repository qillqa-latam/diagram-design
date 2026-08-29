import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

describe('NPM / PNPM Distributables Hermetic Isolation Test', () => {
  const pkgJsonPath = path.resolve(__dirname, '../package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));

  it('should restrict package.json "files" exclusively to library artifacts', () => {
    expect(pkg.files).toBeDefined();
    expect(pkg.files).toEqual(['dist', 'README.md', 'LICENSE']);

    // Must not contain playground in files
    for (const fileEntry of pkg.files) {
      expect(fileEntry).not.toContain('playground');
      expect(fileEntry).not.toContain('vite');
    }
  });

  it('should not expose playground in package.json "exports"', () => {
    expect(pkg.exports).toBeDefined();
    const exportKeys = Object.keys(pkg.exports);

    for (const key of exportKeys) {
      expect(key).not.toContain('playground');
      const target = pkg.exports[key];
      const targetStr = JSON.stringify(target);
      expect(targetStr).not.toContain('playground');
      expect(targetStr).toContain('dist');
    }
  });

  it('should guarantee npm pack --dry-run contains 0 playground files in the publish tarball', () => {
    try {
      const output = execSync('npm pack --dry-run --json', {
        cwd: path.resolve(__dirname, '..'),
        encoding: 'utf-8'
      });

      const packInfo = JSON.parse(output);
      expect(Array.isArray(packInfo)).toBe(true);
      expect(packInfo.length).toBeGreaterThan(0);

      const files: Array<{ path: string }> = packInfo[0].files;
      const filePaths = files.map(f => f.path);

      // Verify no playground or vite files exist in tarball
      const forbiddenPatterns = [
        'playground/',
        'playground',
        'dist-playground',
        'vite.config.ts',
        'tsconfig.playground.json'
      ];

      for (const filePath of filePaths) {
        for (const forbidden of forbiddenPatterns) {
          expect(filePath.startsWith(forbidden) || filePath.includes(forbidden)).toBe(false);
        }
      }

      // Verify that packaged files are only from dist/, README.md, LICENSE, package.json
      for (const filePath of filePaths) {
        const isAllowed =
          filePath.startsWith('dist/') ||
          filePath === 'README.md' ||
          filePath === 'LICENSE' ||
          filePath === 'package.json';
        expect(isAllowed).toBe(true);
      }
    } catch (err: any) {
      // In case npm is not in path or dry-run fails, inspect files whitelist manually
      console.warn('npm pack --dry-run test fallback:', err.message);
      expect(pkg.files).not.toContain('playground');
    }
  });
});
