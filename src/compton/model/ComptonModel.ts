/**
 * ComptonModel.ts
 *
 * State for the Compton screen: the incident photon's energy (on a log scale,
 * 1 eV to 10 MeV), the scattering angle, and a gamma-ray detector that
 * accumulates a histogram of deposited energies while "fire photons" is on.
 *
 * Everything else (wavelengths, the shift, the recoil) is derived, so the view
 * never does physics.
 */

import {
  BooleanProperty,
  DerivedProperty,
  Emitter,
  NumberProperty,
  StringUnionProperty,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import { dotRandom, Range } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { energyOfWavelength, wavelengthOfEnergy } from "../../common/model/fourMomentum.js";
import { COMPTON } from "../../PhotonInteractionsConstants.js";
import {
  comptonEdge,
  comptonShift,
  detectorSpectrumFractions,
  recoilAngle,
  recoilKineticEnergy,
  sampleScatteringAngle,
  scatteredEnergy,
} from "./compton.js";

export const ComptonGraphValues = ["shift", "spectrometer", "detector"] as const;
export type ComptonGraph = (typeof ComptonGraphValues)[number];

export class ComptonModel implements TModel {
  /** log₁₀ of the incident photon energy in keV. */
  public readonly logEnergyProperty: NumberProperty;

  /** Scattering angle θ, degrees. */
  public readonly angleDegreesProperty: NumberProperty;

  /** Whether the target has tightly bound electrons too (graphite) or only free ones. */
  public readonly includeBoundProperty: BooleanProperty;

  public readonly graphProperty: StringUnionProperty<ComptonGraph>;

  /** Whether photons are being fired into the detector. */
  public readonly firingProperty: BooleanProperty;

  /** Incident photon energy, keV, and wavelength, pm. */
  public readonly energyProperty: TReadOnlyProperty<number>;
  public readonly wavelengthProperty: TReadOnlyProperty<number>;

  /** Scattering angle θ, radians. */
  public readonly thetaProperty: TReadOnlyProperty<number>;

  /** Scattered photon energy, keV, and wavelength, pm. */
  public readonly scatteredEnergyProperty: TReadOnlyProperty<number>;
  public readonly scatteredWavelengthProperty: TReadOnlyProperty<number>;

  /** λ′ − λ, pm. */
  public readonly shiftProperty: TReadOnlyProperty<number>;

  /** Recoil electron: kinetic energy (keV) and direction (radians below the beam axis). */
  public readonly recoilKineticProperty: TReadOnlyProperty<number>;
  public readonly recoilAngleProperty: TReadOnlyProperty<number>;

  /** Most energy one scattering can deposit, keV. */
  public readonly comptonEdgeProperty: TReadOnlyProperty<number>;

  /** Expected fraction of detector events per bin, for the current energy. */
  public readonly expectedFractionsProperty: TReadOnlyProperty<number[]>;

  /** Number of photons detected so far. */
  public readonly eventCountProperty: NumberProperty;

  /** Counts per bin; bins span 0 … DETECTOR_RANGE_FACTOR × E. Read after {@link histogramChangedEmitter}. */
  public readonly histogram: number[];
  public readonly histogramChangedEmitter = new Emitter();

  /** Fractional photons carried over between frames. */
  private pendingEvents = 0;

  public constructor() {
    this.logEnergyProperty = new NumberProperty(Math.log10(energyOfWavelength(COMPTON.WORKED_EXAMPLE_WAVELENGTH_PM)), {
      range: new Range(COMPTON.LOG_ENERGY_MIN, COMPTON.LOG_ENERGY_MAX),
    });
    this.angleDegreesProperty = new NumberProperty(COMPTON.ANGLE_DEFAULT_DEG, {
      range: new Range(COMPTON.ANGLE_MIN_DEG, COMPTON.ANGLE_MAX_DEG),
    });
    this.includeBoundProperty = new BooleanProperty(true);
    this.graphProperty = new StringUnionProperty<ComptonGraph>("shift", { validValues: ComptonGraphValues });
    this.firingProperty = new BooleanProperty(false);

    this.energyProperty = new DerivedProperty([this.logEnergyProperty], (log) => 10 ** log);
    this.wavelengthProperty = new DerivedProperty([this.energyProperty], (energy) => wavelengthOfEnergy(energy));
    this.thetaProperty = new DerivedProperty([this.angleDegreesProperty], (degrees) => (degrees * Math.PI) / 180);
    this.scatteredEnergyProperty = new DerivedProperty([this.energyProperty, this.thetaProperty], (energy, theta) =>
      scatteredEnergy(energy, theta),
    );
    // λ′ = λ + Δλ rather than hc/E′: for visible light the shift is parts per million of λ
    // and must not be lost to roundoff.
    this.shiftProperty = new DerivedProperty([this.thetaProperty], (theta) => comptonShift(theta));
    this.scatteredWavelengthProperty = new DerivedProperty(
      [this.wavelengthProperty, this.shiftProperty],
      (wavelength, shift) => wavelength + shift,
    );
    this.recoilKineticProperty = new DerivedProperty([this.energyProperty, this.thetaProperty], (energy, theta) =>
      recoilKineticEnergy(energy, theta),
    );
    this.recoilAngleProperty = new DerivedProperty([this.energyProperty, this.thetaProperty], (energy, theta) =>
      recoilAngle(energy, theta),
    );
    this.comptonEdgeProperty = new DerivedProperty([this.energyProperty], (energy) => comptonEdge(energy));
    this.expectedFractionsProperty = new DerivedProperty([this.energyProperty], (energy) =>
      detectorSpectrumFractions(
        energy,
        COMPTON.DETECTOR_BINS,
        COMPTON.DETECTOR_RANGE_FACTOR,
        COMPTON.PHOTOPEAK_FRACTION,
        COMPTON.DETECTOR_RESOLUTION,
      ),
    );

    this.eventCountProperty = new NumberProperty(0);
    this.histogram = new Array<number>(COMPTON.DETECTOR_BINS).fill(0);

    // A histogram collected at one energy means nothing at another.
    this.energyProperty.lazyLink(() => this.clearHistogram());
  }

  /** Sets the incident photon by energy (keV). */
  public setEnergy(energyKeV: number): void {
    this.logEnergyProperty.value = this.logEnergyProperty.range.constrainValue(Math.log10(energyKeV));
  }

  /** Sets the incident photon by wavelength (pm). */
  public setWavelength(wavelengthPm: number): void {
    this.setEnergy(energyOfWavelength(wavelengthPm));
  }

  public clearHistogram(): void {
    this.histogram.fill(0);
    this.pendingEvents = 0;
    this.eventCountProperty.value = 0;
    this.histogramChangedEmitter.emit();
  }

  /** Sends `count` photons into the detector and bins the energy each one deposits. */
  public firePhotons(count: number): void {
    const energy = this.energyProperty.value;
    const binWidth = (COMPTON.DETECTOR_RANGE_FACTOR * energy) / COMPTON.DETECTOR_BINS;
    const random = (): number => dotRandom.nextDouble();
    for (let i = 0; i < count; i++) {
      const ideal =
        random() < COMPTON.PHOTOPEAK_FRACTION
          ? energy
          : recoilKineticEnergy(energy, sampleScatteringAngle(energy, random));
      const deposited = ideal + COMPTON.DETECTOR_RESOLUTION * energy * dotRandom.nextGaussian();
      const bin = Math.max(0, Math.min(COMPTON.DETECTOR_BINS - 1, Math.floor(deposited / binWidth)));
      this.histogram[bin] = (this.histogram[bin] ?? 0) + 1;
    }
    this.eventCountProperty.value += count;
    this.histogramChangedEmitter.emit();
  }

  public reset(): void {
    this.logEnergyProperty.reset();
    this.angleDegreesProperty.reset();
    this.includeBoundProperty.reset();
    this.graphProperty.reset();
    this.firingProperty.reset();
    this.clearHistogram();
  }

  public step(dt: number): void {
    if (!this.firingProperty.value) {
      return;
    }
    if (this.eventCountProperty.value >= COMPTON.MAX_EVENTS) {
      this.firingProperty.value = false;
      return;
    }
    // Cap dt so a tab returning from the background does not fire thousands at once.
    this.pendingEvents += COMPTON.FIRE_RATE_PER_S * Math.min(dt, 0.1);
    const count = Math.floor(this.pendingEvents);
    if (count > 0) {
      this.pendingEvents -= count;
      this.firePhotons(count);
    }
  }
}
