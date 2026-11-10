/**
 * AnnihilationScreenSummaryContent.ts
 *
 * Screen summary for the Annihilation screen. "Current details" gives the
 * positron's kinetic energy and each photon's energy and direction.
 */

import { DerivedProperty } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { formatDegrees, formatEnergy } from "../../common/view/chartUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { AnnihilationModel } from "../model/AnnihilationModel.js";

export class AnnihilationScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: AnnihilationModel) {
    const a11y = StringManager.getInstance().getAnnihilationA11yStrings();

    const currentDetailsProperty = new DerivedProperty(
      [
        model.kineticProperty,
        model.photonsProperty,
        model.openingAngleProperty,
        a11y.currentDetailsPatternStringProperty,
      ],
      (kinetic, [first, second], opening, pattern) =>
        StringUtils.fillIn(pattern, {
          kinetic: formatEnergy(kinetic, 3),
          energy1: formatEnergy(first.energy, 3),
          angle1: formatDegrees(first.angle, 0),
          energy2: formatEnergy(second.energy, 3),
          angle2: formatDegrees(second.angle, 0),
          opening: formatDegrees(opening, 0),
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
