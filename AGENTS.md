# AGENTS.md — Photon Interactions

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenLyceum/.github/AGENTS.md](https://github.com/OpenLyceum/.github/blob/main/AGENTS.md).

## Project

Photons as particles, written to accompany the second half of Chapter 6 (*Particle Properties of
Waves*) of the QuadriviumPress [Modern Physics](https://github.com/QuadriviumPress/modernPhysics)
textbook: X-ray production, Compton scattering, pair production and annihilation. Original work,
not a port. Forked from `SceneryStackTemplate` on 9 Nov 2026. Four screens:

| Screen | Folder | Content |
|---|---|---|
| Compton | `src/compton/` | Photon on an electron at rest; draggable detector sets θ; momentum triangle; graphs of shift against angle, Compton's spectrometer (shifted and unshifted peaks), and a detector spectrum (Klein–Nishina continuum, Compton edge, photopeak) filled by firing photons |
| X-Ray Tube | `src/xray-tube/` | Voltage, current and five anodes; Kramers continuum with the Duane–Hunt cutoff; characteristic K (and tungsten L) lines that switch on at their edges; wavelength or energy axis; inner-shell diagram; Moseley plot |
| Pair Production | `src/pair-production/` | Photon up to 10 MeV near lead, carbon or nothing; replayed event with optional magnetic field; energy and momentum budget bars; nucleus recoil solved exactly |
| Annihilation | `src/annihilation/` | Positron (at rest or in flight) on an electron at rest; two photons from a CM-frame boost; single-photon momentum check; PET ring with lines of response and a draggable, hideable tracer |

Physics, data and references: [`doc/model.md`](doc/model.md). Architecture and decisions:
[`doc/implementation-notes.md`](doc/implementation-notes.md).

### Things to know first

- **Units are keV and picometres.** Energies and rest energies in keV, momenta in keV/c,
  wavelengths in pm, so hc = 1239.84 keV·pm (the textbook's 1240 eV·nm). The Pair Production and
  Annihilation *controls* are in MeV; their models convert once. Readouts pick eV/keV/MeV and
  fm/pm/nm themselves (`formatEnergy`, `formatWavelength` in `chartUtils.ts`).
- **Numbers are pinned to the textbook.** `tests/compton.test.ts`, `tests/xraySpectrum.test.ts`,
  `tests/pairProduction.test.ts` and `tests/annihilation.test.ts` check the chapter's worked
  examples and problems (0.100 nm at 60°, 80 kV → 15.5 pm, Cs-137 edge 0.478 MeV, 3.00 MeV →
  1.978 MeV, two 511 keV photons). If a change breaks one, the change is wrong.
- **λ′ is λ + Δλ, never hc/E′.** For visible light the shift is parts per million of λ and would
  be lost to roundoff.
- **Kramers' law is used in its energy-flux form:** I(λ) ∝ Z(λ/λ_min − 1)/λ³, which is the
  straight line Z(eV − E) per unit energy. The 1/λ² form found in some references counts photons.
- **Three things are schematic and say so in `doc/model.md`:** the shifted/unshifted ratio in the
  spectrometer, the photopeak fraction of the detector, and the strength of characteristic lines
  relative to the continuum. Positions (wavelengths, edges, thresholds) are exact.
- **Random numbers come from `dotRandom`** (the photon sampler and the PET directions), never
  `Math.random`, so fuzzing and playback stay reproducible. The pure samplers take the random
  source as an argument; tests pass a seeded one.
- **Node >=26** is required (`engines` / `devEngines`). If `node -v` is older, run
  `source ~/.nvm/nvm.sh && nvm use 26` before npm or git commit (the pre-commit hook runs npm).

## Key files

| File | Purpose |
|---|---|
| `src/common/model/fourMomentum.ts` | `FourMomentum` (E, px, py; boost along x; invariant mass) and E ↔ λ ↔ f conversions |
| `src/compton/model/compton.ts` | Shift, E′(θ), recoil, Compton edge, Klein–Nishina dσ/dΩ and dσ/dT, angle sampler, spectrometer and detector spectra |
| `src/xray-tube/model/xraySpectrum.ts` | Duane–Hunt limit, Kramers continuum, line strengths, the spectrum per wavelength and per energy, Moseley's law |
| `src/xray-tube/model/xrayTargets.ts` | Anode table: Z, line energies, absorption edges (X-Ray Data Booklet), axis ranges |
| `src/pair-production/model/pairProduction.ts` | Threshold, the self-consistent pair-plus-nucleus event, maximum pair momentum, track radius |
| `src/annihilation/model/annihilation.ts` | Two-photon final state by boosting from the CM frame; single-photon deficit |
| `src/annihilation/model/petRing.ts` | Detector geometry and lines of response |
| `src/common/view/PhotonArrowNode.ts` | The wavy photon arrow, with a settable wiggle wavelength |
| `src/common/view/ChartFrameNode.ts` | bamboo chart frame with re-rangeable grid/ticks (parks spacing while re-ranging) |
| `src/common/view/controlHelpers.ts` | Themed controls shared by every screen (from RelativisticDynamics) |
| `src/PhotonInteractionsColors.ts` | Colours **and the colour language** (yellow photon, orange scattered photon, cyan electron, pink positron, violet nucleus, red limits): read its header before adding a colour |
| `src/PhotonInteractionsConstants.ts` | Grouped `as const` blocks: `PHYSICS`, `COMPTON`, `XRAY`, `PAIR`, `ANNIHILATION`, `FONTS` |
| `src/preferences/` | One preference, Show equations (`?showEquations=false`), passed to each Screen |

## Accessibility

Standard fleet pattern. Per-screen a11y strings live under `a11y.<screenKey>` in each locale JSON,
reached via `StringManager.get<Screen>A11yStrings()`; visible strings via
`get<Screen>Strings()` and `getCommonStrings()`. Every screen has a live `*ScreenSummaryContent`, a
wrapper `Node` carrying `pdomOrder` (Reset All last), and a `*KeyboardHelpContent`. The Compton
detector is pointer-draggable only; the angle slider is its keyboard equivalent. The PET tracer is
keyboard-draggable (`RichDragListener`) and announces its position on drag end. Do not rewrite a
focused node's PDOM content during a drag: it drops focus.
Full convention: [Baton/ACCESSIBILITY.md](https://github.com/OpenLyceum/Baton/blob/main/ACCESSIBILITY.md).

## Compliance carve-outs

- **Grouped constants.** `PhotonInteractionsConstants.ts` uses topical `as const` objects rather
  than a flat list of exports, as RelativisticDynamics and SpecialRelativity do.

## Commands

```bash
npm run lint && npm run check && npm run build && npm test
```

Dev server for screenshots: `npx vite --port <free port>`; screen models are reachable from the
console as `phet.joist.sim.screens[i].model` (with `?screens=n`, index 0).
