/**
 * Annihilation: two 511 keV photons at rest (Problem 15), in-flight kinematics,
 * the forbidden single photon, and the PET ring's lines of response.
 */
import { Vector2 } from "scenerystack/dot";
import { describe, expect, it } from "vitest";
import {
  annihilationPhotons,
  initialFourMomentum,
  openingAngle,
  singlePhotonMomentumDeficit,
} from "../src/annihilation/model/annihilation.js";
import { detectorIndexAtAngle, distanceToLine, lineOfResponse } from "../src/annihilation/model/petRing.js";
import { wavelengthOfEnergy } from "../src/common/model/fourMomentum.js";
import { ANNIHILATION, PHYSICS } from "../src/PhotonInteractionsConstants.js";

const ME = PHYSICS.ELECTRON_REST_ENERGY_KEV;

describe("annihilation at rest", () => {
  it("Problem 15: two 511 keV photons of wavelength 2.43 pm, back to back", () => {
    for (const angle of [0, 0.7, Math.PI / 2, 2.5]) {
      const [first, second] = annihilationPhotons(0, angle);
      expect(first.energy).toBeCloseTo(511, 0);
      expect(second.energy).toBeCloseTo(511, 0);
      expect(wavelengthOfEnergy(first.energy)).toBeCloseTo(2.426, 3);
      expect(openingAngle(first, second)).toBeCloseTo(Math.PI, 6);
    }
  });
});

describe("annihilation in flight", () => {
  it("conserves energy and momentum and yields massless photons", () => {
    for (const kinetic of [0, 100, 1000, 5000]) {
      for (const angle of [0, 0.5, Math.PI / 2, 3]) {
        const total = initialFourMomentum(kinetic);
        const [first, second] = annihilationPhotons(kinetic, angle);
        expect(first.energy + second.energy).toBeCloseTo(total.energy, 6);
        expect(first.px + second.px).toBeCloseTo(total.px, 6);
        expect(first.py + second.py).toBeCloseTo(0, 6);
        expect(first.mass).toBeCloseTo(0, 3);
        expect(second.mass).toBeCloseTo(0, 3);
      }
    }
  });

  it("gives the forward photon more energy and closes the opening angle", () => {
    const [first, second] = annihilationPhotons(2000, Math.PI / 3);
    expect(first.energy).toBeGreaterThan(second.energy);
    const [a, b] = annihilationPhotons(2000, Math.PI / 2);
    expect(openingAngle(a, b)).toBeLessThan(Math.PI);
    expect(a.energy).toBeCloseTo(b.energy, 6);
  });

  it("has invariant mass √(2m(K + 2m))", () => {
    expect(initialFourMomentum(1000).mass).toBeCloseTo(Math.sqrt(2 * ME * (1000 + 2 * ME)), 6);
  });
});

describe("one photon", () => {
  it("cannot balance momentum at any positron energy", () => {
    expect(singlePhotonMomentumDeficit(0)).toBeCloseTo(2 * ME, 6);
    for (const kinetic of [10, 1000, 5000, 1e6]) {
      expect(singlePhotonMomentumDeficit(kinetic)).toBeGreaterThan(0);
    }
  });
});

describe("PET ring", () => {
  const R = ANNIHILATION.RING_RADIUS_CM;
  const N = ANNIHILATION.DETECTOR_COUNT;

  it("a central source fires diametrically opposite detectors", () => {
    for (const direction of [0, 0.4, 1.9, 3]) {
      const line = lineOfResponse(Vector2.ZERO, direction, R, N);
      expect(Math.abs(line.indexA - line.indexB)).toBe(N / 2);
    }
  });

  it("every line of response passes within a detector width of the source", () => {
    const source = new Vector2(12, -9);
    const detectorWidth = (2 * Math.PI * R) / N;
    for (let i = 0; i < 60; i++) {
      const line = lineOfResponse(source, (i * Math.PI) / 60, R, N);
      expect(line.a.magnitude).toBeCloseTo(R, 9);
      expect(line.b.magnitude).toBeCloseTo(R, 9);
      expect(distanceToLine(source, line.a, line.b)).toBeLessThan(detectorWidth);
    }
  });

  it("indexes detectors around the ring", () => {
    expect(detectorIndexAtAngle(0, N)).toBe(0);
    expect(detectorIndexAtAngle(Math.PI, N)).toBe(N / 2);
    expect(detectorIndexAtAngle(-Math.PI / 2, N)).toBe((3 * N) / 4);
  });
});
