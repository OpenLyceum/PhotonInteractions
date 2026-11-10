/**
 * annihilation.ts
 *
 * A positron annihilating with an electron at rest into two photons. Pure
 * functions: no scenery imports. Energies in keV, angles in radians.
 *
 * In the centre-of-momentum frame the two photons share √s equally and leave
 * back to back. For a positron at rest that frame is the lab, and each photon
 * carries mₑc² = 511 keV. For a positron in flight the pair of photons is boosted
 * forward: unequal energies, and no longer collinear.
 */

import { FourMomentum, momentumOfEnergy } from "../../common/model/fourMomentum.js";
import { PHYSICS } from "../../PhotonInteractionsConstants.js";

const ELECTRON: number = PHYSICS.ELECTRON_REST_ENERGY_KEV;

/** Total four-momentum of a positron of kinetic energy K (keV) moving along +x, and an electron at rest. */
export const initialFourMomentum = (positronKinetic: number): FourMomentum => {
  const energy = Math.max(0, positronKinetic) + 2 * ELECTRON;
  return new FourMomentum(energy, momentumOfEnergy(ELECTRON, ELECTRON + Math.max(0, positronKinetic)), 0);
};

/**
 * The two annihilation photons in the lab, for a positron of kinetic energy K and
 * photon 1 emitted at angle α (from the positron's direction) in the CM frame.
 */
export const annihilationPhotons = (positronKinetic: number, cmAngle: number): [FourMomentum, FourMomentum] => {
  const total = initialFourMomentum(positronKinetic);
  const beta = total.px / total.energy;
  const photonEnergy = total.mass / 2;
  const first = FourMomentum.photon(photonEnergy, cmAngle);
  const second = FourMomentum.photon(photonEnergy, cmAngle + Math.PI);
  // The lab moves at −β relative to the CM frame.
  return [first.boostedX(-beta), second.boostedX(-beta)];
};

/** Angle between the two photons' directions, radians. π means back to back. */
export const openingAngle = (first: FourMomentum, second: FourMomentum): number => {
  const cos = (first.px * second.px + first.py * second.py) / (first.momentumMagnitude * second.momentumMagnitude);
  return Math.acos(Math.max(-1, Math.min(1, cos)));
};

/**
 * Why one photon will not do. A single photon would have to carry the whole
 * energy E, and therefore momentum E/c; the pair only has p. Returns E − pc in
 * keV, which is positive at every positron energy (it is 2mₑc² at rest).
 */
export const singlePhotonMomentumDeficit = (positronKinetic: number): number => {
  const total = initialFourMomentum(positronKinetic);
  return total.energy - total.px;
};
