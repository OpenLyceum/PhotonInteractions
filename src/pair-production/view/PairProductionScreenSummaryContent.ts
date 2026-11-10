/**
 * PairProductionScreenSummaryContent.ts
 *
 * Screen summary for the Pair Production screen. "Current details" states the
 * photon energy and surroundings, the verdict, and (when a pair is made) how the
 * energy and momentum are shared.
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { formatEnergy } from "../../common/view/chartUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { PairProductionModel, PairStatus, Surroundings } from "../model/PairProductionModel.js";

export class PairProductionScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: PairProductionModel) {
    const sm = StringManager.getInstance();
    const a11y = sm.getPairProductionA11yStrings();
    const strings = sm.getPairProductionStrings();
    const surroundingsNames: Record<Surroundings, TReadOnlyProperty<string>> = {
      lead: strings.surroundings.leadStringProperty,
      carbon: strings.surroundings.carbonStringProperty,
      vacuum: strings.surroundings.vacuumStringProperty,
    };
    const statusNames: Record<PairStatus, TReadOnlyProperty<string>> = {
      below: strings.status.belowStringProperty,
      allowed: strings.status.allowedStringProperty,
      forbidden: strings.status.forbiddenStringProperty,
    };

    const currentDetailsProperty = DerivedProperty.deriveAny(
      [
        model.energyProperty,
        model.surroundingsProperty,
        model.statusProperty,
        model.eventProperty,
        a11y.currentDetailsPatternStringProperty,
        a11y.productsPatternStringProperty,
        ...Object.values(surroundingsNames),
        ...Object.values(statusNames),
      ],
      () => {
        const event = model.eventProperty.value;
        const summary = StringUtils.fillIn(a11y.currentDetailsPatternStringProperty.value, {
          energy: formatEnergy(model.energyProperty.value, 3),
          surroundings: surroundingsNames[model.surroundingsProperty.value].value.toLowerCase(),
          status: statusNames[model.statusProperty.value].value,
        });
        return event
          ? `${summary} ${StringUtils.fillIn(a11y.productsPatternStringProperty.value, {
              electronKinetic: formatEnergy(event.electronKinetic, 3),
              positronKinetic: formatEnergy(event.positronKinetic, 3),
              nucleusMomentum: formatEnergy(event.nucleusMomentum, 3, "/c"),
              nucleusKinetic: formatEnergy(event.nucleusKinetic, 3),
            })}`
          : summary;
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
