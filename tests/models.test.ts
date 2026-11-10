/**
 * Screen models: the state each one keeps, what it derives, and what reset() restores.
 */
import { Vector2 } from "scenerystack/dot";
import { describe, expect, it } from "vitest";
import { AnnihilationModel } from "../src/annihilation/model/AnnihilationModel.js";
import { ComptonModel } from "../src/compton/model/ComptonModel.js";
import { ANNIHILATION, COMPTON } from "../src/PhotonInteractionsConstants.js";
import { PairProductionModel } from "../src/pair-production/model/PairProductionModel.js";
import { XRayTubeModel } from "../src/xray-tube/model/XRayTubeModel.js";

describe("ComptonModel", () => {
  it("starts at the chapter's worked example", () => {
    const model = new ComptonModel();
    expect(model.wavelengthProperty.value).toBeCloseTo(100, 6);
    expect(model.angleDegreesProperty.value).toBe(60);
    expect(model.shiftProperty.value).toBeCloseTo(1.213, 3);
    expect(model.scatteredWavelengthProperty.value).toBeCloseTo(101.213, 3);
  });

  it("keeps the shift of visible light, parts per million of its wavelength", () => {
    const model = new ComptonModel();
    model.setWavelength(COMPTON.VISIBLE_WAVELENGTH_PM);
    model.angleDegreesProperty.value = 90;
    expect(model.scatteredWavelengthProperty.value - model.wavelengthProperty.value).toBeCloseTo(2.426, 3);
  });

  it("counts every photon fired, and none above the photon's energy plus resolution", () => {
    const model = new ComptonModel();
    model.setEnergy(COMPTON.CESIUM_ENERGY_KEV);
    model.firePhotons(5000);
    expect(model.eventCountProperty.value).toBe(5000);
    expect(model.histogram.reduce((sum, count) => sum + count, 0)).toBe(5000);
    // The last bins lie beyond E(1 + 4σ) and stay empty.
    expect(model.histogram[COMPTON.DETECTOR_BINS - 1]).toBe(0);
  });

  it("has expected fractions that sum to one, with a gap between the edge and the photopeak", () => {
    const model = new ComptonModel();
    model.setEnergy(COMPTON.CESIUM_ENERGY_KEV);
    const fractions = model.expectedFractionsProperty.value;
    expect(fractions.reduce((sum, f) => sum + f, 0)).toBeCloseTo(1, 6);
    // Bin width is 0.02 E: 0.85 E is between the edge (0.72 E) and the photopeak (E).
    expect(fractions[42]).toBeLessThan(1e-6);
  });

  it("empties the histogram when the photon energy changes, and on reset", () => {
    const model = new ComptonModel();
    model.firePhotons(100);
    model.setEnergy(500);
    expect(model.eventCountProperty.value).toBe(0);
    model.firePhotons(100);
    model.firingProperty.value = true;
    model.reset();
    expect(model.eventCountProperty.value).toBe(0);
    expect(model.firingProperty.value).toBe(false);
    expect(model.wavelengthProperty.value).toBeCloseTo(100, 6);
  });

  it("fires photons only while firing is on", () => {
    const model = new ComptonModel();
    model.step(0.05);
    expect(model.eventCountProperty.value).toBe(0);
    model.firingProperty.value = true;
    model.step(0.05);
    expect(model.eventCountProperty.value).toBe(Math.floor(COMPTON.FIRE_RATE_PER_S * 0.05));
  });
});

describe("XRayTubeModel", () => {
  it("starts at the worked example: 80 kV on tungsten, 15.5 pm", () => {
    const model = new XRayTubeModel();
    expect(model.minimumWavelengthProperty.value).toBeCloseTo(15.5, 1);
    expect(model.kShellIonizedProperty.value).toBe(true);
    expect(model.electronBetaProperty.value).toBeCloseTo(0.502, 3);
  });

  it("loses the K lines below the K edge and keeps the L lines", () => {
    const model = new XRayTubeModel();
    model.voltageProperty.value = 60;
    expect(model.kShellIonizedProperty.value).toBe(false);
    expect(model.excitedLinesProperty.value.map((line) => line.label)).toEqual(["Lα", "Lβ", "Lγ"]);
  });

  it("excites copper's K lines above 8.98 kV only", () => {
    const model = new XRayTubeModel();
    model.setExample(8, "copper");
    expect(model.excitedLinesProperty.value).toHaveLength(0);
    model.voltageProperty.value = 9;
    expect(model.excitedLinesProperty.value).toHaveLength(2);
  });
});

describe("PairProductionModel", () => {
  it("starts at the worked example: 3.00 MeV near lead, a pair sharing 1.978 MeV", () => {
    const model = new PairProductionModel();
    expect(model.statusProperty.value).toBe("allowed");
    expect(model.eventProperty.value?.electronKinetic).toBeCloseTo(989, 0);
  });

  it("makes no pair below 1.022 MeV, with or without a nucleus", () => {
    const model = new PairProductionModel();
    model.energyMeVProperty.value = 1;
    expect(model.statusProperty.value).toBe("below");
    model.surroundingsProperty.value = "vacuum";
    expect(model.statusProperty.value).toBe("below");
  });

  it("forbids the process in empty space at any energy", () => {
    const model = new PairProductionModel();
    model.surroundingsProperty.value = "vacuum";
    for (const energy of [1.5, 3, 10]) {
      model.energyMeVProperty.value = energy;
      expect(model.statusProperty.value).toBe("forbidden");
      expect(model.eventProperty.value).toBeNull();
      expect(model.shortfallProperty.value).toBeGreaterThan(0);
    }
  });

  it("gives the electron the share asked for", () => {
    const model = new PairProductionModel();
    model.sharePercentProperty.value = 25;
    const event = model.eventProperty.value;
    expect((event?.electronKinetic ?? 0) / ((event?.electronKinetic ?? 0) + (event?.positronKinetic ?? 1))).toBeCloseTo(
      0.25,
      6,
    );
  });

  it("loops its animation phase", () => {
    const model = new PairProductionModel();
    for (let i = 0; i < 500; i++) {
      model.step(1 / 60);
      expect(model.phaseProperty.value).toBeGreaterThanOrEqual(0);
      expect(model.phaseProperty.value).toBeLessThan(1);
    }
  });
});

describe("AnnihilationModel", () => {
  it("starts at rest: two 511 keV photons, back to back", () => {
    const model = new AnnihilationModel();
    const [first, second] = model.photonsProperty.value;
    expect(first.energy).toBeCloseTo(511, 0);
    expect(second.energy).toBeCloseTo(511, 0);
    expect(model.openingAngleProperty.value).toBeCloseTo(Math.PI, 6);
  });

  it("keeps at most MAX_LINES lines of response but counts every coincidence", () => {
    const model = new AnnihilationModel();
    model.recordAnnihilations(ANNIHILATION.MAX_LINES + 50);
    expect(model.lines).toHaveLength(ANNIHILATION.MAX_LINES);
    expect(model.coincidenceCountProperty.value).toBe(ANNIHILATION.MAX_LINES + 50);
  });

  it("discards the lines when the tracer moves, and on reset", () => {
    const model = new AnnihilationModel();
    model.recordAnnihilations(20);
    model.tracerPositionProperty.value = new Vector2(-5, 3);
    expect(model.lines).toHaveLength(0);
    model.recordAnnihilations(20);
    model.reset();
    expect(model.lines).toHaveLength(0);
    expect(model.coincidenceCountProperty.value).toBe(0);
  });

  it("records only while recording is on", () => {
    const model = new AnnihilationModel();
    model.step(0.1);
    expect(model.coincidenceCountProperty.value).toBe(0);
    model.recordingProperty.value = true;
    for (let i = 0; i < 10; i++) {
      model.step(0.1);
    }
    expect(model.coincidenceCountProperty.value).toBe(ANNIHILATION.EVENT_RATE_PER_S);
  });
});
