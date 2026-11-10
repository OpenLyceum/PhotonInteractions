/**
 * pairProduction.ts
 *
 * A photon turning into an electron–positron pair near a nucleus. Pure functions:
 * no scenery imports. Energies in keV, momenta in keV/c, angles in radians.
 *
 * Energy: E_γ = 2mₑc² + K₋ + K₊ + K_nucleus. Momentum: the photon brings E_γ/c,
 * but a pair of total energy E_γ can carry at most √(E_γ² − (2mₑc²)²)/c, which is
 * always less. The nucleus takes the difference, and because it is so heavy it
 * takes almost no energy with it. With no nucleus the books cannot balance.
 */

import { FourMomentum } from "../../common/model/fourMomentum.js";
import { PHYSICS } from "../../PhotonInteractionsConstants.js";

const ELECTRON = PHYSICS.ELECTRON_REST_ENERGY_KEV;

/** 2mₑc²: the rest energy that has to be created, keV. */
export const PAIR_REST_ENERGY_KEV = 2 * ELECTRON;

/**
 * Exact threshold photon energy beside a nucleus of rest energy M, keV. Slightly
 * above 2mₑc², by the recoil energy the nucleus must take: 2mₑc²(1 + mₑ/M).
 */
export const pairThreshold = (nucleusRestEnergy: number): number =>
  PAIR_REST_ENERGY_KEV * (1 + ELECTRON / nucleusRestEnergy);

/** Largest total momentum (keV/c) an e⁺e⁻ pair of total energy E can carry: both moving together. */
export const maximumPairMomentum = (energy: number): number =>
  energy <= PAIR_REST_ENERGY_KEV ? 0 : Math.sqrt(energy * energy - PAIR_REST_ENERGY_KEV * PAIR_REST_ENERGY_KEV);

/** Momentum (keV/c) an isolated photon would have left over: always positive, so the process is forbidden. */
export const momentumShortfall = (energy: number): number => energy - maximumPairMomentum(energy);

/** Characteristic emission angle of a pair member of total energy E: θ ≈ mₑc²/E radians. */
export const emissionAngle = (totalEnergy: number): number => Math.min(1, ELECTRON / totalEnergy);

export type PairEvent = {
  electron: FourMomentum;
  positron: FourMomentum;
  /** Kinetic energies, keV. */
  electronKinetic: number;
  positronKinetic: number;
  /** Momentum the nucleus absorbs, keV/c, as components and magnitude. */
  nucleusPx: number;
  nucleusPy: number;
  nucleusMomentum: number;
  /** Kinetic energy the nucleus carries off, keV (typically a few eV). */
  nucleusKinetic: number;
};

/**
 * The pair created by a photon of the given energy travelling along +x, with the
 * electron taking `share` of the kinetic energy and each particle leaving at its
 * characteristic angle (electron above the axis, positron below). The nucleus's
 * recoil is found self-consistently so that energy and momentum both balance.
 * Returns null below threshold.
 */
export const pairEvent = (energy: number, share: number, nucleusRestEnergy: number): PairEvent | null => {
  if (energy < pairThreshold(nucleusRestEnergy)) {
    return null;
  }
  let nucleusKinetic = 0;
  let event: PairEvent | null = null;
  // Fixed-point iteration on the nucleus's kinetic energy; it converges in two or three rounds
  // because that energy is a millionth of the rest.
  for (let i = 0; i < 6; i++) {
    const available = Math.max(0, energy - PAIR_REST_ENERGY_KEV - nucleusKinetic);
    const electronKinetic = share * available;
    const positronKinetic = available - electronKinetic;
    const electron = FourMomentum.fromKineticEnergy(
      ELECTRON,
      electronKinetic,
      emissionAngle(ELECTRON + electronKinetic),
    );
    const positron = FourMomentum.fromKineticEnergy(
      ELECTRON,
      positronKinetic,
      -emissionAngle(ELECTRON + positronKinetic),
    );
    const nucleusPx = energy - electron.px - positron.px;
    const nucleusPy = -electron.py - positron.py;
    const nucleusMomentum = Math.hypot(nucleusPx, nucleusPy);
    // √(M² + q²) − M without cancellation.
    nucleusKinetic =
      (nucleusMomentum * nucleusMomentum) / (Math.hypot(nucleusRestEnergy, nucleusMomentum) + nucleusRestEnergy);
    event = {
      electron,
      positron,
      electronKinetic,
      positronKinetic,
      nucleusPx,
      nucleusPy,
      nucleusMomentum,
      nucleusKinetic,
    };
  }
  return event;
};

/** Radius of the circle a singly charged particle of momentum p (keV/c) follows in a field B (T), mm. */
export const trackRadiusMm = (momentumKeV: number, fieldT: number): number =>
  (PHYSICS.CURVATURE_MM_T_PER_MEV * (momentumKeV / 1000)) / fieldT;
