# Implementation notes — Photon Interactions

How the code is put together and why. Physics and data: [`model.md`](model.md).

## Layout

```
src/
  common/
    model/fourMomentum.ts      FourMomentum (E, px, py), boost along x, E ↔ λ ↔ f
    view/PhotonArrowNode.ts    wavy photon arrow with a settable wiggle wavelength
    view/EquationNode.ts       a screen's equation, hidden by the Show equations preference
    view/ChartFrameNode.ts     bamboo chart frame shared by every chart
    view/chartUtils.ts         nice tick steps; energy, wavelength and angle formatting
    view/controlHelpers.ts     themed NumberControl, radio group, checkbox, push button, readout row
    PhotonInteractionsScreenIcons.ts
  compton/          model/compton.ts (pure), ComptonModel; Collision, MomentumTriangle, Charts, ScreenView
  xray-tube/        model/xraySpectrum.ts + xrayTargets.ts (pure), XRayTubeModel; Tube, ShellDiagram,
                    SpectrumChart, MoseleyChart, ScreenView
  pair-production/  model/pairProduction.ts (pure), PairProductionModel; Event, Budget, ScreenView
  annihilation/     model/annihilation.ts + petRing.ts (pure), AnnihilationModel; Event, PetRing, ScreenView
  preferences/      showEquations preference (?showEquations=false)
```

## Principles

- **Pure physics, thin models.** Every formula lives in a pure module that the tests exercise
  directly. Screen models hold only the user's inputs as Properties and derive everything else
  with DerivedProperty.
- **One unit system.** keV and pm throughout the physics. The two screens whose controls are in
  MeV convert once, in the model (`energyProperty = 1000 × energyMeVProperty`).
- **Accumulated data is a plain array plus an Emitter.** The detector histogram and the PET lines
  are mutated in place and announced with `histogramChangedEmitter` / `linesChangedEmitter`,
  rather than replaced through a Property 240 times a second. Changing what they depend on (the
  photon energy, the tracer position) clears them.
- **Randomness is injected.** `sampleScatteringAngle(energy, random)` takes its random source, so
  the test seeds it; the models pass `dotRandom`.
- **Views live as long as their screen.** Nothing is created at runtime, so screen nodes never
  dispose. The memory-leak suite covers the two reusable nodes (`PhotonArrowNode`,
  `EquationNode`).

## Things that bit

- **`as const` constants become literal types.** `const ELECTRON = PHYSICS.ELECTRON_REST_ENERGY_KEV`
  has type `510.99895`, and a default parameter `= ELECTRON` then accepts only that number.
  Annotate the local as `number`.
- **A spectral line can fall between samples.** Lines are 0.6% wide; 600 uniform samples across
  the axis can step over one. `XRaySpectrumChartNode` adds a cluster of samples across every
  excited line and one exactly at the cutoff, then sorts.
- **Kramers per energy at E = 0.** The per-wavelength to per-energy conversion is 0·∞ at E = 0,
  so the first sample sits just inside the frame.
- **Label placement and `boundsProperty`.** A label that repositions itself when its own
  `boundsProperty` changes re-enters its listener. Listen to `localBoundsProperty`, which changes
  only when the text does.
- **Multilink takes a fixed-length tuple.** Spreading `Object.values(record)` into its dependency
  list does not type-check; list the string Properties explicitly, or use
  `DerivedProperty.deriveAny` and read `.value`s.
- **Bamboo tick sets and big range changes.** `ChartFrameNode.setRanges` parks every spacing at a
  huge value before changing the ranges (inherited from RelativisticDynamics); the detector
  chart's range follows the photon energy over seven decades.

## Layout decisions

- Every screen keeps its controls in a right-hand column of `CONTROL_WIDTH + 24` panels with
  Reset All beneath; the event or apparatus is top left, a graph or budget below it, and readouts
  and the equation in the middle column.
- Wiggles are relative, not absolute: an incident photon is always drawn with the same wiggle and
  the scattered one scaled by λ′/λ. Nine decades of wavelength cannot be drawn to one scale.
- The X-ray spectrum's horizontal axis depends on the anode only, never on the voltage, so that
  raising the voltage visibly moves the cutoff past stationary lines.
- The pair-production bars use one scale for energy (keV) and momentum (keV/c). The momentum gap
  is drawn at least 2 px wide so that it never disappears at high energy, where it is real but
  small; the number beside it is exact.

## Accessibility

Standard fleet pattern: every screen has a live `*ScreenSummaryContent`, an explicit `pdomOrder`
ending in Reset All, and a `*KeyboardHelpContent` (sliders, basic actions). The log-scale energy
slider reports the physical value through `pdomCreateAriaValueText`. The PET tracer is a
`RichDragListener` handle that announces its position when a drag ends.
