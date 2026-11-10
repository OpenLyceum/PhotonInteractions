/**
 * PairProductionModel.ts
 *
 * State for the Pair Production screen: the photon's energy, what it passes
 * (a lead nucleus, a carbon nucleus, or nothing), how the pair shares the
 * kinetic energy, and whether a magnetic field curves the tracks.
 *
 * `phaseProperty` runs from 0 to 1 over and over: the photon arrives during the
 * first part and the tracks are drawn during the rest. It is animation only;
 * every physical quantity is derived from the controls.
 */

import {
  BooleanProperty,
  DerivedProperty,
  NumberProperty,
  StringUnionProperty,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { PAIR } from "../../PhotonInteractionsConstants.js";
import {
  maximumPairMomentum,
  momentumShortfall,
  PAIR_REST_ENERGY_KEV,
  type PairEvent,
  pairEvent,
} from "./pairProduction.js";

export const SurroundingsValues = ["lead", "carbon", "vacuum"] as const;
export type Surroundings = (typeof SurroundingsValues)[number];

export const PairStatusValues = ["below", "allowed", "forbidden"] as const;
export type PairStatus = (typeof PairStatusValues)[number];

export class PairProductionModel implements TModel {
  /** Photon energy, MeV (the unit of the control). */
  public readonly energyMeVProperty: NumberProperty;

  public readonly surroundingsProperty: StringUnionProperty<Surroundings>;

  /** Percentage of the available kinetic energy the electron takes. */
  public readonly sharePercentProperty: NumberProperty;

  public readonly fieldOnProperty: BooleanProperty;

  /** Animation phase, 0 … 1, repeating. */
  public readonly phaseProperty: NumberProperty;

  /** Photon energy, keV. */
  public readonly energyProperty: TReadOnlyProperty<number>;

  /** The pair and the nucleus's recoil, or null if no pair is produced. */
  public readonly eventProperty: TReadOnlyProperty<PairEvent | null>;

  /**
   * "below": the photon has less than 2mₑc². "forbidden": it has enough energy but
   * nothing to take the surplus momentum. "allowed": a pair is produced.
   */
  public readonly statusProperty: TReadOnlyProperty<PairStatus>;

  /** Most momentum a pair of this total energy could carry, and how far short of the photon's that is, keV/c. */
  public readonly maximumPairMomentumProperty: TReadOnlyProperty<number>;
  public readonly shortfallProperty: TReadOnlyProperty<number>;

  public constructor() {
    this.energyMeVProperty = new NumberProperty(PAIR.ENERGY_DEFAULT_MEV, {
      range: new Range(PAIR.ENERGY_MIN_MEV, PAIR.ENERGY_MAX_MEV),
    });
    this.surroundingsProperty = new StringUnionProperty<Surroundings>("lead", { validValues: SurroundingsValues });
    this.sharePercentProperty = new NumberProperty(100 * PAIR.SHARE_DEFAULT, {
      range: new Range(100 * PAIR.SHARE_MIN, 100 * PAIR.SHARE_MAX),
    });
    this.fieldOnProperty = new BooleanProperty(false);
    this.phaseProperty = new NumberProperty(0);

    this.energyProperty = new DerivedProperty([this.energyMeVProperty], (energy) => 1000 * energy);
    this.eventProperty = new DerivedProperty(
      [this.energyProperty, this.surroundingsProperty, this.sharePercentProperty],
      (energy, surroundings, sharePercent) =>
        surroundings === "vacuum"
          ? null
          : pairEvent(
              energy,
              sharePercent / 100,
              surroundings === "lead" ? PAIR.LEAD_NUCLEUS_KEV : PAIR.CARBON_NUCLEUS_KEV,
            ),
    );
    this.statusProperty = new DerivedProperty(
      [this.energyProperty, this.surroundingsProperty, this.eventProperty],
      (energy, surroundings, event) => {
        if (event) {
          return "allowed";
        }
        return surroundings === "vacuum" && energy > PAIR_REST_ENERGY_KEV ? "forbidden" : "below";
      },
    );
    this.maximumPairMomentumProperty = new DerivedProperty([this.energyProperty], (energy) =>
      maximumPairMomentum(energy),
    );
    this.shortfallProperty = new DerivedProperty([this.energyProperty], (energy) => momentumShortfall(energy));
  }

  public reset(): void {
    this.energyMeVProperty.reset();
    this.surroundingsProperty.reset();
    this.sharePercentProperty.reset();
    this.fieldOnProperty.reset();
    this.phaseProperty.reset();
  }

  public step(dt: number): void {
    this.phaseProperty.value = (this.phaseProperty.value + dt / PAIR.EVENT_PERIOD_S) % 1;
  }
}
