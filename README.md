# Photon Interactions

[![CI](../../actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)

Photons behaving as particles, for a first course in modern physics: scatter a photon off an
electron and watch its wavelength grow by an amount that depends only on the angle, run an X-ray
tube and see that no photon is ever more energetic than the electron that made it, turn a photon
into an electron and a positron (and find out why it needs a nucleus to do it), and annihilate
the pair back into two photons. It accompanies Chapter 6 of the
[Modern Physics](https://github.com/QuadriviumPress/modernPhysics) textbook. Built with
[SceneryStack](https://scenerystack.org/); runs offline as a Progressive Web App.

## Features

- **Compton.** A photon of any energy from 1 eV to 10 MeV strikes an electron at rest. Drag the
  detector round to set the scattering angle; the scattered photon's wavelength, the recoil
  electron and the triangle of their momenta follow. Three graphs: the shift against angle (one
  curve for every source), the two peaks Compton saw in his spectrometer, and the spectrum a
  gamma-ray detector records, with its Compton edge and photopeak, built up photon by photon
  from the Klein–Nishina distribution. Presets give the chapter's examples: 0.100 nm X-rays,
  Mo Kα, Cs-137 and visible light.
- **X-Ray Tube.** Set the voltage and current of a tube with a chromium, copper, molybdenum,
  silver or tungsten anode. The spectrum shows the bremsstrahlung continuum stopping dead at the
  Duane–Hunt limit λ = hc/eV, and characteristic lines that appear only once the voltage can
  ionise the inner shell, then stay put while the limit keeps moving. Plot against wavelength or
  photon energy; a Moseley plot shows √f of the Kα lines against atomic number.
- **Pair Production.** A photon of up to 10 MeV passes a lead nucleus, a carbon nucleus or
  nothing. Above 1.022 MeV near a nucleus an electron and a positron appear, sharing the kinetic
  energy as you choose; a magnetic field curls their tracks in opposite senses. Energy and
  momentum bars show the rest-energy cost, and the momentum a pair can never carry: the nucleus
  takes it (with a few electronvolts of energy), and in empty space nothing can.
- **Annihilation.** A positron meets an electron at rest. At rest, two 511 keV photons leave back
  to back; in flight, the forward photon takes more and the pair is no longer collinear. Try a
  single photon to see the momentum that has nowhere to come from. A ring of PET detectors
  records lines of response that cross at a tracer you can move, or hide and then find.
- **Accessible:** every control works from the keyboard; live screen summaries; keyboard-help
  dialogs. English, French and Spanish; default and projector colour profiles; installable PWA.
  A preference (or `?showEquations=false`) hides the governing equations.

## Quick Start

```bash
npm install
npm start        # dev server → http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm start` / `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run Vitest unit tests (includes memory-leak suite) |
| `npm run test:fuzz` | Optional Playwright fuzz smoke: pointer (`?fuzz`) + keyboard (`?fuzzBoard`), with `?ea`, 30s each |
| `npm run test:fuzz -- 90` | Same fuzz for 90 seconds (`--duration 90` or `FUZZ_DURATION=90` also work) |
| `npm run test:fuzz:quick` | Shorter fuzz smoke (10s) |
| `npm run test:fuzz:long` | Longer fuzz smoke (300s) |
| `npm run check` | TypeScript type check |
| `npm run lint` | Biome lint check |
| `npm run format` | Auto-format all files |
| `npm run fix` | Lint + auto-fix |
| `npm run icons` | Regenerate PNG icons from `public/icons/icon.svg` |
| `npm run release` | `check && lint && build && test`, then version patch + push tags |
| `npm run clean` | Remove `dist/` |

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [SceneryStack](https://scenerystack.org/) | ^3.0.0 | Simulation framework |
| [Vite](https://vitejs.dev/) | ^8 | Build tool + dev server |
| [TypeScript](https://www.typescriptlang.org/) | ^7 | Type-safe JavaScript |
| [Biome](https://biomejs.dev/) | ^2.6 | Linting + formatting |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | ^2 | PWA + service worker |

## License

GNU Affero General Public License v3.0 — see [OpenLyceum org license](https://github.com/OpenLyceum/.github/blob/main/LICENSE).

## Contributing

See [OpenLyceum contributing guidelines](https://github.com/OpenLyceum/.github/blob/main/CONTRIBUTING.md).
Report bugs via GitHub Issues; use org issue templates.
