/**
 * Pair production: threshold (Problem 13), the worked example (3.00 MeV) and
 * Problem 14 (2.50 MeV), the nucleus's role, and track curvature.
 */
import { describe, expect, it } from "vitest";
import { wavelengthOfEnergy } from "../src/common/model/fourMomentum.js";
import { PAIR, PHYSICS } from "../src/PhotonInteractionsConstants.js";
import {
  maximumPairMomentum,
  momentumShortfall,
  PAIR_REST_ENERGY_KEV,
  pairEvent,
  pairThreshold,
  trackRadiusMm,
} from "../src/pair-production/model/pairProduction.js";

const LEAD = PAIR.LEAD_NUCLEUS_KEV;
const CARBON = PAIR.CARBON_NUCLEUS_KEV;

describe("pair-production threshold", () => {
  it("Problem 13: 1.022 MeV, a wavelength of 1.21 pm", () => {
    expect(PAIR_REST_ENERGY_KEV).toBeCloseTo(1022, 0);
    expect(wavelengthOfEnergy(PAIR_REST_ENERGY_KEV)).toBeCloseTo(1.213, 3);
  });

  it("is a hair above 2mc² beside a nucleus, by the recoil energy", () => {
    expect(pairThreshold(LEAD)).toBeGreaterThan(PAIR_REST_ENERGY_KEV);
    expect(pairThreshold(LEAD) - PAIR_REST_ENERGY_KEV).toBeLessThan(0.01);
    expect(pairThreshold(CARBON)).toBeGreaterThan(pairThreshold(LEAD));
  });

  it("produces nothing below threshold", () => {
    expect(pairEvent(1000, 0.5, LEAD)).toBeNull();
    expect(pairEvent(1022.1, 0.5, LEAD)).not.toBeNull();
  });
});

describe("sharing the energy", () => {
  it("worked example: 3.00 MeV leaves 1.978 MeV, 0.989 MeV each", () => {
    const event = pairEvent(3000, 0.5, LEAD);
    expect(event).not.toBeNull();
    expect((event?.electronKinetic ?? 0) + (event?.positronKinetic ?? 0)).toBeCloseTo(1978, 0);
    expect(event?.electronKinetic).toBeCloseTo(989, 0);
    expect(event?.positronKinetic).toBeCloseTo(989, 0);
  });

  it("Problem 14: 2.50 MeV gives 0.739 MeV kinetic and 1.25 MeV total each", () => {
    const event = pairEvent(2500, 0.5, LEAD);
    expect(event?.electronKinetic).toBeCloseTo(739, 0);
    expect(event?.electron.energy).toBeCloseTo(1250, 0);
  });

  it("conserves energy and momentum, with the nucleus included", () => {
    for (const energy of [1100, 2500, 3000, 10000]) {
      for (const share of [0.05, 0.3, 0.5, 0.95]) {
        for (const nucleus of [CARBON, LEAD]) {
          const event = pairEvent(energy, share, nucleus);
          expect(event).not.toBeNull();
          if (event) {
            expect(event.electron.energy + event.positron.energy + event.nucleusKinetic).toBeCloseTo(energy, 6);
            expect(event.electron.px + event.positron.px + event.nucleusPx).toBeCloseTo(energy, 9);
            expect(event.electron.py + event.positron.py + event.nucleusPy).toBeCloseTo(0, 9);
            expect(event.electron.mass).toBeCloseTo(PHYSICS.ELECTRON_REST_ENERGY_KEV, 6);
          }
        }
      }
    }
  });

  it("gives the nucleus plenty of momentum but almost no energy", () => {
    const event = pairEvent(3000, 0.5, LEAD);
    expect(event?.nucleusMomentum).toBeGreaterThan(100);
    // A few eV, out of three million.
    expect((event?.nucleusKinetic ?? 1) * 1000).toBeLessThan(50);
  });
});

describe("an isolated photon", () => {
  it("always has more momentum than the pair could carry", () => {
    for (const energy of [1023, 2000, 10000, 1e7]) {
      expect(maximumPairMomentum(energy)).toBeLessThan(energy);
      expect(momentumShortfall(energy)).toBeGreaterThan(0);
    }
  });

  it("has a shortfall that shrinks with energy but never vanishes", () => {
    expect(momentumShortfall(10000)).toBeLessThan(momentumShortfall(2000));
    expect(momentumShortfall(1e7)).toBeGreaterThan(0);
  });
});

describe("tracks in a magnetic field", () => {
  it("a 1 MeV/c particle in 1 T turns on a 3.34 mm radius", () => {
    expect(trackRadiusMm(1000, 1)).toBeCloseTo(3.336, 3);
  });

  it("curves more tightly for the slower particle", () => {
    const event = pairEvent(3000, 0.2, LEAD);
    expect(trackRadiusMm(event?.electron.momentumMagnitude ?? 0, 1)).toBeLessThan(
      trackRadiusMm(event?.positron.momentumMagnitude ?? 0, 1),
    );
  });
});
