/**
 * xraySpectrum.ts
 *
 * The spectrum of an X-ray tube: a bremsstrahlung continuum with a sharp
 * short-wavelength limit, and characteristic lines on top. Pure functions: no
 * scenery imports. Voltages in kV, energies in keV, wavelengths in pm.
 *
 * Continuum: Kramers' law (1923) for a thick target,
 *
 *     I(E) ∝ Z (eV − E)      or, per unit wavelength,      I(λ) ∝ Z (λ/λ_min − 1) / λ³
 *
 * for λ > λ_min = hc/eV (Duane–Hunt), and nothing at all below λ_min, because no
 * electron has more than eV to give. I is radiated energy per unit interval; the
 * often-quoted 1/λ² form counts photons instead. The wavelength form peaks at
 * 1.5 λ_min.
 *
 * Lines: a line appears only once eV exceeds the binding energy of the shell it
 * refills, and then grows as (V/V_edge − 1)^1.63 (Green & Cosslett 1961). Its
 * wavelength never moves. Absorption in the tube window and the anode is left
 * out, so the soft end of the continuum is higher than a real tube's.
 */

import { frequencyOfEnergy, wavelengthOfEnergy } from "../../common/model/fourMomentum.js";
import { PHYSICS, XRAY } from "../../PhotonInteractionsConstants.js";
import type { XRayLine, XRayTarget } from "./xrayTargets.js";

/** Duane–Hunt limit λ_min = hc/eV, pm, for a tube voltage in kV. */
export const duaneHuntWavelength = (voltageKV: number): number => wavelengthOfEnergy(voltageKV);

/** Kramers continuum: radiated energy per unit wavelength (arbitrary units). */
export const kramersContinuum = (wavelengthPm: number, voltageKV: number, atomicNumber: number): number => {
  const minimum = duaneHuntWavelength(voltageKV);
  return wavelengthPm > minimum ? (atomicNumber * (wavelengthPm / minimum - 1)) / wavelengthPm ** 3 : 0;
};

/** Whether the tube voltage is high enough to excite a line. */
export const isLineExcited = (line: XRayLine, voltageKV: number): boolean => voltageKV > line.edgeKeV;

/** Peak height of a characteristic line, in the units of {@link kramersContinuum}. Zero below its edge. */
export const lineStrength = (line: XRayLine, voltageKV: number, atomicNumber: number): number => {
  if (!isLineExcited(line, voltageKV)) {
    return 0;
  }
  const wavelength = wavelengthOfEnergy(line.energyKeV);
  return (
    (XRAY.LINE_SCALE * atomicNumber * line.weight * (voltageKV / line.edgeKeV - 1) ** XRAY.LINE_OVERVOLTAGE_EXPONENT) /
    wavelength ** 3
  );
};

/** The whole spectrum per unit wavelength: continuum plus lines of finite width. */
export const spectrumPerWavelength = (wavelengthPm: number, voltageKV: number, target: XRayTarget): number => {
  let intensity = kramersContinuum(wavelengthPm, voltageKV, target.atomicNumber);
  for (const line of target.lines) {
    const strength = lineStrength(line, voltageKV, target.atomicNumber);
    if (strength > 0) {
      const centre = wavelengthOfEnergy(line.energyKeV);
      const sigma = XRAY.LINE_RELATIVE_SIGMA * centre;
      const offset = (wavelengthPm - centre) / sigma;
      if (Math.abs(offset) < 6) {
        intensity += strength * Math.exp(-0.5 * offset * offset);
      }
    }
  }
  return intensity;
};

/**
 * The same spectrum per unit photon energy. Equal areas must hold equal power,
 * I_E dE = I_λ dλ, so I_E = I_λ · λ²/hc: the continuum becomes Kramers' straight
 * line Z(E_max − E).
 */
export const spectrumPerEnergy = (energyKeV: number, voltageKV: number, target: XRayTarget): number => {
  if (energyKeV <= 0) {
    return 0;
  }
  const wavelength = wavelengthOfEnergy(energyKeV);
  return (spectrumPerWavelength(wavelength, voltageKV, target) * wavelength * wavelength) / PHYSICS.HC_KEV_PM;
};

/** √f of a photon of the given energy, in units of 10⁹ Hz^½: the ordinate of a Moseley plot. */
export const moseleyOrdinate = (energyKeV: number): number => Math.sqrt(frequencyOfEnergy(energyKeV)) / 1e9;

/**
 * Moseley's law for the Kα line: an electron falls from n = 2 to n = 1 past a
 * nuclear charge screened by the one remaining K electron,
 * E = ¾ · 13.6 eV · (Z − 1)².
 */
export const moseleyKAlphaEnergy = (atomicNumber: number): number =>
  0.75 * PHYSICS.RYDBERG_KEV * (atomicNumber - 1) * (atomicNumber - 1);
