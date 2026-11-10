/**
 * fourMomentum.ts
 *
 * A planar four-momentum (E, px, py) in keV and keV/c, and the photon's
 * energy–wavelength conversions. Pure functions: no scenery imports.
 *
 * A photon is the massless case, E = pc, so its four-momentum has zero invariant
 * mass. That one fact is what forbids both an isolated photon turning into a pair
 * and a pair annihilating into a single photon.
 */

import { PHYSICS } from "../../PhotonInteractionsConstants.js";

/** Photon wavelength in pm for an energy in keV: λ = hc/E. */
export const wavelengthOfEnergy = (energyKeV: number): number => PHYSICS.HC_KEV_PM / energyKeV;

/** Photon energy in keV for a wavelength in pm: E = hc/λ. */
export const energyOfWavelength = (wavelengthPm: number): number => PHYSICS.HC_KEV_PM / wavelengthPm;

/** Photon frequency in Hz for an energy in keV: f = E/h. */
export const frequencyOfEnergy = (energyKeV: number): number => energyKeV / PHYSICS.PLANCK_KEV_S;

/** Momentum (keV/c) of a particle of rest energy m (keV) and total energy E (keV). */
export const momentumOfEnergy = (restEnergy: number, energy: number): number =>
  Math.sqrt(Math.max(0, (energy - restEnergy) * (energy + restEnergy)));

/** Speed β = pc/E of a particle of rest energy m and kinetic energy K. */
export const betaOfKineticEnergy = (restEnergy: number, kineticEnergy: number): number => {
  const energy = restEnergy + Math.max(0, kineticEnergy);
  return energy === 0 ? 0 : momentumOfEnergy(restEnergy, energy) / energy;
};

export class FourMomentum {
  public static readonly ZERO = new FourMomentum(0, 0, 0);

  /** Total energy E, keV. */
  public readonly energy: number;
  /** Momentum components, keV/c. */
  public readonly px: number;
  public readonly py: number;

  public constructor(energy: number, px: number, py: number) {
    this.energy = energy;
    this.px = px;
    this.py = py;
  }

  /** A photon of energy E travelling at angle θ (radians) from +x. */
  public static photon(energy: number, angle = 0): FourMomentum {
    return new FourMomentum(energy, energy * Math.cos(angle), energy * Math.sin(angle));
  }

  /** A particle of rest energy m with kinetic energy K travelling at angle θ (radians) from +x. */
  public static fromKineticEnergy(restEnergy: number, kineticEnergy: number, angle = 0): FourMomentum {
    const energy = restEnergy + Math.max(0, kineticEnergy);
    const p = momentumOfEnergy(restEnergy, energy);
    return new FourMomentum(energy, p * Math.cos(angle), p * Math.sin(angle));
  }

  /** |p|, keV/c. */
  public get momentumMagnitude(): number {
    return Math.hypot(this.px, this.py);
  }

  /** The invariant mass √(E² − p²), keV, with roundoff below zero clamped away. */
  public get mass(): number {
    const p = this.momentumMagnitude;
    return Math.sqrt(Math.max(0, (this.energy - p) * (this.energy + p)));
  }

  /** Direction of the momentum, radians from +x. */
  public get angle(): number {
    return Math.atan2(this.py, this.px);
  }

  public plus(other: FourMomentum): FourMomentum {
    return new FourMomentum(this.energy + other.energy, this.px + other.px, this.py + other.py);
  }

  public minus(other: FourMomentum): FourMomentum {
    return new FourMomentum(this.energy - other.energy, this.px - other.px, this.py - other.py);
  }

  /**
   * This four-momentum as measured in a frame moving with velocity β along +x:
   * E′ = γ(E − βpx), px′ = γ(px − βE), py′ = py.
   */
  public boostedX(beta: number): FourMomentum {
    const gamma = 1 / Math.sqrt(1 - beta * beta);
    return new FourMomentum(gamma * (this.energy - beta * this.px), gamma * (this.px - beta * this.energy), this.py);
  }
}
