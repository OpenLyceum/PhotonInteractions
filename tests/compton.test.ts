/**
 * Compton scattering: the chapter's worked example and Problems 9, 10, 12 and 17,
 * conservation laws, and the Klein–Nishina distribution.
 */
import { describe, expect, it } from "vitest";
import { energyOfWavelength, wavelengthOfEnergy } from "../src/common/model/fourMomentum.js";
import {
  comptonEdge,
  comptonShift,
  kleinNishina,
  kleinNishinaRecoilSpectrum,
  recoilAngle,
  recoilKineticEnergy,
  recoilMomentum,
  sampleScatteringAngle,
  scatteredEnergy,
  shiftedFraction,
  spectrometerIntensity,
} from "../src/compton/model/compton.js";
import { COMPTON_WAVELENGTH_PM, PHYSICS } from "../src/PhotonInteractionsConstants.js";

const deg = (d: number): number => (d * Math.PI) / 180;
const ME = PHYSICS.ELECTRON_REST_ENERGY_KEV;

/** A small deterministic generator (mulberry32) so sampling tests are repeatable. */
const seeded = (seed: number): (() => number) => {
  let a = seed;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

describe("Compton shift", () => {
  it("has the Compton wavelength h/mc = 2.426 pm", () => {
    expect(COMPTON_WAVELENGTH_PM).toBeCloseTo(2.426, 3);
  });

  it("worked example: 0.100 nm at 60° shifts by 1.21 pm", () => {
    expect(comptonShift(deg(60))).toBeCloseTo(1.21, 2);
    const energy = energyOfWavelength(100);
    expect(energy).toBeCloseTo(12.4, 2);
    const scattered = scatteredEnergy(energy, deg(60));
    expect(scattered).toBeCloseTo(12.25, 2);
    expect(wavelengthOfEnergy(scattered)).toBeCloseTo(101.21, 2);
    // The chapter rounds this to 0.15 keV.
    expect(recoilKineticEnergy(energy, deg(60))).toBeCloseTo(0.15, 2);
  });

  it("Problem 9: 0.0711 nm at 90° shifts by one Compton wavelength", () => {
    expect(comptonShift(deg(90))).toBeCloseTo(2.426, 3);
    const scattered = scatteredEnergy(energyOfWavelength(71.1), deg(90));
    expect(wavelengthOfEnergy(scattered)).toBeCloseTo(73.53, 2);
  });

  it("Problem 10: back-scattering shifts by 2h/mc = 4.85 pm whatever the source", () => {
    expect(comptonShift(Math.PI)).toBeCloseTo(4.853, 3);
    for (const energy of [0.002, 17.4, 662, 5000]) {
      const shift = wavelengthOfEnergy(scatteredEnergy(energy, Math.PI)) - wavelengthOfEnergy(energy);
      expect(shift / comptonShift(Math.PI)).toBeCloseTo(1, 6);
    }
  });

  it("Problem 12: visible light at 90° shifts by four parts per million", () => {
    expect(comptonShift(deg(90)) / 600000).toBeCloseTo(4.04e-6, 8);
  });

  it("does not shift forward-scattered light", () => {
    expect(comptonShift(0)).toBe(0);
    expect(scatteredEnergy(662, 0)).toBe(662);
  });

  it("shifts 22 000 times less off a whole carbon atom", () => {
    const carbonAtom = 12 * PHYSICS.ATOMIC_MASS_UNIT_KEV;
    expect(comptonShift(deg(90)) / comptonShift(deg(90), carbonAtom)).toBeCloseTo(21874, -1);
  });
});

describe("Compton recoil", () => {
  it("Problem 17: the Compton edge of Cs-137 is 0.478 MeV", () => {
    expect(comptonEdge(662)).toBeCloseTo(478, 0);
    expect(scatteredEnergy(662, Math.PI)).toBeCloseTo(184, 0);
  });

  it("conserves energy and momentum at every angle and energy", () => {
    for (const energy of [0.01, 12.4, 100, 662, 3000]) {
      for (const d of [1, 30, 60, 90, 135, 179]) {
        const theta = deg(d);
        const scattered = scatteredEnergy(energy, theta);
        const kinetic = recoilKineticEnergy(energy, theta);
        const phi = recoilAngle(energy, theta);
        const p = recoilMomentum(energy, theta);
        // Energy–momentum relation for the electron.
        expect(Math.hypot(p, ME)).toBeCloseTo(ME + kinetic, 6);
        // Momentum along and across the incident direction.
        expect(scattered * Math.cos(theta) + p * Math.cos(phi)).toBeCloseTo(energy, 6);
        expect(scattered * Math.sin(theta) - p * Math.sin(phi)).toBeCloseTo(0, 6);
      }
    }
  });

  it("sends the electron forward for a back-scattered photon and sideways for a grazing one", () => {
    expect(recoilAngle(662, Math.PI)).toBeCloseTo(0, 10);
    expect(recoilAngle(662, 0)).toBeCloseTo(Math.PI / 2, 10);
  });
});

describe("Klein–Nishina", () => {
  it("reduces to Thomson scattering at low energy", () => {
    for (const d of [0, 45, 90, 135, 180]) {
      const theta = deg(d);
      expect(kleinNishina(1e-4, theta)).toBeCloseTo(0.5 * (1 + Math.cos(theta) ** 2), 5);
    }
  });

  it("suppresses back-scattering at high energy", () => {
    expect(kleinNishina(2000, Math.PI)).toBeLessThan(0.1);
    expect(kleinNishina(2000, 0)).toBeCloseTo(1, 12);
  });

  it("gives the same total cross-section integrated over angle or over recoil energy", () => {
    const energy = 662;
    const n = 20000;
    let overAngle = 0;
    for (let i = 0; i < n; i++) {
      const theta = ((i + 0.5) * Math.PI) / n;
      overAngle += 2 * Math.PI * Math.sin(theta) * kleinNishina(energy, theta) * (Math.PI / n);
    }
    const edge = comptonEdge(energy);
    let overEnergy = 0;
    for (let i = 0; i < n; i++) {
      overEnergy += kleinNishinaRecoilSpectrum(energy, ((i + 0.5) * edge) / n) * (edge / n);
    }
    // dσ/dT is in units of πrₑ²/mc².
    expect((Math.PI * overEnergy) / ME).toBeCloseTo(overAngle, 3);
  });

  it("is zero above the Compton edge", () => {
    expect(kleinNishinaRecoilSpectrum(662, 480)).toBe(0);
    expect(kleinNishinaRecoilSpectrum(662, 470)).toBeGreaterThan(0);
  });

  it("samples angles whose recoil energies follow dσ/dT", () => {
    const energy = 662;
    const random = seeded(12345);
    const edge = comptonEdge(energy);
    const bins = 10;
    const counts = new Array<number>(bins).fill(0);
    const events = 40000;
    for (let i = 0; i < events; i++) {
      const kinetic = recoilKineticEnergy(energy, sampleScatteringAngle(energy, random));
      counts[Math.min(bins - 1, Math.floor((kinetic / edge) * bins))] += 1;
    }
    const expected = new Array<number>(bins).fill(0);
    const sub = 200;
    for (let b = 0; b < bins; b++) {
      for (let j = 0; j < sub; j++) {
        expected[b] += kleinNishinaRecoilSpectrum(energy, ((b + (j + 0.5) / sub) * edge) / bins);
      }
    }
    const total = expected.reduce((sum, v) => sum + v, 0);
    for (let b = 0; b < bins; b++) {
      expect(counts[b] / events).toBeCloseTo(expected[b] / total, 2);
    }
  });
});

describe("Compton's spectrometer", () => {
  it("leaves visible light unshifted and shifts gamma rays entirely", () => {
    expect(shiftedFraction(600000, deg(90))).toBeLessThan(1e-6);
    expect(shiftedFraction(wavelengthOfEnergy(662), deg(90))).toBeGreaterThan(0.999);
  });

  it("shows two peaks for molybdenum X-rays at 90°, the second one Compton wavelength away", () => {
    const at = (shift: number): number => spectrometerIntensity(shift, 71.1, deg(90), true);
    expect(at(0)).toBeGreaterThan(at(1.2));
    expect(at(COMPTON_WAVELENGTH_PM)).toBeGreaterThan(at(1.2));
  });

  it("shows only the shifted peak for free electrons", () => {
    expect(spectrometerIntensity(0, 71.1, deg(90), false)).toBeLessThan(1e-6);
    expect(spectrometerIntensity(COMPTON_WAVELENGTH_PM, 71.1, deg(90), false)).toBeCloseTo(1, 6);
  });
});
