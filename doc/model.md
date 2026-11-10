# Model — Photon Interactions

The physics behind each screen, the approximations made, and where the numbers come from.
Code structure: [`implementation-notes.md`](implementation-notes.md).

## Units and constants

Energies in keV, momenta in keV/c, wavelengths in pm. CODATA 2022:

| Quantity | Value |
|---|---|
| hc | 1239.841 984 keV·pm (= eV·nm) |
| mₑc² | 510.998 95 keV |
| h/mₑc (Compton wavelength) | 2.426 31 pm |
| h | 4.135 667 696 × 10⁻¹⁸ keV·s |
| Rydberg energy | 13.605 693 eV |

A photon has E = hc/λ and p = E/c. The textbook rounds hc to 1240 eV·nm; the tests accept both.

## Compton

A photon of energy E scatters through θ from a particle of rest energy mc² at rest. Conservation
of energy and momentum give

- λ′ − λ = (h/mc)(1 − cos θ), independent of λ
- E′ = E / [1 + (E/mc²)(1 − cos θ)]
- recoil kinetic energy K = E − E′, and recoil direction cot φ = (1 + E/mc²) tan(θ/2)
- Compton edge (θ = 180°): K_max = E · 2ε/(1 + 2ε), ε = E/mc²

The scattered wavelength is computed as λ + Δλ, not hc/E′, so the shift of visible light (four
parts per million at 90°) is not lost to roundoff.

**How often each angle occurs** is the Klein–Nishina cross-section for unpolarised photons on a
free electron, dσ/dΩ = ½rₑ² P²(P + 1/P − sin²θ) with P = E′/E. At low energy it is Thomson's
½rₑ²(1 + cos²θ). The recoil-energy spectrum used for the detector is the same result written per
unit T: dσ/dT = (πrₑ²/mₑc²ε²)[2 + s²/(ε²(1 − s)²) + (s/(1 − s))(s − 2/ε)], s = T/E. A test checks
that the two forms integrate to the same total. Angles are sampled by rejection: cos θ uniform,
accepted with probability dσ/dΩ ÷ rₑ², whose maximum is exactly 1.

**Spectrometer graph (schematic heights).** Compton's 1923 spectra show two peaks: one at the
incident wavelength, from electrons bound so tightly that the whole atom recoils (the shift is
then 22 000 times smaller for carbon), and one shifted. The positions are exact. The *ratio* is a
one-parameter stand-in for the incoherent scattering function: shifted fraction
x²/(x² + x₀²), x = sin(θ/2)/λ, x₀ = 0.008 pm⁻¹. It gives the right behaviour (visible light all
unshifted, X-rays mixed with the shifted peak growing with angle, gamma rays all shifted) but is
not a calculation for graphite. Peak widths are a fixed 0.2 pm, with the shifted peak 1.5 times
broader, as in Compton's data.

**Detector graph (schematic photopeak).** Each fired photon either is absorbed whole (probability
0.12, a fixed number standing for the photoelectric fraction of a real crystal) and deposits E, or
Compton-scatters once and deposits the electron's K. Both are blurred by a Gaussian resolution of
1.5% of E. Multiple scattering, the backscatter peak and escape peaks are left out. The Compton
edge and photopeak positions are exact: 478 keV and 662 keV for Cs-137.

## X-Ray Tube

Electrons reach the anode with kinetic energy eV.

- **Duane–Hunt limit:** no photon has more energy than eV, so λ_min = hc/eV, whatever the anode.
- **Continuum:** Kramers' law (1923) for a thick target. Radiated energy per unit photon energy is
  I_E ∝ Z(eV − E); per unit wavelength that is I_λ ∝ Z(λ/λ_min − 1)/λ³, which peaks at 1.5 λ_min.
  (The form with 1/λ² that some references quote counts photons, not energy.) Absorption in the
  tube window and in the anode itself is not modelled, so the soft end is higher than a real
  tube's.
- **Characteristic lines:** a line appears only when eV exceeds the binding energy of the shell it
  refills. Its strength grows as (V/V_edge − 1)^1.63 (Green and Cosslett 1961). The overall
  strength of lines relative to the continuum (a factor of 3 in `XRAY.LINE_SCALE`) and the drawn
  width (0.6% of the wavelength) are display choices.
- **Current** scales the whole spectrum and nothing else. The vertical axis is normalised to the
  tallest feature at full current, so it shows shape, not absolute intensity.
- **Moseley plot:** √f of Kα against Z. Moseley's law E = ¾ · 13.6 eV · (Z − 1)² is the dashed
  line; it is within a few percent up to silver and about 8% low for tungsten, whose inner
  electrons are relativistic.

Line energies and absorption edges are from the *X-Ray Data Booklet* (Lawrence Berkeley National
Laboratory, 2009), Tables 1-1 and 1-2:

| Anode | Z | Kα (keV) | Kβ (keV) | K edge (keV) |
|---|---|---|---|---|
| Cr | 24 | 5.412 | 5.947 | 5.989 |
| Cu | 29 | 8.041 | 8.905 | 8.979 |
| Mo | 42 | 17.444 | 19.608 | 20.000 |
| Ag | 47 | 22.105 | 24.942 | 25.514 |
| W | 74 | 59.318 (α₁), 57.982 (α₂) | 67.244 | 69.525 |

Kα is the intensity-weighted mean (2Kα₁ + Kα₂)/3 except for tungsten, whose doublet is resolved.
Tungsten's L lines are Lα 8.398, Lβ 9.672 and Lγ 11.286 keV (edges 10.207 and 11.544 keV).

## Pair Production

γ → e⁻ + e⁺ beside a nucleus of rest energy M.

- **Energy:** E_γ = 2mₑc² + K₋ + K₊ + K_N. The threshold is 2mₑc²(1 + mₑ/M), a few eV above
  1.022 MeV.
- **Momentum:** a pair of total energy E can carry at most √(E² − (2mₑc²)²)/c, when both move
  together. That is always less than the photon's E/c. The difference is the least the nucleus
  must absorb; in empty space nothing can, and the process is forbidden at every energy.
- **The event shown:** the electron takes the chosen share of the kinetic energy; each particle
  leaves at its characteristic angle θ ≈ mₑc²/E (capped at 1 rad), electron above the axis and
  positron below. The nucleus's momentum is then fixed by momentum conservation and its kinetic
  energy by K_N = √(M² + q²) − M; the split is iterated until energy balances too (it converges
  in two or three rounds because K_N is a few eV). Real events have a distribution of angles and
  shares; this is one representative event.
- **Magnetic field:** 1 T, out of the screen. Initial radius r = p/(eB), drawn to scale
  (3.34 mm per MeV/c). The tracks tighten to show energy loss; the rate of tightening is
  schematic.

Nuclear masses: ¹²C = 12 u − 6mₑ, ²⁰⁸Pb = 207.976 652 u − 82mₑ (electron binding neglected).

## Annihilation

e⁺ (kinetic energy K) + e⁻ (at rest) → γ + γ.

The total four-momentum is (K + 2mₑc², √(K(K + 2mₑc²)), 0). In the centre-of-momentum frame each
photon has energy √s/2, s = 2mₑc²(K + 2mₑc²), and the two leave back to back at a freely chosen
angle. Boosting back to the lab gives unequal energies and an opening angle below 180°. At K = 0
the lab is the CM frame: two 511 keV photons, λ = 2.426 pm.

**One photon** would need energy E and therefore momentum E/c, but the pair has only p < E/c.
The deficit E/c − p is 2mₑc at rest and never reaches zero.

**PET ring.** Forty-eight detectors on a ring of radius 40 cm. Each recorded annihilation is at
rest (exactly back to back) in a random direction; the line of response joins the centres of the
two detectors hit. Positron range, non-collinearity, scatter and time of flight are left out.

## References

- A. H. Compton, "A quantum theory of the scattering of X-rays by light elements", *Phys. Rev.*
  **21**, 483 (1923); "The spectrum of scattered X-rays", *Phys. Rev.* **22**, 409 (1923).
- O. Klein and Y. Nishina, *Z. Phys.* **52**, 853 (1929).
- W. Duane and F. L. Hunt, *Phys. Rev.* **6**, 166 (1915).
- H. A. Kramers, *Phil. Mag.* **46**, 836 (1923).
- M. Green and V. E. Cosslett, *Proc. Phys. Soc.* **78**, 1206 (1961).
- H. G. J. Moseley, *Phil. Mag.* **26**, 1024 (1913); **27**, 703 (1914).
- A. C. Thompson et al., *X-Ray Data Booklet*, LBNL/PUB-490 Rev. 3 (2009).
- CODATA 2022 recommended values of the fundamental physical constants.
