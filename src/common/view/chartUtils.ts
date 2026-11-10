/**
 * chartUtils.ts
 *
 * Small pure helpers shared by the charts and the numeric readouts (adapted from
 * the RelativisticDynamics sim). They pick a "nice" tick spacing for an arbitrary value range, work out how many
 * decimal places the labels then need, and format values for display.
 *
 * Bamboo's `GridLineSet` / `TickMarkSet` / `TickLabelSet` all take a model-space
 * spacing and lay ticks at `origin + n·spacing`; these helpers choose that spacing
 * and the matching label formatting.
 */

import { toFixed } from "scenerystack/dot";

/**
 * Pick a "nice" step (1, 2, or 5 × 10ⁿ) that yields roughly `targetDivisions`
 * segments across `rangeSpan`. The standard "nice numbers" algorithm, so ticks
 * land on round values (0, 1, 2 … rather than 0.7, 1.4 …).
 */
export const niceStep = (rangeSpan: number, targetDivisions = 5): number => {
  const safeSpan = Number.isFinite(rangeSpan) && rangeSpan > 0 ? rangeSpan : 1;
  const raw = safeSpan / targetDivisions;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const normalized = raw / magnitude;
  let coefficient: number;
  if (normalized < 1.5) {
    coefficient = 1;
  } else if (normalized < 3) {
    coefficient = 2;
  } else if (normalized < 7) {
    coefficient = 5;
  } else {
    coefficient = 10;
  }
  return coefficient * magnitude;
};

/** Number of decimal places a tick label needs so it lines up with its step. */
export const decimalPlacesForStep = (step: number): number => {
  if (step <= 0 || !Number.isFinite(step)) {
    return 0;
  }
  return Math.min(4, Math.max(0, -Math.floor(Math.log10(step))));
};

/** Format a tick or readout value to a fixed number of decimals (dot's stable toFixed). */
export const formatTickValue = (value: number, decimalPlaces: number): string => {
  if (!Number.isFinite(value)) {
    return "—";
  }
  // -0 formats as "-0", which reads as an error rather than as zero.
  return toFixed(value === 0 ? 0 : value, decimalPlaces);
};

/**
 * Format to `digits` significant figures, dropping trailing zeros. Used for γ,
 * which spans 1 to several thousand.
 */
export const formatSignificant = (value: number, digits = 3): string => {
  if (!Number.isFinite(value)) {
    return "—";
  }
  return String(Number(value.toPrecision(digits)));
};

/** A value and the unit that keeps it readable, kept apart so the unit can go in a string pattern. */
export type ValueWithUnit = { value: string; unit: string };

/**
 * Format an energy given in keV with a unit that keeps the number readable: eV
 * below 1 keV, MeV from 1000 keV, GeV from 10⁶ keV. Units are SI symbols and are
 * not translated. A `suffix` such as "/c" turns the unit into a momentum unit.
 */
export const formatEnergyParts = (valueKeV: number, digits = 4): ValueWithUnit => {
  if (!Number.isFinite(valueKeV)) {
    return { value: "—", unit: "keV" };
  }
  const magnitude = Math.abs(valueKeV);
  if (magnitude !== 0 && magnitude < 1) {
    return { value: formatSignificant(valueKeV * 1000, digits), unit: "eV" };
  }
  if (magnitude >= 1e6) {
    return { value: formatSignificant(valueKeV / 1e6, digits), unit: "GeV" };
  }
  if (magnitude >= 1000) {
    return { value: formatSignificant(valueKeV / 1000, digits), unit: "MeV" };
  }
  return { value: formatSignificant(valueKeV, digits), unit: "keV" };
};

/** {@link formatEnergyParts} joined as "value unit". */
export const formatEnergy = (valueKeV: number, digits = 4, unitSuffix = ""): string => {
  const parts = formatEnergyParts(valueKeV, digits);
  return `${parts.value} ${parts.unit}${unitSuffix}`;
};

/**
 * Format a wavelength given in pm: fm below 0.001 pm, nm from 1000 pm, µm from
 * 10⁶ pm.
 */
export const formatWavelength = (valuePm: number, digits = 4): string => {
  if (!Number.isFinite(valuePm)) {
    return "—";
  }
  const magnitude = Math.abs(valuePm);
  if (magnitude !== 0 && magnitude < 0.001) {
    return `${formatSignificant(valuePm * 1000, digits)} fm`;
  }
  if (magnitude >= 1e6) {
    return `${formatSignificant(valuePm / 1e6, digits)} µm`;
  }
  if (magnitude >= 1000) {
    return `${formatSignificant(valuePm / 1000, digits)} nm`;
  }
  return `${formatSignificant(valuePm, digits)} pm`;
};

/** An angle given in radians, as whole-number-or-one-decimal degrees. */
export const formatDegrees = (radians: number, decimalPlaces = 1): string =>
  `${formatTickValue((radians * 180) / Math.PI, decimalPlaces)}°`;
