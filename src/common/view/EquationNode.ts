/**
 * EquationNode.ts
 *
 * The governing equation of a screen, set in a serif italic so it reads as
 * mathematics rather than as a label. Hidden when the "Show equations"
 * preference is off. Equations are notation and are not translated.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { RichText } from "scenerystack/scenery";
import PhotonInteractionsColors from "../../PhotonInteractionsColors.js";
import { FONTS } from "../../PhotonInteractionsConstants.js";

export class EquationNode extends RichText {
  public constructor(equation: string, visibleProperty: TReadOnlyProperty<boolean>, maxWidth: number) {
    super(equation, {
      font: FONTS.EQUATION,
      fill: PhotonInteractionsColors.textColorProperty,
      visibleProperty,
      maxWidth,
    });
  }
}
