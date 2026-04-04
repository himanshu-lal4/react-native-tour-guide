import { computeShape } from '../shapes';
import type { SpotlightTarget } from '../types';

const target: SpotlightTarget = { x: 100, y: 200, width: 80, height: 40 };
const padding = 8;

describe('computeShape - rectangle with uniform border radius', () => {
  it('applies padding to bounds but keeps exact border radius', () => {
    const result = computeShape(target, padding);
    expect(result.kind).toBe('rect');
    if (result.kind !== 'rect') return;
    expect(result.x).toBe(target.x - padding);
    expect(result.y).toBe(target.y - padding);
    expect(result.width).toBe(target.width + padding * 2);
    expect(result.height).toBe(target.height + padding * 2);
    // Default br=12, partial (12 < 40/2=20) → stays 12 exactly
    expect(result.rx).toBe(12);
    expect(result.ry).toBe(12);
  });

  it('fully-rounded radius stays fully rounded with padding', () => {
    const result = computeShape(target, padding, 24);
    if (result.kind !== 'rect') return;
    // 24 >= 40/2=20 → fully rounded → min(96,56)/2 = 28
    expect(result.rx).toBe(28);
    expect(result.ry).toBe(28);
  });

  it('partial radius stays exact with any padding', () => {
    const result = computeShape(target, 20, 12);
    if (result.kind !== 'rect') return;
    // 12 < 40/2=20 → partial → stays 12
    expect(result.rx).toBe(12);
    expect(result.ry).toBe(12);
  });

  it('fully-rounded circle stays circular with padding', () => {
    const circle: SpotlightTarget = { x: 50, y: 50, width: 60, height: 60 };
    const result = computeShape(circle, 6, 30); // 30 = 60/2 → fully rounded
    if (result.kind !== 'rect') return;
    // Should stay fully rounded: min(72,72)/2 = 36
    expect(result.rx).toBe(36);
    expect(result.ry).toBe(36);
    expect(result.width).toBe(72);
    expect(result.height).toBe(72);
  });

  it('zero padding produces exact target bounds', () => {
    const result = computeShape(target, 0);
    if (result.kind !== 'rect') return;
    expect(result.x).toBe(target.x);
    expect(result.y).toBe(target.y);
    expect(result.width).toBe(target.width);
    expect(result.height).toBe(target.height);
  });
});

describe('computeShape - per-corner border radius', () => {
  it('uniform object radii fall back to rect with exact radius', () => {
    const result = computeShape(target, padding, {
      topLeft: 16,
      topRight: 16,
      bottomRight: 16,
      bottomLeft: 16,
    });
    expect(result.kind).toBe('rect');
    if (result.kind !== 'rect') return;
    // 16 < 40/2=20 → partial → stays 16
    expect(result.rx).toBe(16);
    expect(result.ry).toBe(16);
  });

  it('different corner radii produce a path shape', () => {
    const result = computeShape(target, padding, {
      topLeft: 20,
      topRight: 20,
      bottomRight: 0,
      bottomLeft: 0,
    });
    expect(result.kind).toBe('path');
    if (result.kind !== 'path') return;
    expect(result.d).toMatch(/^M/);
    expect(result.d).toContain('Z');
    expect(result.d).toContain('A');
    expect(result.bounds.x).toBe(target.x - padding);
  });

  it('zero-radius corners produce straight lines (no arcs)', () => {
    const result = computeShape(target, padding, {
      topLeft: 0,
      topRight: 0,
      bottomRight: 0,
      bottomLeft: 10,
    });
    if (result.kind !== 'path') return;
    expect(result.d.match(/A/g) ?? []).toHaveLength(1);
  });

  it('missing corners default to 0', () => {
    const result = computeShape(target, padding, {
      topLeft: 12,
    });
    expect(result.kind).toBe('path');
    if (result.kind !== 'path') return;
    expect(result.d.match(/A/g) ?? []).toHaveLength(1);
  });

  it('radii are clamped to half the smallest dimension', () => {
    const smallTarget = { x: 10, y: 10, width: 20, height: 20 };
    const result = computeShape(smallTarget, 0, {
      topLeft: 999,
      topRight: 999,
      bottomRight: 999,
      bottomLeft: 999,
    });
    // All corners same (after clamping) → rect
    expect(result.kind).toBe('rect');
  });
});
