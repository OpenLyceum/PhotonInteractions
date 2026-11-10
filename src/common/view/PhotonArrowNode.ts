/**
 * PhotonArrowNode.ts
 *
 * A photon drawn the way physicists draw one: a wavy line with an arrowhead. The
 * wiggle's wavelength is a parameter, so a scattered photon can be seen to have a
 * longer wavelength than the incident one.
 */

import type { Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Node, Path, type TPaint } from "scenerystack/scenery";

const HEAD_LENGTH = 11;
const HEAD_HALF_WIDTH = 5.5;
const AMPLITUDE = 5;
const SAMPLE_SPACING = 1.5;

export class PhotonArrowNode extends Node {
  private readonly wave: Path;
  private readonly head: Path;

  public constructor(paint: TPaint, lineWidth = 2) {
    super();
    this.wave = new Path(null, { stroke: paint, lineWidth, lineJoin: "round" });
    this.head = new Path(null, { fill: paint });
    this.children = [this.wave, this.head];
  }

  /**
   * Draws the photon from `tail` to `tip` (parent coordinates) with the given
   * wiggle wavelength in pixels. The wavelength is nudged so the wave ends on a
   * zero crossing at the base of the arrowhead.
   */
  public setArrow(tail: Vector2, tip: Vector2, wavelengthPx: number): void {
    const length = tip.distance(tail);
    if (length < HEAD_LENGTH + 2) {
      this.wave.shape = null;
      this.head.shape = null;
      return;
    }
    const ux = (tip.x - tail.x) / length;
    const uy = (tip.y - tail.y) / length;
    const nx = -uy;
    const ny = ux;
    const waveLength = length - HEAD_LENGTH;
    const halfCycles = Math.max(1, Math.round((2 * waveLength) / wavelengthPx));
    const k = (halfCycles * Math.PI) / waveLength;

    const shape = new Shape().moveTo(tail.x, tail.y);
    const samples = Math.ceil(waveLength / SAMPLE_SPACING);
    for (let i = 1; i <= samples; i++) {
      const s = (i / samples) * waveLength;
      const offset = AMPLITUDE * Math.sin(k * s);
      shape.lineTo(tail.x + ux * s + nx * offset, tail.y + uy * s + ny * offset);
    }
    this.wave.shape = shape;

    const baseX = tail.x + ux * waveLength;
    const baseY = tail.y + uy * waveLength;
    this.head.shape = new Shape()
      .moveTo(tip.x, tip.y)
      .lineTo(baseX + nx * HEAD_HALF_WIDTH, baseY + ny * HEAD_HALF_WIDTH)
      .lineTo(baseX - nx * HEAD_HALF_WIDTH, baseY - ny * HEAD_HALF_WIDTH)
      .close();
  }
}
