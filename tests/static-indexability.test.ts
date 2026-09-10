import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const meta = (property: string) => html.match(new RegExp(`<meta\\s+property="${property}"\\s+content="([^"]+)"`, 'i'))?.[1];

describe('FortressAssureX static indexability metadata', () => {
  it('publishes truthful canonical and social metadata', () => {
    expect(html).toContain('<title>FortressAssureX | Evidence-led Assessment MVP</title>');
    expect(html).toContain('name="description" content="A browser-only register for evidence-linked human security findings. It does not perform automated control validation, scoring, assurance, or compliance attestation."');
    expect(html).toContain('<link rel="canonical" href="https://fortressassurex.vectrionx.com/">');
    expect(meta('og:title')).toBe('FortressAssureX | Evidence-led Assessment MVP');
    expect(meta('og:url')).toBe('https://fortressassurex.vectrionx.com/');
  });

  it('publishes a minimal accurate application schema', () => {
    expect(html).toContain('"@type":["WebApplication","Product"]');
    expect(html).toContain('"url":"https://fortressassurex.vectrionx.com/"');
  });

  it('provides an allowed-root sitemap', () => {
    expect(readFileSync(resolve(root, 'public/sitemap.xml'), 'utf8')).toContain('<loc>https://fortressassurex.vectrionx.com/</loc>');
    expect(readFileSync(resolve(root, 'public/robots.txt'), 'utf8')).toContain('Allow: /');
  });
});
