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

/**
 * Compton wavelength of the electron h/mₑc, pm.
 * @internal Exported for unit tests; not part of the application API.
 */
export const COMPTON_WAVELENGTH_PM = PHYSICS.HC_KEV_PM / PHYSICS.ELECTRON_REST_ENERGY_KEV;

// ── Compton screen ────────────────────────────────────────────────────────────

export const COMPTON = {
  /** Largest event-stream interval advanced per rendered frame (s). */
  MAX_FRAME_DT: 0.1,
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

  /** Maximum attempts for sampling a scattered direction (count). */
  MAX_REJECTION_ATTEMPTS: 1000,
  /** Integration samples per detector-spectrum bin (count). */
  CONTINUUM_SAMPLES_PER_BIN: 20,
  /** Minimum broadening width in detector bins. */
  MIN_SIGMA_BINS: 1e-9,
  /** Detector convolution support in standard deviations. */
  BROADENING_SIGMA_REACH: 4,
  /** Schematic broadening of the shifted spectrometer line (dimensionless). */
  SCATTERED_LINE_WIDTH_FACTOR: 1.5,
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

  /** Gaussian line cutoff in standard deviations. */
  LINE_SIGMA_CUTOFF: 6,
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
  CARBON_NUCLEUS_KEV: 12 * PHYSICS.ATOMIC_MASS_UNIT_KEV - 6 * PHYSICS.ELECTRON_REST_ENERGY_KEV,
  LEAD_NUCLEUS_KEV: 207.9766521 * PHYSICS.ATOMIC_MASS_UNIT_KEV - 82 * PHYSICS.ELECTRON_REST_ENERGY_KEV,

  /** Iterations used to solve the recoil energy (count). */
  RECOIL_ITERATIONS: 6,
} as const;

// ── Annihilation screen ───────────────────────────────────────────────────────

export const ANNIHILATION = {
  /** Largest event-stream interval advanced per rendered frame (s). */
  MAX_FRAME_DT: 0.1,
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

/** Shared panel margins (px). */
export const PANEL = {
  X_MARGIN: 12,
  Y_MARGIN: 10,
} as const;

/** Shared bamboo chart chrome (px); DEFAULT_DIGITS is format precision. */
export const CHART = {
  AXIS_LABEL_TOP_OFFSET: 20,
  RIGHT_AXIS_INSET: -32,
  DEFAULT_DIGITS: 3,
} as const;

/** Shared control-helper layout (px); factors are dimensionless. */
export const CONTROLS = {
  WIDE_NUMBER_CONTROL_Y_SPACING: 10,
  NUMBER_CONTROL_TITLE_WIDTH_RESERVE: 110,
  CHECKBOX_LABEL_WIDTH_RESERVE: 30,
  PUSH_BUTTON_LABEL_WIDTH_RESERVE: 24,
  RADIO_LABEL_WIDTH_RESERVE: 40,
  LABEL_MAX_WIDTH_FACTOR: 0.62,
  VALUE_MAX_WIDTH_FACTOR: 0.38,
  NARROW_CONTROL_WIDTH: 170,
  NARROW_NUMBER_CONTROL_Y_SPACING: 6,
  NUMBER_CONTROL_TRACK_HEIGHT: 4,
  RADIO_BUTTON_SPACING: 7,
} as const;

/** Preferences panel typography and spacing. */
export const PREFERENCES = {
  HEADER_FONT_SIZE: 18,
  CHECKBOX_FONT_SIZE: 14,
  CHECKBOX_SPACING: 8,
  SPACING: 12,
} as const;

/** Home-screen icon geometry (px). */
export const SCREEN_ICONS = {
  XRAY_LIMIT_LINE_TOP_Y: 14,
  XRAY_SPECTRUM_LINE_WIDTH: 2.5,
  XRAY_LIMIT_DASH: 4,
  ANNIHILATION_PARTICLE_X_OFFSET: 7,
  SCALE: 4,
  ICON_FROM_WIDTH: 548,
  ICON_FROM_HEIGHT: 373,
  ARROW_HEAD_WIDTH: 10,
  ARROW_HEAD_HEIGHT: 10,
  ARROW_TAIL_WIDTH: 3.5,
  COMPTON_ELECTRON_RADIUS: 6,
  COMPTON_PHOTON_LEFT: 14,
  XRAY_LIMIT_LINE_WIDTH: 1.5,
  XRAY_SPECTRUM_TOP_Y: 10,
  PAIR_TRACK_LINE_WIDTH: 2.5,
  PAIR_PARTICLE_RADIUS: 6,
  ANNIHILATION_PARTICLE_RADIUS: 7,
} as const;

/** Wavy photon-arrow geometry (px). */
export const PHOTON_ARROW = {
  HEAD_LENGTH: 11,
  HEAD_HALF_WIDTH: 5.5,
  AMPLITUDE: 5,
  SAMPLE_SPACING: 1.5,
  DEFAULT_LINE_WIDTH: 2,
} as const;

// ── Per-screen view layout ─────────────────────────────────────────────────

/** Compton screen layout: collision stage, charts, momentum triangle, controls. */
export const COMPTON_VIEW = {
  UNIT_SCALE_DIGITS: 12,
  CHART_TITLE_WIDTH_PAD: 40,
  RATIO_CURVE_DASH: 6,
  RATIO_CURVE_GAP: 4,
  RATIO_TICKS_LEFT_GAP: 5,
  RATIO_AXIS_LABEL_LEFT_GAP: 24,
  SPECTROMETER_PEAK_DASH: 4,
  SHIFTED_LABEL_CENTER_NUDGE: 3,
  SHIFTED_LABEL_TOP_COLLIDE: 16,
  PHOTOPEAK_LABEL_RIGHT_GAP: 3,
  EDGE_LABEL_RIGHT_GAP: 6,
  CHART_WIDTH: 330,
  CHART_HEIGHT: 168,
  CHART_SAMPLES: 180,
  SHIFT_AXIS_MAX_PM: 5,
  CHART_LABEL_MAX_WIDTH: 110,
  TITLED_CHART_SPACING: 6,
  SHIFT_CHART_RANGE_MAX: 180,
  SHIFT_CURVE_LINE_WIDTH: 2.5,
  RATIO_CURVE_LINE_WIDTH: 2,
  SHIFT_MARKER_RADIUS: 5,
  RATIO_MARKER_RADIUS: 4,
  SPECTROMETER_CHART_RANGE_MAX: 1.15,
  SPECTROMETER_CURVE_LINE_WIDTH: 2,
  SPECTROMETER_LABEL_TOP: 3,
  EXPECTED_CURVE_LINE_WIDTH: 1.5,
  DETECTOR_TOUCH_DILATION: 12,
  DETECTOR_MOUSE_DILATION: 6,
  COLLISION_TITLE_WIDTH_INSET: 20,
  COLLISION_AXIS_DASH: 4,
  INCIDENT_LABEL_CENTER_NUDGE: 12,
  INCIDENT_LABEL_BOTTOM_GAP: 12,
  INCIDENT_CAPTION_TOP_GAP: 12,
  COLLISION_WIDTH: 420,
  COLLISION_HEIGHT: 300,
  ORIGIN_X: 180,
  ORIGIN_Y: 172,
  INCIDENT_LENGTH: 150,
  SCATTERED_LENGTH: 118,
  DETECTOR_RADIUS: 140,
  THETA_ARC_RADIUS: 34,
  PHI_ARC_RADIUS: 46,
  INCIDENT_WIGGLE_PX: 14,
  MAX_WIGGLE_PX: 90,
  ELECTRON_ARROW_MIN: 26,
  ELECTRON_ARROW_MAX: 120,
  COLLISION_FRAME_CORNER_RADIUS: 6,
  COLLISION_TITLE_LEFT: 10,
  COLLISION_TITLE_TOP: 8,
  DETECTOR_TRACK_LINE_WIDTH: 1.5,
  ELECTRON_ARROW_TAIL_WIDTH: 3,
  ELECTRON_ARROW_HEAD_WIDTH: 10,
  ELECTRON_ARROW_HEAD_HEIGHT: 11,
  ELECTRON_RADIUS: 7,
  THETA_ARC_LINE_WIDTH: 1.5,
  PHI_ARC_LINE_WIDTH: 1.5,
  CAPTION_MAX_WIDTH: 130,
  DETECTOR_X: -7,
  DETECTOR_Y: -13,
  DETECTOR_WIDTH: 14,
  DETECTOR_HEIGHT: 26,
  DETECTOR_LINE_WIDTH: 2,
  DETECTOR_CORNER_RADIUS: 3,
  COLLISION_CLIP_CORNER_X: 6,
  COLLISION_CLIP_CORNER_Y: 6,
  ENERGY_TEXT_DIGITS: 4,
  WAVELENGTH_TEXT_DIGITS: 5,
  FRACTIONAL_SHIFT_DIGITS: 3,
  ENERGY_VALUE_DIGITS: 4,
  ENERGY_SLIDER_THUMB_HEIGHT: 26,
  CHARTS_LEFT_INSET: 4,
  CONTENT_TOP_GAP: 12,
  DETECTOR_CONTROLS_INNER_SPACING: 24,
  SOURCE_PRESET_SPACING: 6,
  SOURCE_PANEL_WIDTH_PAD: 24,
  SCATTERING_PANEL_WIDTH_PAD: 24,
  GRAPH_PANEL_WIDTH_PAD: 24,
  PRESET_BUTTON_TEXT_WIDTH: 92,
  READOUTS_SPACING: 5,
  DETECTOR_CONTROLS_SPACING: 8,
  ENERGY_SLIDER_HEIGHT: 4,
  ENERGY_SLIDER_WIDTH: 14,
  ENERGY_SLIDER_KEYBOARD_STEP: 0.05,
  ENERGY_SLIDER_SHIFT_KEYBOARD_STEP: 0.005,
  ENERGY_SLIDER_PAGE_KEYBOARD_STEP: 0.5,
  SOURCE_PANEL_SPACING: 8,
  SCATTERING_PANEL_SPACING: 8,
  GRAPH_PANEL_SPACING: 8,
  RIGHT_COLUMN_SPACING: 10,
  TRIANGLE_TITLE_WIDTH_INSET: 20,
  TRIANGLE_INCIDENT_LABEL_TOP_GAP: 5,
  TRIANGLE_WIDTH: 290,
  TRIANGLE_HEIGHT: 158,
  TRIANGLE_INCIDENT_LENGTH: 112,
  TRIANGLE_FRAME_CORNER_RADIUS: 6,
  TRIANGLE_TITLE_LEFT: 10,
  TRIANGLE_TITLE_TOP: 8,
  TRIANGLE_ARROW_TAIL_WIDTH: 3,
  TRIANGLE_ARROW_HEAD_WIDTH: 9,
  TRIANGLE_ARROW_HEAD_HEIGHT: 10,
  SUMMARY_ENERGY_DIGITS: 3,
  SUMMARY_WAVELENGTH_DIGITS: 4,
  SUMMARY_SHIFT_DIGITS: 3,
} as const;

/** X-ray tube screen layout: tube, spectrum, shell diagram, Moseley chart, controls. */
export const XRAY_VIEW = {
  MOSELEY_LAW_DASH: 5,
  MOSELEY_LAW_GAP: 4,
  MOSELEY_POINT_TOP_GAP: 5,
  MOSELEY_SELECTED_RADIUS: 5.5,
  MOSELEY_TITLE_WIDTH_PAD: 60,
  MOSELEY_WIDTH: 220,
  MOSELEY_HEIGHT: 120,
  Z_MAX: 80,
  ORDINATE_MAX: 4.5,
  MOSELEY_LAW_LINE_WIDTH: 1.5,
  MOSELEY_LAW_LABEL_MAX_WIDTH: 100,
  MOSELEY_LEFT_INSET: 6,
  MOSELEY_TOP_INSET: 4,
  MOSELEY_DOT_RADIUS: 4,
  MOSELEY_CHILDREN_SPACING: 6,
  L_SHELL_RADIUS: 34,
  M_SHELL_RADIUS: 52,
  KA_TRANSITION_Y_OFFSET: -5,
  KB_TRANSITION_Y_OFFSET: 5,
  SHELL_TITLE_WIDTH_INSET: 20,
  TRANSITION_LABEL_LEFT_GAP: 8,
  TRANSITION_BASE_Y_OFFSET: 34,
  TRANSITION_EXTRA_Y: 18,
  CAPTION_LINE_WRAP: 130,
  SHELL_CAPTION_LEFT_GAP: 8,
  SHELL_CAPTION_TOP_GAP: 4,
  SHELL_WIDTH: 290,
  SHELL_HEIGHT: 150,
  CENTER_X: 74,
  CENTER_Y: 92,
  K_SHELL_RADIUS: 16,
  SHELL_FRAME_CORNER_RADIUS: 6,
  SHELL_TITLE_LEFT: 10,
  SHELL_TITLE_TOP: 8,
  NUCLEUS_RADIUS: 6,
  SHELL_ELECTRON_DOT_RADIUS: 3,
  VACANCY_RADIUS: 3,
  VACANCY_LINE_WIDTH: 1.5,
  TRANSITION_ARROW_TAIL_WIDTH: 2,
  TRANSITION_ARROW_HEAD_WIDTH: 7,
  TRANSITION_ARROW_HEAD_HEIGHT: 7,
  LIMIT_LINE_DASH: 5,
  LIMIT_LINE_GAP: 4,
  LIMIT_LINE_RIGHT_INSET: 3,
  LIMIT_LABEL_LEFT_GAP: 6,
  LIMIT_LABEL_BOTTOM_GAP: 6,
  LINE_LABEL_BOTTOM: 11,
  SPECTRUM_TITLE_WIDTH_PAD: 40,
  SPECTRUM_WIDTH: 360,
  SPECTRUM_HEIGHT: 210,
  MAX_LINE_LABELS: 6,
  SPECTRUM_Y_RANGE_MAX: 1.12,
  SPECTRUM_CURVE_LINE_WIDTH: 2,
  LIMIT_LINE_WIDTH: 1.5,
  LIMIT_LABEL_MAX_WIDTH: 110,
  SPECTRUM_Y_RANGE_MAX_RESET: 1.12,
  SPECTRUM_BOTTOM_INSET: 4,
  SPECTRUM_CHILDREN_SPACING: 6,
  TUBE_LABEL_RIGHT_GAP: 4,
  ELECTRON_STEP_Y_DIVISOR: 7,
  TUBE_WIDTH: 420,
  TUBE_HEIGHT: 200,
  AXIS_Y: 78,
  CATHODE_X: 78,
  ANODE_X: 318,
  ELECTRONS_PER_MA: 2,
  PHOTON_LENGTH: 92,
  TUBE_FRAME_CORNER_RADIUS: 6,
  GLASS_X: 40,
  GLASS_Y: 32,
  GLASS_WIDTH: 340,
  GLASS_HEIGHT: 92,
  GLASS_LINE_WIDTH: 2,
  GLASS_CORNER_RADIUS: 46,
  CUP_LINE_WIDTH: 4,
  FILAMENT_LINE_WIDTH: 2,
  CATHODE_LEAD_X: 8,
  CATHODE_LEAD_HEIGHT: 6,
  ANODE_LINE_WIDTH: 2,
  ANODE_LEAD_HEIGHT: 6,
  TUBE_LABEL_MAX_WIDTH: 90,
  TUBE_LABEL_TOP: 8,
  ELECTRON_DOT_RADIUS: 3,
  TUBE_CLIP_CORNER_X: 6,
  TUBE_CLIP_CORNER_Y: 6,
  READOUT_DIGITS: 4,
  BETA_DIGITS: 3,
  K_EDGE_DIGITS: 4,
  CONTENT_LEFT_INSET: 4,
  CONTENT_TOP_GAP: 12,
  TUBE_PRESET_SPACING: 6,
  TUBE_PANEL_WIDTH_PAD: 24,
  ANODE_PANEL_WIDTH_PAD: 24,
  GRAPH_PANEL_WIDTH_PAD: 24,
  PRESET_BUTTON_TEXT_WIDTH: 92,
  READOUTS_SPACING: 5,
  TUBE_PANEL_SPACING: 8,
  ANODE_PANEL_SPACING: 8,
  GRAPH_PANEL_SPACING: 8,
  RIGHT_COLUMN_SPACING: 8,
  SUMMARY_WAVELENGTH_DIGITS: 3,
  SUMMARY_ENERGY_DIGITS: 3,
} as const;

/** Pair-production screen layout: event stage, energy/momentum budget, controls. */
export const PAIR_VIEW = {
  BUDGET_PHOTON_ENERGY_DIGITS: 4,
  BUDGET_PHOTON_MOMENTUM_DIGITS: 4,
  BUDGET_CAPTION_DIGITS: 3,
  BUDGET_HEADING_WIDTH_INSET: 20,
  BUDGET_LABEL_WIDTH_INSET: 16,
  BUDGET_LABEL_RIGHT_GAP: 6,
  REST_NEEDED_DASH: 4,
  REST_NEEDED_GAP: 3,
  ENERGY_LEGEND_TOP_GAP: 16,
  BUDGET_CAPTION_WIDTH_INSET: 28,
  BUDGET_VALUE_LEFT_GAP: 5,
  BUDGET_CAPTION_TOP_GAP: 18,
  BUDGET_WIDTH: 420,
  BUDGET_HEIGHT: 246,
  BAR_LEFT: 104,
  BAR_WIDTH: 258,
  BAR_HEIGHT: 16,
  MINIMUM_FULL_SCALE_KEV: 4000,
  MINIMUM_GAP_PX: 2,
  BUDGET_FRAME_CORNER_RADIUS: 6,
  HEADING_LEFT: 10,
  LEGEND_ITEM_SPACING: 4,
  LEGEND_ITEM_WIDTH: 9,
  LEGEND_ITEM_HEIGHT: 9,
  LEGEND_ITEM_MAX_WIDTH: 104,
  ENERGY_PHOTON_Y: 40,
  ENERGY_PAIR_Y: 64,
  REST_NEEDED_LABEL_MAX_WIDTH: 150,
  ENERGY_LEGEND_SPACING: 12,
  ENERGY_LEGEND_LEFT: 14,
  MOMENTUM_TOP: 124,
  CAPTION_LEFT: 14,
  STATUS_WIDTH_INSET: 120,
  STATUS_RIGHT_INSET: 10,
  NUCLEUS_LABEL_TOP_GAP: 5,
  FIELD_SYMBOL_BOTTOM_GAP: 8,
  FIELD_LABEL_LEFT_GAP: 5,
  PHOTON_LABEL_BOTTOM_GAP: 12,
  EVENT_WIDTH: 420,
  EVENT_HEIGHT: 300,
  VERTEX_X: 150,
  VERTEX_Y: 160,
  PHOTON_START_X: 12,
  ARRIVAL_FRACTION: 0.3,
  PIXELS_PER_MM: 8,
  STRAIGHT_TRACK_LENGTH: 230,
  MAX_TRACK_LENGTH: 420,
  TRACK_STEP: 1.5,
  PHOTON_WIGGLE_PX: 12,
  EVENT_FRAME_CORNER_RADIUS: 6,
  TITLE_MAX_WIDTH: 90,
  TITLE_LEFT: 10,
  TITLE_TOP: 8,
  STATUS_TOP: 8,
  NUCLEUS_RADIUS: 9,
  FIELD_LABEL_MAX_WIDTH: 160,
  FIELD_SYMBOL_LEFT: 10,
  FIELD_SYMBOL_CENTER_NUDGE: 40,
  TRACK_LINE_WIDTH: 2.5,
  EVENT_CLIP_CORNER_X: 6,
  EVENT_CLIP_CORNER_Y: 6,
  SPEED_DIGITS: 3,
  ELECTRON_KINETIC_DIGITS: 4,
  POSITRON_KINETIC_DIGITS: 4,
  NUCLEUS_MOMENTUM_DIGITS: 3,
  NUCLEUS_KINETIC_DIGITS: 3,
  SHORTFALL_DIGITS: 3,
  BUDGET_TOP_GAP: 12,
  READOUTS_LEFT_GAP: 14,
  PHOTON_PRESET_SPACING: 5,
  PHOTON_PANEL_WIDTH_PAD: 24,
  SURROUNDINGS_PANEL_WIDTH_PAD: 24,
  PAIR_PANEL_WIDTH_PAD: 24,
  MIDDLE_WIDTH: 290,
  PRESET_BUTTON_TEXT_WIDTH: 58,
  READOUTS_SPACING: 5,
  EQUATIONS_SPACING: 8,
  ENERGY_CONTROL_DECIMAL_PLACES: 2,
  ENERGY_CONTROL_DELTA: 0.01,
  PHOTON_PANEL_SPACING: 8,
  SURROUNDINGS_PANEL_SPACING: 8,
  PAIR_PANEL_SPACING: 8,
  RIGHT_COLUMN_SPACING: 10,
  SUMMARY_PHOTON_DIGITS: 3,
  SUMMARY_ELECTRON_DIGITS: 3,
  SUMMARY_POSITRON_DIGITS: 3,
  SUMMARY_NUCLEUS_MOMENTUM_DIGITS: 3,
  SUMMARY_NUCLEUS_KINETIC_DIGITS: 3,
} as const;

/** Annihilation screen layout: event stage, PET ring, controls. */
export const ANNIHILATION_VIEW = {
  ELECTRON_X_OFFSET: 8,
  POSITRON_X_OFFSET: -8,
  EVENT_ENERGY_DIGITS: 4,
  EVENT_PX_DIGITS: 4,
  VERDICT_DIGITS: 4,
  EVENT_TITLE_WIDTH_INSET: 20,
  EVENT_AXIS_DASH: 4,
  BAR_LABEL_WIDTH_INSET: 18,
  BAR_LABEL_RIGHT_GAP: 6,
  VERDICT_WIDTH_INSET: 28,
  ONE_PHOTON_WIDTH_INSET: 20,
  ELECTRON_LABEL_RIGHT_GAP: 4,
  ELECTRON_LABEL_TOP_GAP: 12,
  POSITRON_LABEL_CENTER_NUDGE: 6,
  POSITRON_LABEL_BOTTOM_GAP: 10,
  BAR_VALUE_LEFT_GAP: 5,
  EVENT_WIDTH: 420,
  EVENT_HEIGHT: 300,
  VERTEX_X: 190,
  VERTEX_Y: 128,
  PHOTON_MIN_LENGTH: 26,
  PHOTON_LENGTH_RANGE: 110,
  REST_WIGGLE_PX: 13,
  POSITRON_MIN_LENGTH: 34,
  POSITRON_LENGTH_RANGE: 110,
  BAR_LEFT: 150,
  BAR_WIDTH: 250,
  BAR_HEIGHT: 12,
  EVENT_FRAME_CORNER_RADIUS: 6,
  EVENT_TITLE_LEFT: 10,
  EVENT_TITLE_TOP: 8,
  AXIS_START_X: 12,
  ELECTRON_RADIUS: 7,
  POSITRON_RADIUS: 7,
  POSITRON_ARROW_TAIL_WIDTH: 3,
  POSITRON_ARROW_HEAD_WIDTH: 10,
  POSITRON_ARROW_HEAD_HEIGHT: 11,
  NEEDS_Y: 232,
  HAS_Y: 254,
  VERDICT_LEFT: 14,
  ONE_PHOTON_LAYER_LEFT: 10,
  ONE_PHOTON_LAYER_TOP: 202,
  EVENT_CLIP_CORNER_X: 6,
  EVENT_CLIP_CORNER_Y: 6,
  PHOTON_ENERGY_DIGITS: 4,
  PHOTON_WAVELENGTH_DIGITS: 4,
  RING_CENTER_X_OFFSET: 30,
  RING_CENTER_Y_OFFSET: 16,
  RING_TITLE_LEFT_GAP: 30,
  RING_TITLE_TOP_GAP: 20,
  POSITRON_PANEL_WIDTH_PAD: 24,
  PHOTONS_PANEL_WIDTH_PAD: 24,
  SCANNER_PANEL_WIDTH_PAD: 24,
  MIDDLE_WIDTH: 290,
  RING_TITLE_MAX_WIDTH: 150,
  COUNT_TEXT_MAX_WIDTH: 170,
  READOUTS_SPACING: 5,
  EQUATIONS_SPACING: 8,
  KINETIC_CONTROL_DECIMAL_PLACES: 2,
  KINETIC_CONTROL_DELTA: 0.01,
  POSITRON_PANEL_SPACING: 8,
  PHOTONS_PANEL_SPACING: 8,
  SCANNER_PANEL_SPACING: 8,
  RIGHT_COLUMN_SPACING: 10,
  TRACER_TOUCH_DILATION: 10,
  RING_RADIUS_PX: 104,
  DETECTOR_DEPTH: 12,
  TRACER_RADIUS: 8,
  KEYBOARD_STEP_CM: 2,
  LOR_OPACITY: 0.45,
  LATEST_LOR_LINE_WIDTH: 2,
  SUMMARY_KINETIC_DIGITS: 3,
  SUMMARY_PHOTON_DIGITS: 3,
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
  PANEL,
  CHART,
  CONTROLS,
  PREFERENCES,
  SCREEN_ICONS,
  PHOTON_ARROW,
  COMPTON_VIEW,
  XRAY_VIEW,
  PAIR_VIEW,
  ANNIHILATION_VIEW,
});
