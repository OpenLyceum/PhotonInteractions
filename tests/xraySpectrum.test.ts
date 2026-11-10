/**
 * X-ray tube: the Duane–Hunt limit (worked example and Problem 7), Kramers'
 * continuum, characteristic lines and Moseley's law.
 */
import { describe, expect, it } from "vitest";
import { wavelengthOfEnergy } from "../src/common/model/fourMomentum.js";
import {
  duaneHuntWavelength,
  isLineExcited,
  kramersContinuum,
  lineStrength,
  moseleyKAlphaEnergy,
  moseleyOrdinate,
  spectrumPerEnergy,
  spectrumPerWavelength,
} from "../src/xray-tube/model/xraySpectrum.js";
import { XRAY_TARGETS, type XRayLine, type XRayTarget, xrayTargetById } from "../src/xray-tube/model/xrayTargets.js";

const tungsten = xrayTargetById("tungsten");
const copper = xrayTargetById("copper");
const molybdenum = xrayTargetById("molybdenum");

/** A target's line by its label; throws rather than returning undefined, so tests need no guards. */
const lineOf = (target: XRayTarget, label: string): XRayLine => {
  const line = target.lines.find((candidate) => candidate.label === label);
  if (!line) {
    throw new Error(`${target.symbol} has no ${label} line`);
  }
  return line;
};

describe("Duane–Hunt limit", () => {
  it("worked example: 80.0 kV gives 15.5 pm", () => {
    expect(duaneHuntWavelength(80)).toBeCloseTo(15.5, 1);
  });

  it("Problem 7: 120 kV gives 10.3 pm, and doubling the voltage halves it", () => {
    expect(duaneHuntWavelength(120)).toBeCloseTo(10.33, 2);
    expect(duaneHuntWavelength(240)).toBeCloseTo(duaneHuntWavelength(120) / 2, 10);
  });

  it("emits nothing at shorter wavelengths, for any target", () => {
    for (const target of XRAY_TARGETS) {
      for (const voltage of [10, 40, 80, 150]) {
        const minimum = duaneHuntWavelength(voltage);
        expect(spectrumPerWavelength(0.99 * minimum, voltage, target)).toBe(0);
        expect(spectrumPerWavelength(1.05 * minimum, voltage, target)).toBeGreaterThan(0);
        expect(spectrumPerEnergy(1.01 * voltage, voltage, target)).toBe(0);
      }
    }
  });

  it("does not depend on the target", () => {
    expect(kramersContinuum(15.4, 80, 29)).toBe(0);
    expect(kramersContinuum(15.4, 80, 74)).toBe(0);
  });
});

describe("Kramers continuum", () => {
  it("peaks at one and a half times the minimum wavelength", () => {
    const minimum = duaneHuntWavelength(50);
    const at = (factor: number): number => kramersContinuum(factor * minimum, 50, 74);
    expect(at(1.5)).toBeGreaterThan(at(1.45));
    expect(at(1.5)).toBeGreaterThan(at(1.55));
  });

  it("is proportional to atomic number", () => {
    expect(kramersContinuum(40, 80, 74) / kramersContinuum(40, 80, 29)).toBeCloseTo(74 / 29, 10);
  });

  it("is a straight line in photon energy, falling to zero at eV", () => {
    // Use a target with no lines in the sampled region.
    const at = (energy: number): number => spectrumPerEnergy(energy, 60, tungsten);
    expect(at(30) / at(45)).toBeCloseTo((60 - 30) / (60 - 45), 6);
  });
});

describe("characteristic lines", () => {
  it("appear only above the shell's binding energy", () => {
    const kAlpha = lineOf(tungsten, "Kα₁");
    expect(isLineExcited(kAlpha, 69)).toBe(false);
    expect(lineStrength(kAlpha, 69, 74)).toBe(0);
    expect(isLineExcited(kAlpha, 70)).toBe(true);
    expect(lineStrength(kAlpha, 80, 74)).toBeGreaterThan(0);
  });

  it("an 80 kV tungsten tube shows its K lines; a 60 kV one shows only L lines", () => {
    const excitedAt = (voltage: number): string[] =>
      tungsten.lines.filter((line) => isLineExcited(line, voltage)).map((line) => line.label);
    expect(excitedAt(80)).toEqual(["Kα₁", "Kα₂", "Kβ", "Lα", "Lβ", "Lγ"]);
    expect(excitedAt(60)).toEqual(["Lα", "Lβ", "Lγ"]);
  });

  it("stay at the same wavelength as the voltage rises, and grow", () => {
    const wavelength = wavelengthOfEnergy(lineOf(copper, "Kα").energyKeV);
    expect(wavelength).toBeCloseTo(154.2, 1);
    const above = (voltage: number): number =>
      spectrumPerWavelength(wavelength, voltage, copper) - kramersContinuum(wavelength, voltage, 29);
    expect(above(8)).toBe(0);
    expect(above(20)).toBeGreaterThan(0);
    expect(above(40)).toBeGreaterThan(above(20));
    // The peak is at the line's wavelength at both voltages.
    for (const voltage of [20, 40]) {
      expect(above(voltage)).toBeGreaterThan(
        spectrumPerWavelength(1.01 * wavelength, voltage, copper) - kramersContinuum(1.01 * wavelength, voltage, 29),
      );
    }
  });

  it("molybdenum Kα is the 0.0711 nm line of Problem 9", () => {
    expect(wavelengthOfEnergy(molybdenum.kAlphaKeV)).toBeCloseTo(71.1, 1);
  });
});

describe("Moseley's law", () => {
  it("predicts Kα within a few percent up to silver", () => {
    for (const target of XRAY_TARGETS.filter((t) => t.atomicNumber < 50)) {
      expect(moseleyKAlphaEnergy(target.atomicNumber) / target.kAlphaKeV).toBeCloseTo(1, 1);
    }
  });

  it("gives copper about 8.0 keV", () => {
    expect(moseleyKAlphaEnergy(29)).toBeCloseTo(8.0, 1);
  });

  it("makes √f linear in Z − 1", () => {
    const ordinate = (z: number): number => moseleyOrdinate(moseleyKAlphaEnergy(z));
    expect(ordinate(41) / ordinate(21)).toBeCloseTo(2, 10);
  });
});
