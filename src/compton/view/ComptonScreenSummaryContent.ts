/**
 * ComptonScreenSummaryContent.ts
 *
 * Screen summary for the Compton screen. "Current details" states the incident
 * photon, the scattering angle, the shift, and what the electron carries off.
 */

import { DerivedProperty } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { formatDegrees, formatEnergy, formatWavelength } from "../../common/view/chartUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { ComptonModel } from "../model/ComptonModel.js";

export class ComptonScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: ComptonModel) {
    const a11y = StringManager.getInstance().getComptonA11yStrings();

    const currentDetailsProperty = DerivedProperty.deriveAny(
      [
        model.energyProperty,
        model.thetaProperty,
        model.scatteredEnergyProperty,
        model.recoilKineticProperty,
        model.recoilAngleProperty,
        a11y.currentDetailsPatternStringProperty,
      ],
      () =>
        StringUtils.fillIn(a11y.currentDetailsPatternStringProperty.value, {
          energy: formatEnergy(model.energyProperty.value, 3),
          wavelength: formatWavelength(model.wavelengthProperty.value, 4),
          angle: formatDegrees(model.thetaProperty.value, 0),
          shift: formatWavelength(model.shiftProperty.value, 3),
          scatteredWavelength: formatWavelength(model.scatteredWavelengthProperty.value, 4),
          scatteredEnergy: formatEnergy(model.scatteredEnergyProperty.value, 3),
          recoilAngle: formatDegrees(model.recoilAngleProperty.value, 0),
          kinetic: formatEnergy(model.recoilKineticProperty.value, 3),
        }),
    );

    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: currentDetailsProperty,
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
