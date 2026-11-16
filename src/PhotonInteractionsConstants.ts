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

/** Settings for annihilation/view/AnnihilationEventNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const ANNIHILATION_EVENT_NODE_SETTINGS = {
  ELECTRON_X_OFFSET: 8, // px
  POSITRON_X_OFFSET: -8, // px
  ENERGY_FORMAT_ENERGY_DIGITS: 4, // digits
  PX_FORMAT_ENERGY_DIGITS: 4, // digits
  VERDICT_DIGITS: 4, // digits

  TITLE_MAX_WIDTH_OFFSET: 20, // px
  AXIS_LINE_DASH_DASH: 4, // px
  TEXT_MAX_WIDTH_OFFSET: 18, // px
  PLACE_RIGHT_OFFSET: 6, // px
  VERDICT_MAX_WIDTH_OFFSET: 28, // px
  ONE_PHOTON_LAYER_MAX_WIDTH_OFFSET: 20, // px
  CONSTRUCTOR_RIGHT_OFFSET: 4, // px
  CONSTRUCTOR_TOP_OFFSET: 12, // px
  CONSTRUCTOR_CENTER_X_OFFSET: 6, // px
  CONSTRUCTOR_BOTTOM_OFFSET: 10, // px
  CONSTRUCTOR_LEFT_OFFSET: 5, // px

  EVENT_WIDTH: 420,
  EVENT_HEIGHT: 300,
  VERTEX_X: 190,
  VERTEX_Y: 128,
  PHOTON_MIN_LENGTH: 26,
  PHOTON_LENGTH_RANGE: 110,
  /** Drawn wiggle of a 511 keV photon, px; others scale with wavelength. */
  REST_WIGGLE_PX: 13,
  /** Drawn wiggle of a 511 keV photon, px; others scale with wavelength. */
  POSITRON_MIN_LENGTH: 34,
  /** Drawn wiggle of a 511 keV photon, px; others scale with wavelength. */
  POSITRON_LENGTH_RANGE: 110,
  /** Drawn wiggle of a 511 keV photon, px; others scale with wavelength. */
  BAR_LEFT: 150,
  /** Drawn wiggle of a 511 keV photon, px; others scale with wavelength. */
  BAR_WIDTH: 250,
  /** Drawn wiggle of a 511 keV photon, px; others scale with wavelength. */
  BAR_HEIGHT: 12,
  FRAME_CORNER_RADIUS: 6,
  TITLE_LEFT: 10,
  TITLE_TOP: 8,
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
  CLIP_AREA_CORNER_X: 6,
  CLIP_AREA_CORNER_Y: 6,
} as const;

/** Settings for annihilation/view/AnnihilationScreenView.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const ANNIHILATION_SCREEN_VIEW_SETTINGS = {
  ENERGY_FORMAT_ENERGY_DIGITS: 4, // digits
  WAVELENGTH_DIGITS: 4, // digits

  CONSTRUCTOR_X_OFFSET: 30, // px
  CONSTRUCTOR_Y_OFFSET: 16, // px
  CONSTRUCTOR_LEFT_OFFSET: 30, // px
  CONSTRUCTOR_TOP_OFFSET: 20, // px
  POSITRON_PANEL_MIN_WIDTH_OFFSET: 24, // px
  PHOTONS_PANEL_MIN_WIDTH_OFFSET: 24, // px
  SCANNER_PANEL_MIN_WIDTH_OFFSET: 24, // px

  MIDDLE_WIDTH: 290,
  RING_TITLE_MAX_WIDTH: 150,
  COUNT_TEXT_MAX_WIDTH: 170,
  READOUTS_SPACING: 5,
  EQUATIONS_SPACING: 8,
  /** Kinetic control decimal places (dimensionless). */
  KINETIC_CONTROL_DECIMAL_PLACES: 2,
  /** Kinetic control delta (dimensionless). */
  KINETIC_CONTROL_DELTA: 0.01,
  POSITRON_PANEL_SPACING: 8,
  PHOTONS_PANEL_SPACING: 8,
  SCANNER_PANEL_SPACING: 8,
  RIGHT_COLUMN_SPACING: 10,
} as const;

/** Settings for annihilation/view/PetRingNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const PET_RING_NODE_SETTINGS = {
  TRACER_DILATION: 10, // px

  /** Ring radius on screen, px. */
  RING_RADIUS_PX: 104,
  /** Ring radius on screen, px. */
  DETECTOR_DEPTH: 12,
  /** Ring radius on screen, px. */
  TRACER_RADIUS: 8,
  /** Ring radius on screen, px. */
  KEYBOARD_STEP_CM: 2,
  /** Lines opacity (dimensionless). */
  LINES_OPACITY: 0.45,
  LATEST_LINE_WIDTH: 2,
} as const;

/** Settings for common/PhotonInteractionsPanel.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const PHOTON_INTERACTIONS_PANEL_SETTINGS = {
  OPTIONS_X_MARGIN: 12,
  OPTIONS_Y_MARGIN: 10,
} as const;

/** Settings for common/PhotonInteractionsScreenIcons.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const PHOTON_INTERACTIONS_SCREEN_ICONS_SETTINGS = {
  CREATE_X_RAY_TUBE_ICON_END_Y_SEGMENT_2: 14, // px
  CREATE_X_RAY_TUBE_ICON_LINE_WIDTH_VARIANT_2: 2.5, // px

  CREATE_X_RAY_TUBE_ICON_LINE_DASH_DASH: 4, // px
  CREATE_ANNIHILATION_ICON_X_OFFSET: 7, // px

  SCALE: 4,
  ICON_FROM_WIDTH: 548,
  ICON_FROM_HEIGHT: 373,
  ARROW_HEAD_WIDTH: 10,
  ARROW_HEAD_HEIGHT: 10,
  ARROW_TAIL_WIDTH: 3.5,
  CREATE_COMPTON_ICON_RADIUS: 6,
  LEFT: 14,
  CREATE_X_RAY_TUBE_ICON_LINE_WIDTH: 1.5,
  CREATE_X_RAY_TUBE_ICON_END_Y: 10,
  CREATE_PAIR_PRODUCTION_ICON_LINE_WIDTH: 2.5,
  CREATE_PAIR_PRODUCTION_ICON_RADIUS: 6,
  CREATE_ANNIHILATION_ICON_RADIUS: 7,
} as const;

/** Settings for common/view/ChartFrameNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const CHART_FRAME_NODE_SETTINGS = {
  PLACE_AXIS_LABELS_TOP_OFFSET: 20, // px

  RIGHT_RIGHT: -32,
} as const;

/** Settings for common/view/PhotonArrowNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const PHOTON_ARROW_NODE_SETTINGS = {
  /** PhotonArrowNode.ts   A photon drawn the way physicists draw one: a wavy line with an arrowhead. The  wiggle's wavelength is a parameter, so a scattered photon can be seen to have a  longer wavelength than the incident one. */
  HEAD_LENGTH: 11,
  /** PhotonArrowNode.ts   A photon drawn the way physicists draw one: a wavy line with an arrowhead. The  wiggle's wavelength is a parameter, so a scattered photon can be seen to have a  longer wavelength than the incident one. */
  HEAD_HALF_WIDTH: 5.5,
  /** PhotonArrowNode.ts   A photon drawn the way physicists draw one: a wavy line with an arrowhead. The  wiggle's wavelength is a parameter, so a scattered photon can be seen to have a  longer wavelength than the incident one. */
  AMPLITUDE: 5,
  /** PhotonArrowNode.ts   A photon drawn the way physicists draw one: a wavy line with an arrowhead. The  wiggle's wavelength is a parameter, so a scattered photon can be seen to have a  longer wavelength than the incident one. */
  SAMPLE_SPACING: 1.5,
  DEFAULT_LINE_WIDTH: 2,
} as const;

/** Settings for common/view/chartUtils.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const CHART_UTILS_SETTINGS = {
  DEFAULT_DIGITS: 3,
} as const;

/** Settings for common/view/controlHelpers.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const CONTROL_HELPERS_SETTINGS = {
  CREATE_NUMBER_CONTROL_Y_SPACING_VARIANT_2: 10, // px

  CREATE_NUMBER_CONTROL_MAX_WIDTH_OFFSET: 110, // px
  CREATE_CHECKBOX_MAX_WIDTH_OFFSET: 30, // px
  CREATE_PUSH_BUTTON_MAX_WIDTH_OFFSET: 24, // px
  CREATE_RADIO_BUTTON_GROUP_MAX_WIDTH_OFFSET: 40, // px
  LABEL_MAX_WIDTH_FACTOR: 0.62, // dimensionless
  VALUE_MAX_WIDTH_FACTOR: 0.38, // dimensionless

  /** Below this width the title gets its own row. */
  NARROW_CONTROL_WIDTH: 170,
  CREATE_NUMBER_CONTROL_Y_SPACING: 6,
  CREATE_NUMBER_CONTROL_HEIGHT: 4,
  CREATE_RADIO_BUTTON_GROUP_SPACING: 7,
} as const;

/** Settings for compton/view/ComptonChartsNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const COMPTON_CHARTS_NODE_SETTINGS = {
  UNIT_SCALE_DIGITS: 12, // digits

  TITLED_MAX_WIDTH_OFFSET: 40, // px
  RATIO_CURVE_LINE_DASH_DASH: 6, // px
  CONSTRUCTOR_RATIO_CURVE_LINE_DASH_DASH: 4, // px
  RATIO_TICKS_LEFT_OFFSET: 5, // px
  PLACE_RATIO_AXIS_LABEL_LEFT_OFFSET: 24, // px
  VERTICAL_LINE_LINE_DASH_DASH: 4, // px
  CONSTRUCTOR_CENTER_X_OFFSET: 3, // px
  CONSTRUCTOR_TOP: 16, // px
  UPDATE_DETECTOR_RIGHT_OFFSET: 3, // px
  CONSTRUCTOR_UPDATE_DETECTOR_RIGHT_OFFSET: 6, // px

  WIDTH: 330,
  HEIGHT: 168,
  SAMPLES: 180,
  /** Top of the shift chart, pm: just above the 180° shift of 2h/mc = 4.85 pm. */
  SHIFT_AXIS_MAX_PM: 5,
  CHART_LABEL_MAX_WIDTH: 110,
  TITLED_SPACING: 6,
  /** Shift chart range max (in the source module’s documented units). */
  SHIFT_CHART_RANGE_MAX: 180,
  SHIFT_CURVE_LINE_WIDTH: 2.5,
  RATIO_CURVE_LINE_WIDTH: 2,
  SHIFT_MARKER_RADIUS: 5,
  RATIO_MARKER_RADIUS: 4,
  /** Spectrometer chart range max (in the source module’s documented units). */
  SPECTROMETER_CHART_RANGE_MAX: 1.15,
  SPECTROMETER_CURVE_LINE_WIDTH: 2,
  TOP_TOP: 3,
  EXPECTED_CURVE_LINE_WIDTH: 1.5,
} as const;

/** Settings for compton/view/ComptonCollisionNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const COMPTON_COLLISION_NODE_SETTINGS = {
  DETECTOR_DILATION: 12, // px
  DETECTOR_DILATION_SEGMENT_2: 6, // px

  TITLE_MAX_WIDTH_OFFSET: 20, // px
  AXIS_LINE_DASH_DASH: 4, // px
  CONSTRUCTOR_CENTER_X_OFFSET: 12, // px
  CONSTRUCTOR_BOTTOM_OFFSET: 12, // px
  PLACE_INCIDENT_CAPTION_TOP_OFFSET: 12, // px

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
  FRAME_CORNER_RADIUS: 6,
  TITLE_LEFT: 10,
  TITLE_TOP: 8,
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
  CLIP_AREA_CORNER_X: 6,
  CLIP_AREA_CORNER_Y: 6,
} as const;

/** Settings for compton/view/ComptonScreenView.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const COMPTON_SCREEN_VIEW_SETTINGS = {
  ENERGY_TEXT_DIGITS: 4, // digits
  WAVELENGTH_TEXT_DIGITS: 5, // digits
  FRACTIONAL_SHIFT_PROPERTY_DIGITS: 3, // digits
  ENERGY_VALUE_PROPERTY_DIGITS: 4, // digits
  ENERGY_SLIDER_WIDTH_DIMENSION2_HEIGHT: 26, // px

  CONSTRUCTOR_LEFT_OFFSET: 4, // px
  CONSTRUCTOR_TOP_OFFSET: 12, // px
  CONSTRUCTOR_DETECTOR_CONTROLS_SPACING: 24, // px
  CONSTRUCTOR_SOURCE_PANEL_SPACING: 6, // px
  SOURCE_PANEL_MIN_WIDTH_OFFSET: 24, // px
  SCATTERING_PANEL_MIN_WIDTH_OFFSET: 24, // px
  GRAPH_PANEL_MIN_WIDTH_OFFSET: 24, // px

  PRESET_BUTTON_TEXT_WIDTH: 92,
  READOUTS_SPACING: 5,
  DETECTOR_CONTROLS_SPACING: 8,
  ENERGY_SLIDER_HEIGHT: 4,
  ENERGY_SLIDER_WIDTH: 14,
  /** Energy slider keyboard step (dimensionless). */
  ENERGY_SLIDER_KEYBOARD_STEP: 0.05,
  /** Energy slider shift keyboard step (dimensionless). */
  ENERGY_SLIDER_SHIFT_KEYBOARD_STEP: 0.005,
  /** Energy slider page keyboard step (dimensionless). */
  ENERGY_SLIDER_PAGE_KEYBOARD_STEP: 0.5,
  SOURCE_PANEL_SPACING: 8,
  SCATTERING_PANEL_SPACING: 8,
  GRAPH_PANEL_SPACING: 8,
  RIGHT_COLUMN_SPACING: 10,
} as const;

/** Settings for compton/view/MomentumTriangleNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const MOMENTUM_TRIANGLE_NODE_SETTINGS = {
  TITLE_MAX_WIDTH_OFFSET: 20, // px
  CONSTRUCTOR_TOP_OFFSET: 5, // px

  TRIANGLE_WIDTH: 290,
  TRIANGLE_HEIGHT: 158,
  INCIDENT_LENGTH: 112,
  FRAME_CORNER_RADIUS: 6,
  TITLE_LEFT: 10,
  TITLE_TOP: 8,
  ARROW_TAIL_WIDTH: 3,
  ARROW_HEAD_WIDTH: 9,
  ARROW_HEAD_HEIGHT: 10,
} as const;

/** Settings for pair-production/view/PairBudgetNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const PAIR_BUDGET_NODE_SETTINGS = {
  PHOTON_ENERGY_VALUE_DIGITS: 4, // digits
  PHOTON_MOMENTUM_VALUE_DIGITS: 4, // digits
  CAPTION_DIGITS: 3, // digits

  HEADING_MAX_WIDTH_OFFSET: 20, // px
  TEXT_MAX_WIDTH_OFFSET: 16, // px
  PLACE_RIGHT_OFFSET: 6, // px
  REST_NEEDED_LINE_DASH_DASH: 4, // px
  CONSTRUCTOR_REST_NEEDED_LINE_DASH_DASH: 3, // px
  ENERGY_LEGEND_TOP_OFFSET: 16, // px
  CAPTION_MAX_WIDTH_OFFSET: 28, // px
  CONSTRUCTOR_LEFT_OFFSET: 5, // px
  CONSTRUCTOR_TOP_OFFSET: 18, // px

  BUDGET_WIDTH: 420,
  BUDGET_HEIGHT: 246,
  BAR_LEFT: 104,
  BAR_WIDTH: 258,
  BAR_HEIGHT: 16,
  /** The bars are scaled so this much energy (keV) fills the width, until the photon needs more room. */
  MINIMUM_FULL_SCALE_KEV: 4000,
  /** A gap narrower than this is drawn this wide, so the momentum shortfall never vanishes from view. */
  MINIMUM_GAP_PX: 2,
  FRAME_CORNER_RADIUS: 6,
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
} as const;

/** Settings for pair-production/view/PairEventNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const PAIR_EVENT_NODE_SETTINGS = {
  STATUS_TEXT_MAX_WIDTH_OFFSET: 120, // px
  CONSTRUCTOR_RIGHT_OFFSET: 10, // px
  CONSTRUCTOR_TOP_OFFSET: 5, // px
  FIELD_SYMBOL_BOTTOM_OFFSET: 8, // px
  PLACE_FIELD_LABEL_LEFT_OFFSET: 5, // px
  CONSTRUCTOR_BOTTOM_OFFSET: 12, // px

  EVENT_WIDTH: 420,
  EVENT_HEIGHT: 300,
  VERTEX_X: 150,
  VERTEX_Y: 160,
  PHOTON_START_X: 12,
  /** Fraction of the animation the photon spends arriving. */
  ARRIVAL: 0.3,
  /** Fraction of the animation the photon spends arriving. */
  PIXELS_PER_MM: 8,
  /** Fraction of the animation the photon spends arriving. */
  STRAIGHT_TRACK_LENGTH: 230,
  /** Fraction of the animation the photon spends arriving. */
  MAX_TRACK_LENGTH: 420,
  /** Fraction of the animation the photon spends arriving. */
  TRACK_STEP: 1.5,
  /** Fraction of the animation the photon spends arriving. */
  PHOTON_WIGGLE_PX: 12,
  FRAME_CORNER_RADIUS: 6,
  TITLE_MAX_WIDTH: 90,
  TITLE_LEFT: 10,
  TITLE_TOP: 8,
  TOP_TOP: 8,
  NUCLEUS_RADIUS: 9,
  FIELD_LABEL_MAX_WIDTH: 160,
  FIELD_SYMBOL_LEFT: 10,
  CENTER_X_CENTER_X: 40,
  TRACK_LINE_WIDTH: 2.5,
  CLIP_AREA_CORNER_X: 6,
  CLIP_AREA_CORNER_Y: 6,
} as const;

/** Settings for pair-production/view/PairProductionScreenView.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const PAIR_PRODUCTION_SCREEN_VIEW_SETTINGS = {
  SPEED_DIGITS: 3, // digits
  ELECTRON_KINETIC_FORMAT_ENERGY_DIGITS: 4, // digits
  POSITRON_KINETIC_FORMAT_ENERGY_DIGITS: 4, // digits
  NUCLEUS_MOMENTUM_FORMAT_ENERGY_DIGITS: 3, // digits
  NUCLEUS_KINETIC_FORMAT_ENERGY_DIGITS: 3, // digits
  READOUTS_DIGITS: 3, // digits

  CONSTRUCTOR_TOP_OFFSET: 12, // px
  CONSTRUCTOR_LEFT_OFFSET: 14, // px
  CONSTRUCTOR_PHOTON_PANEL_SPACING: 5, // px
  PHOTON_PANEL_MIN_WIDTH_OFFSET: 24, // px
  SURROUNDINGS_PANEL_MIN_WIDTH_OFFSET: 24, // px
  PAIR_PANEL_MIN_WIDTH_OFFSET: 24, // px

  MIDDLE_WIDTH: 290,
  PRESET_BUTTON_TEXT_WIDTH: 58,
  READOUTS_SPACING: 5,
  EQUATIONS_SPACING: 8,
  /** Energy control decimal places (dimensionless). */
  ENERGY_CONTROL_DECIMAL_PLACES: 2,
  /** Energy control delta (dimensionless). */
  ENERGY_CONTROL_DELTA: 0.01,
  PHOTON_PANEL_SPACING: 8,
  SURROUNDINGS_PANEL_SPACING: 8,
  PAIR_PANEL_SPACING: 8,
  RIGHT_COLUMN_SPACING: 10,
} as const;

/** Settings for preferences/PhotonInteractionsPreferencesNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const PHOTON_INTERACTIONS_PREFERENCES_NODE_SETTINGS = {
  HEADER_FONT_SIZE: 18,
  SHOW_EQUATIONS_CHECKBOX_FONT_SIZE: 14,
  SHOW_EQUATIONS_CHECKBOX_SPACING: 8,
  CONSTRUCTOR_SPACING: 12,
} as const;

/** Settings for xray-tube/view/MoseleyChartNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const MOSELEY_CHART_NODE_SETTINGS = {
  LAW_LINE_DASH_DASH: 5, // px
  CONSTRUCTOR_LAW_LINE_DASH_DASH: 4, // px
  POINTS_TOP_OFFSET: 5, // px
  CONSTRUCTOR_RADIUS: 5.5, // px
  CONSTRUCTOR_MAX_WIDTH_OFFSET: 60, // px

  WIDTH: 220,
  HEIGHT: 120,
  Z_MAX: 80,
  ORDINATE_MAX: 4.5,
  LAW_LINE_WIDTH: 1.5,
  LAW_LABEL_MAX_WIDTH: 100,
  LEFT_LEFT: 6,
  TOP_TOP: 4,
  DOT_RADIUS: 4,
  CHILDREN_SPACING: 6,
} as const;

/** Settings for xray-tube/view/ShellDiagramNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const SHELL_DIAGRAM_NODE_SETTINGS = {
  SHELLS_ITEM_2_RADIUS: 34, // px
  SHELLS_ITEM_3_RADIUS: 52, // px
  RADIUS_TRANSITION_OFFSET_Y: -5, // px
  RADIUS_TRANSITION_OFFSET_Y_SEGMENT_2: 5, // px

  TITLE_MAX_WIDTH_OFFSET: 20, // px
  TRANSITION_LEFT_OFFSET: 8, // px
  TRANSITION_CENTER_Y_OFFSET: 34, // px
  TRANSITION_CENTER_Y: 18, // px
  CAPTION_LINE_WRAP: 130, // px
  CONSTRUCTOR_LEFT_OFFSET: 8, // px
  CONSTRUCTOR_TOP_OFFSET: 4, // px

  SHELL_WIDTH: 290,
  SHELL_HEIGHT: 150,
  CENTER_X: 74,
  CENTER_Y: 92,
  SHELLS_RADIUS: 16,
  FRAME_CORNER_RADIUS: 6,
  TITLE_LEFT: 10,
  TITLE_TOP: 8,
  NUCLEUS_RADIUS: 6,
  DOT_RADIUS: 3,
  CONSTRUCTOR_RADIUS: 3,
  CONSTRUCTOR_LINE_WIDTH: 1.5,
  ARROW_TAIL_WIDTH: 2,
  ARROW_HEAD_WIDTH: 7,
  ARROW_HEAD_HEIGHT: 7,
} as const;

/** Settings for xray-tube/view/XRaySpectrumChartNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const X_RAY_SPECTRUM_CHART_NODE_SETTINGS = {
  LIMIT_LINE_LINE_DASH_DASH: 5, // px
  CONSTRUCTOR_LIMIT_LINE_LINE_DASH_DASH: 4, // px
  CONSTRUCTOR_RIGHT_OFFSET: 3, // px
  CONSTRUCTOR_LEFT_OFFSET: 6, // px
  CONSTRUCTOR_BOTTOM_OFFSET: 6, // px
  CONSTRUCTOR_BOTTOM: 11, // px
  CONSTRUCTOR_MAX_WIDTH_OFFSET: 40, // px

  WIDTH: 360,
  HEIGHT: 210,
  /** Most line labels any anode needs (tungsten: three K, three L). */
  MAX_LINE_LABELS: 6,
  /** Chart range max (in the source module’s documented units). */
  CHART_RANGE_MAX: 1.12,
  CURVE_LINE_WIDTH: 2,
  LIMIT_LINE_LINE_WIDTH: 1.5,
  LIMIT_LABEL_MAX_WIDTH: 110,
  /** Constructor range max (in the source module’s documented units). */
  CONSTRUCTOR_RANGE_MAX: 1.12,
  BOTTOM_BOTTOM: 4,
  CHILDREN_SPACING: 6,
} as const;

/** Settings for xray-tube/view/XRayTubeNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const X_RAY_TUBE_NODE_SETTINGS = {
  PLACE_RIGHT_OFFSET: 4, // px
  STEP_CENTER_Y_FACTOR: 7, // dimensionless

  TUBE_WIDTH: 420,
  TUBE_HEIGHT: 200,
  AXIS_Y: 78,
  CATHODE_X: 78,
  ANODE_X: 318,
  ELECTRONS_PER_MA: 2,
  PHOTON_LENGTH: 92,
  FRAME_CORNER_RADIUS: 6,
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
  TEXT_MAX_WIDTH: 90,
  TOP_TOP: 8,
  CONSTRUCTOR_RADIUS: 3,
  CLIP_AREA_CORNER_X: 6,
  CLIP_AREA_CORNER_Y: 6,
} as const;

/** Settings for xray-tube/view/XRayTubeScreenView.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const X_RAY_TUBE_SCREEN_VIEW_SETTINGS = {
  READOUTS_DIGITS: 4, // digits
  READOUTS_DIGITS_SEGMENT_2: 3, // digits
  K_EDGE_KE_V_FORMAT_ENERGY_DIGITS: 4, // digits

  CONSTRUCTOR_LEFT_OFFSET: 4, // px
  CONSTRUCTOR_TOP_OFFSET: 12, // px
  CONSTRUCTOR_TUBE_PANEL_SPACING: 6, // px
  TUBE_PANEL_MIN_WIDTH_OFFSET: 24, // px
  ANODE_PANEL_MIN_WIDTH_OFFSET: 24, // px
  GRAPH_PANEL_MIN_WIDTH_OFFSET: 24, // px

  PRESET_BUTTON_TEXT_WIDTH: 92,
  READOUTS_SPACING: 5,
  TUBE_PANEL_SPACING: 8,
  ANODE_PANEL_SPACING: 8,
  GRAPH_PANEL_SPACING: 8,
  RIGHT_COLUMN_SPACING: 8,
} as const;

/** Numerical settings; units are specified per value. */
export const COMPTON_NUMERICS = {
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

/** Numerical settings; units are specified per value. */
export const PAIR_NUMERICS = {
  /** Iterations used to solve the recoil energy (count). */
  RECOIL_ITERATIONS: 6,
} as const;

/** Numerical settings; units are specified per value. */
export const XRAY_NUMERICS = {
  /** Gaussian line cutoff in standard deviations. */
  LINE_SIGMA_CUTOFF: 6,
} as const;

/** Component dimensions in px; ratios and control steps are dimensionless; precision counts digits. */
export const X_RAY_TUBE_SCREEN_SUMMARY_CONTENT_SETTINGS = {
  VALUE_FORMAT_WAVELENGTH_DIGITS: 3, // digits
  VALUE_FORMAT_ENERGY_DIGITS: 3, // digits
} as const;

/** Component dimensions in px; ratios and control steps are dimensionless; precision counts digits. */
export const PAIR_PRODUCTION_SCREEN_SUMMARY_CONTENT_SETTINGS = {
  VALUE_FORMAT_ENERGY_DIGITS: 3, // digits
  ELECTRON_KINETIC_FORMAT_ENERGY_DIGITS: 3, // digits
  POSITRON_KINETIC_FORMAT_ENERGY_DIGITS: 3, // digits
  NUCLEUS_MOMENTUM_FORMAT_ENERGY_DIGITS: 3, // digits
  NUCLEUS_KINETIC_FORMAT_ENERGY_DIGITS: 3, // digits
} as const;

/** Component dimensions in px; ratios and control steps are dimensionless; precision counts digits. */
export const COMPTON_SCREEN_SUMMARY_CONTENT_SETTINGS = {
  VALUE_FORMAT_ENERGY_DIGITS: 3, // digits
  VALUE_FORMAT_WAVELENGTH_DIGITS: 4, // digits
  VALUE_FORMAT_WAVELENGTH_DIGITS_SEGMENT_2: 3, // digits
} as const;

/** Component dimensions in px; ratios and control steps are dimensionless; precision counts digits. */
export const ANNIHILATION_SCREEN_SUMMARY_CONTENT_SETTINGS = {
  CURRENT_DETAILS_PROPERTY_DIGITS: 3, // digits
  ENERGY_FORMAT_ENERGY_DIGITS: 3, // digits
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
