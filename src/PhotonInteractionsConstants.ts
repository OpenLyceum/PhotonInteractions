/**
 * PhotonInteractionsConstants.ts
 *
 * Every named numeric constant in the simulation, grouped into topical `as const`
 * blocks so four screens' worth of names stay legible.
 *
 * Units
 * ─────
 * The physics runs in **keV and picometres**: photon and particle energies in keV
 * (a "mass" is a rest energy mc²), momenta in keV/c, wavelengths in pm. With those
 * units hc = 1239.84 keV·pm, the same number as the familiar 1240 eV·nm. Screens
 * that are naturally described in MeV (pair production, annihilation) convert at
 * the control, not in the physics.
 *
 * Layout values are in screen pixels. Colours live in PhotonInteractionsColors.ts.
 */

import PhotonInteractionsNamespace from "./PhotonInteractionsNamespace.js";

// ── Layout / chrome (screen pixels) ───────────────────────────────────────────

/** Margin between the screen edge and edge-anchored controls (e.g. Reset All). */
export const SCREEN_VIEW_MARGIN = 20;

/** Corner radius shared by control panels and dialogs. */
export const PANEL_CORNER_RADIUS = 6;

/** Width every control panel is laid out against, so panels line up down a column. */
export const CONTROL_WIDTH = 220;

export const FONTS = {
  TICK_LABEL: "11px sans-serif",
  CHART_TITLE: "bold 13px sans-serif",
  AXIS_LABEL: "12px sans-serif",
  READOUT: "13px sans-serif",
  READOUT_VALUE: "bold 13px sans-serif",
  CONTROL_TITLE: "13px sans-serif",
  SECTION_HEADER: "bold 14px sans-serif",
  BIG_LABEL: "bold 16px sans-serif",
  PARTICLE_LABEL: "bold 12px sans-serif",
  EQUATION: "italic 14px serif",
} as const;

// ── Physical constants (CODATA 2022) ──────────────────────────────────────────

export const PHYSICS = {
  /** hc in keV·pm (identically eV·nm). */
  HC_KEV_PM: 1239.841984,
  /** Electron rest energy mₑc², keV. */
  ELECTRON_REST_ENERGY_KEV: 510.99895,
  /** Planck constant in keV·s, to turn a photon energy into a frequency. */
  PLANCK_KEV_S: 4.135667696e-18,
  /** Rydberg energy, keV: the scale of Moseley's law. */
  RYDBERG_KEV: 0.0136056931,
  /** Atomic mass unit, keV. */
  ATOMIC_MASS_UNIT_KEV: 931494.10242,
  /** Radius of curvature in mm of a singly charged particle: r = this × p[MeV/c] / B[T]. */
  CURVATURE_MM_T_PER_MEV: 3.33564095,
} as const;

/** Compton wavelength of the electron h/mₑc, pm. */
export const COMPTON_WAVELENGTH_PM = PHYSICS.HC_KEV_PM / PHYSICS.ELECTRON_REST_ENERGY_KEV;

// ── Compton screen ────────────────────────────────────────────────────────────

export const COMPTON = {
  /** Incident photon energy is set on a log scale: log₁₀(E / keV). 1 eV to 10 MeV. */
  LOG_ENERGY_MIN: -3,
  LOG_ENERGY_MAX: 4,
  /** Scattering angle range and default (the chapter's worked example), degrees. */
  ANGLE_MIN_DEG: 0,
  ANGLE_MAX_DEG: 180,
  ANGLE_DEFAULT_DEG: 60,
  /** Source presets, as wavelengths (pm) or energies (keV), from the chapter. */
  WORKED_EXAMPLE_WAVELENGTH_PM: 100,
  MOLYBDENUM_WAVELENGTH_PM: 71.1,
  CESIUM_ENERGY_KEV: 661.7,
  VISIBLE_WAVELENGTH_PM: 600000,
  /** Width (standard deviation) of a spectrometer peak, pm: a 1920s crystal spectrometer. */
  SPECTROMETER_SIGMA_PM: 0.2,
  /** Wavelength-shift window the spectrometer chart shows, pm. */
  SPECTROMETER_SHIFT_MIN_PM: -1.5,
  SPECTROMETER_SHIFT_MAX_PM: 6.5,
  /**
   * sin(θ/2)/λ, in pm⁻¹, at which half the scattering from graphite is shifted
   * (incoherent) and half unshifted (coherent, off the whole atom). See doc/model.md.
   */
  BOUND_CROSSOVER_PER_PM: 0.008,
  /** Detector histogram: number of bins across 0 … 1.1 E. */
  DETECTOR_BINS: 55,
  DETECTOR_RANGE_FACTOR: 1.1,
  /** Fraction of detected photons absorbed whole (the photopeak). Schematic. */
  PHOTOPEAK_FRACTION: 0.12,
  /** Detector energy resolution: standard deviation as a fraction of the photon energy. */
  DETECTOR_RESOLUTION: 0.015,
  /** Photons fired per second while "fire photons" is on. */
  FIRE_RATE_PER_S: 240,
  /** Stop counting here, so a forgotten tab does not count for ever. */
  MAX_EVENTS: 50000,
} as const;

// ── X-ray tube screen ─────────────────────────────────────────────────────────

export const XRAY = {
  VOLTAGE_MIN_KV: 5,
  VOLTAGE_MAX_KV: 150,
  VOLTAGE_DEFAULT_KV: 80,
  CURRENT_MIN_MA: 1,
  CURRENT_MAX_MA: 10,
  CURRENT_DEFAULT_MA: 5,
  /** Exponent of the overvoltage dependence of a characteristic line (Green & Cosslett). */
  LINE_OVERVOLTAGE_EXPONENT: 1.63,
  /** Strength of a characteristic line relative to the continuum. Display choice. */
  LINE_SCALE: 3,
  /** Width of a drawn line as a fraction of its wavelength (spectrometer resolution). */
  LINE_RELATIVE_SIGMA: 0.006,
  /** Curve samples across the chart. */
  SPECTRUM_SAMPLES: 600,
} as const;

// ── Pair-production screen ────────────────────────────────────────────────────

export const PAIR = {
  ENERGY_MIN_MEV: 0,
  ENERGY_MAX_MEV: 10,
  ENERGY_DEFAULT_MEV: 3,
  /** Fraction of the available kinetic energy the electron takes. */
  SHARE_MIN: 0.05,
  SHARE_MAX: 0.95,
  SHARE_DEFAULT: 0.5,
  /** Magnetic field of the "bubble chamber", tesla. */
  FIELD_T: 1,
  /** Seconds one photon takes to arrive and its tracks to be drawn. */
  EVENT_PERIOD_S: 3,
  /** Rest energies of the two target nuclei, keV: ¹²C and ²⁰⁸Pb, less their electrons. */
  CARBON_NUCLEUS_KEV: 12 * 931494.10242 - 6 * 510.99895,
  LEAD_NUCLEUS_KEV: 207.9766521 * 931494.10242 - 82 * 510.99895,
} as const;

// ── Annihilation screen ───────────────────────────────────────────────────────

export const ANNIHILATION = {
  /** Positron kinetic energy range, MeV. Zero is annihilation at rest. */
  KINETIC_MIN_MEV: 0,
  KINETIC_MAX_MEV: 5,
  KINETIC_DEFAULT_MEV: 0,
  /** Emission angle of photon 1 in the centre-of-momentum frame, degrees. */
  CM_ANGLE_MIN_DEG: 0,
  CM_ANGLE_MAX_DEG: 180,
  CM_ANGLE_DEFAULT_DEG: 90,
  /** PET scanner: ring radius (cm), number of detectors, how far out the tracer may go. */
  RING_RADIUS_CM: 40,
  DETECTOR_COUNT: 48,
  SOURCE_MAX_RADIUS_CM: 30,
  /** Annihilations recorded per second, and how many lines of response are kept. */
  EVENT_RATE_PER_S: 12,
  MAX_LINES: 120,
} as const;

PhotonInteractionsNamespace.register("PhotonInteractionsConstants", {
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
  CONTROL_WIDTH,
  FONTS,
  PHYSICS,
  COMPTON_WAVELENGTH_PM,
  COMPTON,
  XRAY,
  PAIR,
  ANNIHILATION,
});
