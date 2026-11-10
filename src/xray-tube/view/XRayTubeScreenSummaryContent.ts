/**
 * XRayTubeScreenSummaryContent.ts
 *
 * Screen summary for the X-Ray Tube screen. "Current details" names the anode
 * and voltage, states the Duane–Hunt limit both ways, and lists the
 * characteristic lines the voltage is high enough to excite.
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { formatEnergy, formatTickValue, formatWavelength } from "../../common/view/chartUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { XRayTubeModel } from "../model/XRayTubeModel.js";
import type { XRayTargetId } from "../model/xrayTargets.js";

export class XRayTubeScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: XRayTubeModel) {
    const sm = StringManager.getInstance();
    const a11y = sm.getXRayTubeA11yStrings();
    const targets = sm.getXRayTubeStrings().targets;
    const targetNames: Record<XRayTargetId, TReadOnlyProperty<string>> = {
      chromium: targets.chromiumStringProperty,
      copper: targets.copperStringProperty,
      molybdenum: targets.molybdenumStringProperty,
      silver: targets.silverStringProperty,
      tungsten: targets.tungstenStringProperty,
    };

    const currentDetailsProperty = DerivedProperty.deriveAny(
      [
        model.targetIdProperty,
        model.voltageProperty,
        model.excitedLinesProperty,
        a11y.currentDetailsPatternStringProperty,
        a11y.noLinesStringProperty,
        ...Object.values(targetNames),
      ],
      () => {
        const lines = model.excitedLinesProperty.value.map((line) => line.label);
        return StringUtils.fillIn(a11y.currentDetailsPatternStringProperty.value, {
          target: targetNames[model.targetIdProperty.value].value,
          voltage: formatTickValue(model.voltageProperty.value, 0),
          minimumWavelength: formatWavelength(model.minimumWavelengthProperty.value, 3),
          maximumEnergy: formatEnergy(model.voltageProperty.value, 3),
          lines: lines.length > 0 ? lines.join(", ") : a11y.noLinesStringProperty.value,
        });
      },
    );

    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: currentDetailsProperty,
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
