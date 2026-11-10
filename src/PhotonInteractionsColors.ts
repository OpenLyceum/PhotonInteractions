/**
 * PhotonInteractionsColors.ts
 *
 * Every colour in the simulation, as ProfileColorProperty with a "default"
 * (dark) and a "projector" (light) value. SceneryStack switches profiles
 * automatically.
 *
 * ── The sim's colour language ─────────────────────────────────────────────────
 * One idea, one hue, on every screen it appears:
 *
 *   yellow   the incident photon, and photons in general
 *   orange   the scattered (lower-energy) photon
 *   cyan     the electron: its recoil, its track, its kinetic energy
 *   pink     the positron
 *   violet   the nucleus and whatever it absorbs
 *   green    rest energy mc² (and "allowed")
 *   red      "forbidden", thresholds and limits
 */
import { ProfileColorProperty } from "scenerystack/scenery";
import PhotonInteractionsNamespace from "./PhotonInteractionsNamespace.js";

const PhotonInteractionsColors = {
  /**
   * Background color for the simulation screen.
   * Deep navy in default mode; white in projector mode.
   */
  backgroundColorProperty: new ProfileColorProperty(PhotonInteractionsNamespace, "background", {
    default: "#1a1a2e",
    projector: "#ffffff",
  }),

  /**
   * Primary accent color for highlights, selected items, and key UI elements.
   * Sky blue in default mode; dark navy in projector mode.
   */
  accentColorProperty: new ProfileColorProperty(PhotonInteractionsNamespace, "accent", {
    default: "#4fc3f7",
    projector: "#1a1a2e",
  }),

  /**
   * Background fill for control panels and dialogs.
   * Deep blue in default mode; light gray in projector mode.
   */
  panelBackgroundColorProperty: new ProfileColorProperty(PhotonInteractionsNamespace, "panelBackground", {
    default: "#16213e",
    projector: "#f5f5f5",
  }),

  /**
   * Border/stroke color for control panels and dialogs.
   * Teal-navy in default mode; medium gray in projector mode.
   */
  panelBorderColorProperty: new ProfileColorProperty(PhotonInteractionsNamespace, "panelBorder", {
    default: "#0f3460",
    projector: "#999999",
  }),

  /**
   * Text color for labels, readouts, and general UI text.
   * Near-white in default mode; near-black in projector mode.
   */
  textColorProperty: new ProfileColorProperty(PhotonInteractionsNamespace, "text", {
    default: "#e0e0e0",
    projector: "#1a1a1a",
  }),

  /** Quieter text: readout labels, sub-headers, captions. */
  secondaryTextColorProperty: new ProfileColorProperty(PhotonInteractionsNamespace, "secondaryText", {
    default: "#9aa5c4",
    projector: "#5a5a5a",
  }),

  // ── Charts and diagrams ───────────────────────────────────────────────────────

  /** Fill inside a chart's plotting rectangle. */
  chartBackgroundColorProperty: new ProfileColorProperty(PhotonInteractionsNamespace, "chartBackground", {
    default: "#10182c",
    projector: "#fafafa",
  }),

  /** Axes, chart border, tick marks. */
  chartAxisColorProperty: new ProfileColorProperty(PhotonInteractionsNamespace, "chartAxis", {
    default: "#c5cbe0",
    projector: "#37474f",
  }),

  /** Gridlines: present, never competing with the physics. */
  chartGridColorProperty: new ProfileColorProperty(PhotonInteractionsNamespace, "chartGrid", {
    default: "#2c3a5c",
    projector: "#dcdcdc",
  }),

  /** Histogram bars and other filled data. */
  histogramColorProperty: new ProfileColorProperty(PhotonInteractionsNamespace, "histogram", {
    default: "#3f6fb5",
    projector: "#90caf9",
  }),

  // ── Particles ─────────────────────────────────────────────────────────────────

  /** The incident photon, and photons in general. */
  photonColorProperty: new ProfileColorProperty(PhotonInteractionsNamespace, "photon", {
    default: "#ffee58",
    projector: "#c79100",
  }),

  /** The scattered photon, or the second photon of a pair. */
  scatteredPhotonColorProperty: new ProfileColorProperty(PhotonInteractionsNamespace, "scatteredPhoton", {
    default: "#ffa726",
    projector: "#d84315",
  }),

  electronColorProperty: new ProfileColorProperty(PhotonInteractionsNamespace, "electron", {
    default: "#4dd0e1",
    projector: "#00838f",
  }),

  positronColorProperty: new ProfileColorProperty(PhotonInteractionsNamespace, "positron", {
    default: "#f48fb1",
    projector: "#c2185b",
  }),

  nucleusColorProperty: new ProfileColorProperty(PhotonInteractionsNamespace, "nucleus", {
    default: "#b39ddb",
    projector: "#5e35b1",
  }),

  /** Rest energy mc², and "this is allowed". */
  restEnergyColorProperty: new ProfileColorProperty(PhotonInteractionsNamespace, "restEnergy", {
    default: "#81c784",
    projector: "#2e7d32",
  }),

  /** "Forbidden", thresholds, the Duane–Hunt limit, the Compton edge. */
  limitColorProperty: new ProfileColorProperty(PhotonInteractionsNamespace, "limit", {
    default: "#ef5350",
    projector: "#c62828",
  }),

  /** Apparatus outlines: tube glass, detectors, electrodes. */
  apparatusColorProperty: new ProfileColorProperty(PhotonInteractionsNamespace, "apparatus", {
    default: "#78859f",
    projector: "#607d8b",
  }),

  /** Apparatus fill: anode metal, detector crystals. */
  apparatusFillColorProperty: new ProfileColorProperty(PhotonInteractionsNamespace, "apparatusFill", {
    default: "#2a3757",
    projector: "#cfd8dc",
  }),

  // ── Light control surfaces ───────────────────────────────────────────────────
  // White chrome (combo boxes, flat push buttons, editable input fields) stays light
  // in both profiles; its text stays dark. Same values in default and projector mode,
  // but defined here so every color lives in one themeable place.

  /** Fill of light control surfaces: combo-box button/list, editable input fields. */
  controlSurfaceColorProperty: new ProfileColorProperty(PhotonInteractionsNamespace, "controlSurface", {
    default: "#ffffff",
    projector: "#ffffff",
  }),

  /** Fill of a disabled control surface (grayed-out editable input field). */
  controlSurfaceDisabledColorProperty: new ProfileColorProperty(PhotonInteractionsNamespace, "controlSurfaceDisabled", {
    default: "#cccccc",
    projector: "#cccccc",
  }),

  /** Text on light control surfaces: combo items, flat-button labels, field values, preferences. */
  controlSurfaceTextColorProperty: new ProfileColorProperty(PhotonInteractionsNamespace, "controlSurfaceText", {
    default: "#1a1a1a",
    projector: "#1a1a1a",
  }),
};

export default PhotonInteractionsColors;
