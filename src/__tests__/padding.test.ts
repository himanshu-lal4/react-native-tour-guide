import { computeShape, resolvePadding } from '../shapes';

const target = { x: 100, y: 200, width: 80, height: 40 };

describe('resolvePadding', () => {
  it('expands a number to all sides', () => {
    expect(resolvePadding(8)).toEqual({ top: 8, right: 8, bottom: 8, left: 8 });
  });

  it('fills missing sides with 0', () => {
    expect(resolvePadding({ top: 10 })).toEqual({ top: 10, right: 0, bottom: 0, left: 0 });
  });

  it('treats undefined as zero padding', () => {
    expect(resolvePadding(undefined)).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
  });
});

describe('computeShape with per-side padding', () => {
  it('uniform number matches the previous behaviour', () => {
    const r = computeShape(target, 10, 0);
    expect(r).toMatchObject({ x: 90, y: 190, width: 100, height: 60 });
  });

  it('per-side padding grows each edge independently', () => {
    const r = computeShape(target, { top: 4, bottom: 12, left: 0, right: 20 }, 0);
    expect(r).toMatchObject({
      x: 100, // left 0
      y: 196, // top 4
      width: 100, // 80 + 0 + 20
      height: 56, // 40 + 4 + 12
    });
  });

  it('keeps circles fully rounded under uniform padding', () => {
    const square = { x: 0, y: 0, width: 40, height: 40 };
    const r = computeShape(square, 10, 20); // radius 20 = fully round
    expect(r).toMatchObject({
      kind: 'rect',
      rx: 30, // (40 + 2*10) / 2 — still a circle
    });
  });
});
