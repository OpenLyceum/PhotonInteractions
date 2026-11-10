/**
 * xrayTargets.ts
 *
 * The anode materials of the X-ray tube and their characteristic lines.
 *
 * Line energies and absorption edges are from the *X-Ray Data Booklet* (Lawrence
 * Berkeley National Laboratory, 2009), Tables 1-1 and 1-2. For the lighter targets
 * the Kα doublet is not resolved at the sim's resolution, so one Kα line is given
 * at the intensity-weighted mean (2 Kα₁ + Kα₂)/3. Tungsten's doublet is 1.3 keV
 * apart and is shown as two lines, with its L lines, which dominate a tungsten
 * tube run below the 69.5 kV K edge.
 *
 * `weight` is the line's strength relative to the target's strongest K line.
 * Symbols are notation and are not translated.
 */

export type XRayTargetId = "chromium" | "copper" | "molybdenum" | "silver" | "tungsten";

export type XRayLine = {
  /** Siegbahn label, e.g. "Kα". */
  label: string;
  /** Photon energy, keV. */
  energyKeV: number;
  /** Binding energy of the shell that must be ionised before the line appears, keV. */
  edgeKeV: number;
  /** Strength relative to the strongest K line. */
  weight: number;
};

export type XRayTarget = {
  id: XRayTargetId;
  symbol: string;
  atomicNumber: number;
  /** Energy of the Kα line (weighted mean of the doublet), keV: the Moseley-plot point. */
  kAlphaKeV: number;
  /** K-shell binding energy, keV. */
  kEdgeKeV: number;
  lines: readonly XRayLine[];
  /** Right-hand end of the wavelength axis, pm, and of the energy axis, keV. */
  wavelengthMaxPm: number;
  energyMaxKeV: number;
};

export const XRAY_TARGETS: readonly XRayTarget[] = [
  {
    id: "chromium",
    symbol: "Cr",
    atomicNumber: 24,
    kAlphaKeV: 5.4117,
    kEdgeKeV: 5.989,
    lines: [
      { label: "Kα", energyKeV: 5.4117, edgeKeV: 5.989, weight: 1 },
      { label: "Kβ", energyKeV: 5.9467, edgeKeV: 5.989, weight: 0.15 },
    ],
    wavelengthMaxPm: 300,
    energyMaxKeV: 20,
  },
  {
    id: "copper",
    symbol: "Cu",
    atomicNumber: 29,
    kAlphaKeV: 8.0411,
    kEdgeKeV: 8.979,
    lines: [
      { label: "Kα", energyKeV: 8.0411, edgeKeV: 8.979, weight: 1 },
      { label: "Kβ", energyKeV: 8.9053, edgeKeV: 8.979, weight: 0.17 },
    ],
    wavelengthMaxPm: 200,
    energyMaxKeV: 30,
  },
  {
    id: "molybdenum",
    symbol: "Mo",
    atomicNumber: 42,
    kAlphaKeV: 17.4443,
    kEdgeKeV: 20.0,
    lines: [
      { label: "Kα", energyKeV: 17.4443, edgeKeV: 20.0, weight: 1 },
      { label: "Kβ", energyKeV: 19.6083, edgeKeV: 20.0, weight: 0.19 },
    ],
    wavelengthMaxPm: 120,
    energyMaxKeV: 50,
  },
  {
    id: "silver",
    symbol: "Ag",
    atomicNumber: 47,
    kAlphaKeV: 22.1054,
    kEdgeKeV: 25.514,
    lines: [
      { label: "Kα", energyKeV: 22.1054, edgeKeV: 25.514, weight: 1 },
      { label: "Kβ", energyKeV: 24.9424, edgeKeV: 25.514, weight: 0.2 },
    ],
    wavelengthMaxPm: 100,
    energyMaxKeV: 60,
  },
  {
    id: "tungsten",
    symbol: "W",
    atomicNumber: 74,
    kAlphaKeV: 58.8727,
    kEdgeKeV: 69.525,
    lines: [
      { label: "Kα₁", energyKeV: 59.3182, edgeKeV: 69.525, weight: 1 },
      { label: "Kα₂", energyKeV: 57.9817, edgeKeV: 69.525, weight: 0.58 },
      { label: "Kβ", energyKeV: 67.2443, edgeKeV: 69.525, weight: 0.33 },
      { label: "Lα", energyKeV: 8.3976, edgeKeV: 10.207, weight: 0.25 },
      { label: "Lβ", energyKeV: 9.6724, edgeKeV: 11.544, weight: 0.15 },
      { label: "Lγ", energyKeV: 11.2859, edgeKeV: 11.544, weight: 0.03 },
    ],
    wavelengthMaxPm: 180,
    energyMaxKeV: 160,
  },
];

export const XRayTargetIdValues = XRAY_TARGETS.map((t) => t.id);

export const xrayTargetById = (id: XRayTargetId): XRayTarget => {
  const target = XRAY_TARGETS.find((t) => t.id === id);
  if (!target) {
    throw new Error(`Unknown X-ray target: ${id}`);
  }
  return target;
};
