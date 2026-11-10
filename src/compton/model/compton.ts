/**
 * compton.ts
 *
 * Compton scattering of a photon from a particle at rest. Pure functions: no
 * scenery imports. Energies in keV, wavelengths in pm, angles in radians.
 *
 * Conservation of energy and momentum in the two-body collision gives
 *
 *     λ′ − λ = (h/mc)(1 − cos θ),      E′ = E / [1 + (E/mc²)(1 − cos θ)],
 *
 * and the recoil direction cot φ = (1 + E/mc²) tan(θ/2). How *often* each angle
 * occurs is not fixed by conservation laws; it is the Klein–Nishina cross-section.
 */

import { COMPTON, PHYSICS } from "../../PhotonInteractionsConstants.js";

const ELECTRON: number = PHYSICS.ELECTRON_REST_ENERGY_KEV;

/** Wavelength shift λ′ − λ in pm. Independent of the incident wavelength. */
export const comptonShift = (theta: number, targetRestEnergy = ELECTRON): number =>
  (PHYSICS.HC_KEV_PM / targetRestEnergy) * (1 - Math.cos(theta));

/** Scattered photon energy E′, keV. */
export const scatteredEnergy = (energy: number, theta: number, targetRestEnergy = ELECTRON): number =>
  energy / (1 + (energy / targetRestEnergy) * (1 - Math.cos(theta)));

/** Kinetic energy handed to the recoiling particle, keV. */
export const recoilKineticEnergy = (energy: number, theta: number, targetRestEnergy = ELECTRON): number =>
  energy - scatteredEnergy(energy, theta, targetRestEnergy);

/**
 * Recoil angle φ of the struck particle, radians, measured from the incident
 * direction on the opposite side from the scattered photon. Runs from 90° (a
 * grazing photon, θ → 0) to 0° (a back-scattered photon, θ = 180°).
 */
export const recoilAngle = (energy: number, theta: number, targetRestEnergy = ELECTRON): number =>
  Math.atan2(1, (1 + energy / targetRestEnergy) * Math.tan(theta / 2));

/** Momentum of the recoiling particle, keV/c, from the momentum triangle. */
export const recoilMomentum = (energy: number, theta: number, targetRestEnergy = ELECTRON): number => {
  const scattered = scatteredEnergy(energy, theta, targetRestEnergy);
  return Math.sqrt(Math.max(0, energy * energy + scattered * scattered - 2 * energy * scattered * Math.cos(theta)));
};

/** The Compton edge: the most energy one scattering can deposit (θ = 180°), keV. */
export const comptonEdge = (energy: number): number => recoilKineticEnergy(energy, Math.PI);

/**
 * Klein–Nishina differential cross-section dσ/dΩ in units of rₑ² (the classical
 * electron radius squared), for unpolarised photons on a free electron:
 *
 *     dσ/dΩ = ½ P² (P + 1/P − sin²θ),      P = E′/E.
 *
 * At low energy P → 1 and this is Thomson's ½(1 + cos²θ).
 */
export const kleinNishina = (energy: number, theta: number): number => {
  const ratio = scatteredEnergy(energy, theta) / energy;
  const sin = Math.sin(theta);
  return 0.5 * ratio * ratio * (ratio + 1 / ratio - sin * sin);
};

/**
 * Klein–Nishina spectrum of the recoil electron's kinetic energy T, dσ/dT, in
 * units of πrₑ²/mₑc². Zero above the Compton edge. This is the shape of the
 * continuum a gamma-ray detector records.
 */
export const kleinNishinaRecoilSpectrum = (energy: number, kinetic: number): number => {
  if (kinetic < 0 || kinetic > comptonEdge(energy)) {
    return 0;
  }
  const epsilon = energy / ELECTRON;
  const s = kinetic / energy;
  return (
    (1 / (epsilon * epsilon)) *
    (2 + (s * s) / (epsilon * epsilon * (1 - s) * (1 - s)) + (s / (1 - s)) * (s - 2 / epsilon))
  );
};

/**
 * Draws a scattering angle from the Klein–Nishina distribution by rejection:
 * cos θ uniform on [−1, 1] (uniform in solid angle), accepted with probability
 * dσ/dΩ, whose maximum (at θ = 0) is exactly 1 in units of rₑ².
 *
 * @param random - a source of uniform numbers on [0, 1), passed in so tests can seed it
 */
export const sampleScatteringAngle = (energy: number, random: () => number): number => {
  for (let attempt = 0; attempt < 1000; attempt++) {
    const theta = Math.acos(2 * random() - 1);
    if (random() < kleinNishina(energy, theta)) {
      return theta;
    }
  }
  return 0;
};

/**
 * Fraction of the X-rays scattered by graphite at angle θ that are Compton
 * shifted. The rest scatter from electrons bound so tightly that the whole atom
 * recoils, with a shift some 22 000 times smaller: Compton's "unmodified line".
 *
 * A one-parameter stand-in for the incoherent scattering function: the shifted
 * fraction rises as x²/(x² + x₀²), x = sin(θ/2)/λ, the momentum transfer. Visible
 * light (x ≈ 0) is all unshifted; gamma rays are all shifted.
 */
export const shiftedFraction = (wavelengthPm: number, theta: number): number => {
  const x = Math.sin(theta / 2) / wavelengthPm;
  const x0 = COMPTON.BOUND_CROSSOVER_PER_PM;
  return (x * x) / (x * x + x0 * x0);
};

const gaussian = (x: number, sigma: number): number => Math.exp((-x * x) / (2 * sigma * sigma));

/**
 * What a crystal spectrometer at angle θ records, as a function of the wavelength
 * shift from the incident line (pm): an unshifted peak and a Compton-shifted one.
 * The shifted peak is drawn broader, as it is in Compton's data (the target
 * electrons are moving). Peak heights are relative; the taller peak is at most 1.
 */
export const spectrometerIntensity = (
  shiftPm: number,
  wavelengthPm: number,
  theta: number,
  includeBound: boolean,
): number => {
  const sigma = COMPTON.SPECTROMETER_SIGMA_PM;
  const fraction = includeBound ? shiftedFraction(wavelengthPm, theta) : 1;
  return (1 - fraction) * gaussian(shiftPm, sigma) + fraction * gaussian(shiftPm - comptonShift(theta), 1.5 * sigma);
};

/**
 * What a gamma-ray detector is expected to record: the fraction of events in each
 * of `bins` equal energy bins spanning 0 … rangeFactor × E.
 *
 * A fraction `photopeakFraction` of the photons are absorbed whole and deposit E;
 * the rest scatter once and deposit the electron's recoil energy, distributed as
 * Klein–Nishina's dσ/dT. Both are blurred by a Gaussian detector resolution of
 * standard deviation `resolution` × E. The fractions sum to 1.
 */
export const detectorSpectrumFractions = (
  energy: number,
  bins: number,
  rangeFactor: number,
  photopeakFraction: number,
  resolution: number,
): number[] => {
  const perBin = 20;
  const n = bins * perBin;
  const step = (rangeFactor * energy) / n;
  const ideal = new Array<number>(n).fill(0);

  // Continuum, normalised to (1 − photopeakFraction).
  let continuumSum = 0;
  for (let i = 0; i < n; i++) {
    ideal[i] = kleinNishinaRecoilSpectrum(energy, (i + 0.5) * step);
    continuumSum += ideal[i] ?? 0;
  }
  for (let i = 0; i < n; i++) {
    ideal[i] = continuumSum > 0 ? ((ideal[i] ?? 0) * (1 - photopeakFraction)) / continuumSum : 0;
  }
  // Photopeak: everything at E.
  const peakIndex = Math.min(n - 1, Math.floor(energy / step));
  ideal[peakIndex] = (ideal[peakIndex] ?? 0) + photopeakFraction;

  // Blur with the detector resolution.
  const sigma = Math.max(1e-9, (resolution * energy) / step);
  const reach = Math.ceil(4 * sigma);
  const kernel: number[] = [];
  let kernelSum = 0;
  for (let k = -reach; k <= reach; k++) {
    const weight = Math.exp((-k * k) / (2 * sigma * sigma));
    kernel.push(weight);
    kernelSum += weight;
  }
  const fractions = new Array<number>(bins).fill(0);
  for (let i = 0; i < n; i++) {
    const value = ideal[i] ?? 0;
    if (value === 0) {
      continue;
    }
    for (let k = -reach; k <= reach; k++) {
      // Events blurred off either end are counted in the end bins, as the sampler does.
      const j = Math.max(0, Math.min(n - 1, i + k));
      const bin = Math.floor(j / perBin);
      fractions[bin] = (fractions[bin] ?? 0) + (value * (kernel[k + reach] ?? 0)) / kernelSum;
    }
  }
  return fractions;
};
