/**
 * petRing.ts
 *
 * The geometry of a positron-emission tomography scanner: a ring of detectors
 * around a tracer. Each annihilation sends two 511 keV photons in opposite
 * directions; the two detectors that fire in coincidence define a "line of
 * response" on which the annihilation must have happened. Many lines cross at
 * the tracer. Pure functions: no scenery imports. Lengths in cm.
 */

import { Vector2 } from "scenerystack/dot";

export type LineOfResponse = {
  /** Indices of the two detectors that fired. */
  indexA: number;
  indexB: number;
  /** Centres of those detectors on the ring. */
  a: Vector2;
  b: Vector2;
};

/** Centre of detector `index` of `count` on a ring of the given radius. */
export const detectorPosition = (index: number, count: number, ringRadius: number): Vector2 =>
  Vector2.createPolar(ringRadius, (2 * Math.PI * index) / count);

/** Index of the detector that a point on the ring at the given polar angle falls in. */
export const detectorIndexAtAngle = (angle: number, count: number): number => {
  const index = Math.round((angle / (2 * Math.PI)) * count) % count;
  return index < 0 ? index + count : index;
};

/**
 * The line of response recorded when a tracer at `source` emits a back-to-back
 * photon pair along `direction` (radians). The source must lie inside the ring.
 */
export const lineOfResponse = (
  source: Vector2,
  direction: number,
  ringRadius: number,
  detectorCount: number,
): LineOfResponse => {
  const dx = Math.cos(direction);
  const dy = Math.sin(direction);
  // |source + t d|² = R²  →  t = −s·d ± √((s·d)² + R² − |s|²)
  const along = source.x * dx + source.y * dy;
  const root = Math.sqrt(Math.max(0, along * along + ringRadius * ringRadius - source.magnitudeSquared));
  const hit = (t: number): number => Math.atan2(source.y + t * dy, source.x + t * dx);
  const indexA = detectorIndexAtAngle(hit(-along + root), detectorCount);
  const indexB = detectorIndexAtAngle(hit(-along - root), detectorCount);
  return {
    indexA,
    indexB,
    a: detectorPosition(indexA, detectorCount, ringRadius),
    b: detectorPosition(indexB, detectorCount, ringRadius),
  };
};

/** Perpendicular distance from a point to the infinite line through a and b. */
export const distanceToLine = (point: Vector2, a: Vector2, b: Vector2): number => {
  const length = a.distance(b);
  return length === 0
    ? point.distance(a)
    : Math.abs((b.x - a.x) * (a.y - point.y) - (a.x - point.x) * (b.y - a.y)) / length;
};
