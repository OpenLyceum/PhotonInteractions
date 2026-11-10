/**
 * XRayTubeModel.ts
 *
 * State for the X-Ray Tube screen: the accelerating voltage, the tube current,
 * the anode metal, and how the spectrum is plotted. The spectrum itself is a
 * pure function of these (see xraySpectrum.ts); the model only derives the
 * quantities the readouts need.
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
import { betaOfKineticEnergy } from "../../common/model/fourMomentum.js";
import { PHYSICS, XRAY } from "../../PhotonInteractionsConstants.js";
import { duaneHuntWavelength, isLineExcited } from "./xraySpectrum.js";
import {
  type XRayLine,
  type XRayTarget,
  type XRayTargetId,
  XRayTargetIdValues,
  xrayTargetById,
} from "./xrayTargets.js";

export const SpectrumAxisValues = ["wavelength", "energy"] as const;
export type SpectrumAxis = (typeof SpectrumAxisValues)[number];

export class XRayTubeModel implements TModel {
  /** Accelerating voltage, kV. An electron arrives with this many keV. */
  public readonly voltageProperty: NumberProperty;

  /** Tube current, mA. Scales the whole spectrum without changing its shape. */
  public readonly currentProperty: NumberProperty;

  public readonly targetIdProperty: StringUnionProperty<XRayTargetId>;
  public readonly axisProperty: StringUnionProperty<SpectrumAxis>;
  public readonly showMoseleyProperty: BooleanProperty;

  public readonly targetProperty: TReadOnlyProperty<XRayTarget>;

  /** Duane–Hunt limit λ_min, pm. */
  public readonly minimumWavelengthProperty: TReadOnlyProperty<number>;

  /** Speed of an electron as it reaches the anode, as a fraction of c. */
  public readonly electronBetaProperty: TReadOnlyProperty<number>;

  /** The characteristic lines the current voltage is high enough to excite. */
  public readonly excitedLinesProperty: TReadOnlyProperty<XRayLine[]>;

  /** Whether the voltage exceeds the anode's K-shell binding energy. */
  public readonly kShellIonizedProperty: TReadOnlyProperty<boolean>;

  public constructor() {
    this.voltageProperty = new NumberProperty(XRAY.VOLTAGE_DEFAULT_KV, {
      range: new Range(XRAY.VOLTAGE_MIN_KV, XRAY.VOLTAGE_MAX_KV),
    });
    this.currentProperty = new NumberProperty(XRAY.CURRENT_DEFAULT_MA, {
      range: new Range(XRAY.CURRENT_MIN_MA, XRAY.CURRENT_MAX_MA),
    });
    this.targetIdProperty = new StringUnionProperty<XRayTargetId>("tungsten", { validValues: XRayTargetIdValues });
    this.axisProperty = new StringUnionProperty<SpectrumAxis>("wavelength", { validValues: SpectrumAxisValues });
    this.showMoseleyProperty = new BooleanProperty(false);

    this.targetProperty = new DerivedProperty([this.targetIdProperty], (id) => xrayTargetById(id));
    this.minimumWavelengthProperty = new DerivedProperty([this.voltageProperty], (voltage) =>
      duaneHuntWavelength(voltage),
    );
    this.electronBetaProperty = new DerivedProperty([this.voltageProperty], (voltage) =>
      betaOfKineticEnergy(PHYSICS.ELECTRON_REST_ENERGY_KEV, voltage),
    );
    this.excitedLinesProperty = new DerivedProperty([this.targetProperty, this.voltageProperty], (target, voltage) =>
      target.lines.filter((line) => isLineExcited(line, voltage)),
    );
    this.kShellIonizedProperty = new DerivedProperty(
      [this.targetProperty, this.voltageProperty],
      (target, voltage) => voltage > target.kEdgeKeV,
    );
  }

  /** Sets a worked example: a voltage and an anode together. */
  public setExample(voltageKV: number, targetId: XRayTargetId): void {
    this.targetIdProperty.value = targetId;
    this.voltageProperty.value = voltageKV;
  }

  public reset(): void {
    this.voltageProperty.reset();
    this.currentProperty.reset();
    this.targetIdProperty.reset();
    this.axisProperty.reset();
    this.showMoseleyProperty.reset();
  }

  public step(_dt: number): void {
    // Nothing in the model evolves in time; the moving electrons are view decoration.
  }
}
