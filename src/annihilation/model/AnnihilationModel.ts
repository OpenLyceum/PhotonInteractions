/**
 * AnnihilationModel.ts
 *
 * State for the Annihilation screen.
 *
 * The event: a positron of adjustable kinetic energy (zero is annihilation at
 * rest) meets an electron at rest, and two photons leave. The direction of
 * photon 1 in the centre-of-momentum frame is a free choice; everything else
 * follows from conservation of energy and momentum.
 *
 * The PET scanner: a tracer inside a ring of detectors. While recording, each
 * annihilation (at rest, so back to back) picks a random direction and adds the
 * line between the two detectors it fires.
 */

import { BooleanProperty, DerivedProperty, Emitter, NumberProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { dotRandom, Range, Vector2, Vector2Property } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import type { FourMomentum } from "../../common/model/fourMomentum.js";
import { ANNIHILATION } from "../../PhotonInteractionsConstants.js";
import { annihilationPhotons, initialFourMomentum, openingAngle, singlePhotonMomentumDeficit } from "./annihilation.js";
import { type LineOfResponse, lineOfResponse } from "./petRing.js";

/** Where the tracer starts: off-centre, so the lines visibly do not cross at the middle of the ring. */
const TRACER_DEFAULT_CM = new Vector2(12, 8);

export class AnnihilationModel implements TModel {
  /** Positron kinetic energy, MeV (the unit of the control). */
  public readonly kineticMeVProperty: NumberProperty;

  /** Direction of photon 1 in the CM frame, degrees from the positron's direction. */
  public readonly cmAngleDegreesProperty: NumberProperty;

  /** Whether the forbidden single-photon final state is shown instead. */
  public readonly onePhotonProperty: BooleanProperty;

  /** Positron kinetic energy, keV. */
  public readonly kineticProperty: TReadOnlyProperty<number>;

  /** Total four-momentum of positron plus electron. */
  public readonly totalProperty: TReadOnlyProperty<FourMomentum>;

  /** The two photons in the lab. */
  public readonly photonsProperty: TReadOnlyProperty<[FourMomentum, FourMomentum]>;

  /** Angle between the photons, radians. */
  public readonly openingAngleProperty: TReadOnlyProperty<number>;

  /** Momentum a single photon would lack, keV/c. */
  public readonly deficitProperty: TReadOnlyProperty<number>;

  // ── PET scanner ───────────────────────────────────────────────────────────────

  public readonly recordingProperty: BooleanProperty;
  public readonly showTracerProperty: BooleanProperty;

  /** Tracer position relative to the centre of the ring, cm, y up. */
  public readonly tracerPositionProperty: Vector2Property;

  public readonly coincidenceCountProperty: NumberProperty;

  /** The most recent lines of response, oldest first. Read after {@link linesChangedEmitter}. */
  public readonly lines: LineOfResponse[] = [];
  public readonly linesChangedEmitter = new Emitter();

  private pendingEvents = 0;

  public constructor() {
    this.kineticMeVProperty = new NumberProperty(ANNIHILATION.KINETIC_DEFAULT_MEV, {
      range: new Range(ANNIHILATION.KINETIC_MIN_MEV, ANNIHILATION.KINETIC_MAX_MEV),
    });
    this.cmAngleDegreesProperty = new NumberProperty(ANNIHILATION.CM_ANGLE_DEFAULT_DEG, {
      range: new Range(ANNIHILATION.CM_ANGLE_MIN_DEG, ANNIHILATION.CM_ANGLE_MAX_DEG),
    });
    this.onePhotonProperty = new BooleanProperty(false);

    this.kineticProperty = new DerivedProperty([this.kineticMeVProperty], (kinetic) => 1000 * kinetic);
    this.totalProperty = new DerivedProperty([this.kineticProperty], (kinetic) => initialFourMomentum(kinetic));
    this.photonsProperty = new DerivedProperty(
      [this.kineticProperty, this.cmAngleDegreesProperty],
      (kinetic, degrees) => annihilationPhotons(kinetic, (degrees * Math.PI) / 180),
    );
    this.openingAngleProperty = new DerivedProperty([this.photonsProperty], ([first, second]) =>
      openingAngle(first, second),
    );
    this.deficitProperty = new DerivedProperty([this.kineticProperty], (kinetic) =>
      singlePhotonMomentumDeficit(kinetic),
    );

    this.recordingProperty = new BooleanProperty(false);
    this.showTracerProperty = new BooleanProperty(true);
    this.tracerPositionProperty = new Vector2Property(TRACER_DEFAULT_CM);
    this.coincidenceCountProperty = new NumberProperty(0);

    // Lines recorded for one tracer position say nothing about another.
    this.tracerPositionProperty.lazyLink(() => this.clearLines());
  }

  public clearLines(): void {
    this.lines.length = 0;
    this.pendingEvents = 0;
    this.coincidenceCountProperty.value = 0;
    this.linesChangedEmitter.emit();
  }

  /** Records `count` annihilations of the tracer, each in a random direction. */
  public recordAnnihilations(count: number): void {
    for (let i = 0; i < count; i++) {
      this.lines.push(
        lineOfResponse(
          this.tracerPositionProperty.value,
          Math.PI * dotRandom.nextDouble(),
          ANNIHILATION.RING_RADIUS_CM,
          ANNIHILATION.DETECTOR_COUNT,
        ),
      );
    }
    if (this.lines.length > ANNIHILATION.MAX_LINES) {
      this.lines.splice(0, this.lines.length - ANNIHILATION.MAX_LINES);
    }
    this.coincidenceCountProperty.value += count;
    this.linesChangedEmitter.emit();
  }

  public reset(): void {
    this.kineticMeVProperty.reset();
    this.cmAngleDegreesProperty.reset();
    this.onePhotonProperty.reset();
    this.recordingProperty.reset();
    this.showTracerProperty.reset();
    this.tracerPositionProperty.reset();
    this.clearLines();
  }

  public step(dt: number): void {
    if (!this.recordingProperty.value) {
      return;
    }
    // Cap dt so a tab returning from the background does not record hundreds at once.
    this.pendingEvents += ANNIHILATION.EVENT_RATE_PER_S * Math.min(dt, 0.1);
    const count = Math.floor(this.pendingEvents);
    if (count > 0) {
      this.pendingEvents -= count;
      this.recordAnnihilations(count);
    }
  }
}
