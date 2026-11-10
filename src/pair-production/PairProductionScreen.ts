/**
 * PairProductionScreen.ts
 *
 * Wires the screen's model and view factories and passes screen-level options
 * (name, background colour, tandem, keyboard help) to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createPairProductionIcon() in src/common/PhotonInteractionsScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import type { TReadOnlyProperty } from "scenerystack/axon";
import { optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createPairProductionIcon } from "../common/PhotonInteractionsScreenIcons.js";
import PhotonInteractionsColors from "../PhotonInteractionsColors.js";
import { PairProductionModel } from "./model/PairProductionModel.js";
import { PairProductionKeyboardHelpContent } from "./view/PairProductionKeyboardHelpContent.js";
import { PairProductionScreenView } from "./view/PairProductionScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type SelfOptions = {
  /** Whether the screen shows its governing equation (a simulation preference). */
  showEquationsProperty: TReadOnlyProperty<boolean>;
};
type PairProductionScreenOptions = SelfOptions & ScreenOptions & { tandem: Tandem };

export class PairProductionScreen extends Screen<PairProductionModel, PairProductionScreenView> {
  public constructor(options: PairProductionScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new PairProductionModel(),
      // View factory — receives the model instance
      (model) =>
        new PairProductionScreenView(model, options.showEquationsProperty, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<PairProductionScreenOptions, SelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: PhotonInteractionsColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new PairProductionKeyboardHelpContent(),
          homeScreenIcon: createPairProductionIcon(),
          navigationBarIcon: createPairProductionIcon(),
        },
        options,
      ),
    );
  }
}
