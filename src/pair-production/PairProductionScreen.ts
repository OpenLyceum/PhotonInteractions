/**
 * PairProductionScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createPairProductionIcon() in src/common/PhotonInteractionsScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createPairProductionIcon } from "../common/PhotonInteractionsScreenIcons.js";
import PhotonInteractionsColors from "../PhotonInteractionsColors.js";
import { PairProductionModel } from "./model/PairProductionModel.js";
import { PairProductionKeyboardHelpContent } from "./view/PairProductionKeyboardHelpContent.js";
import { PairProductionScreenView } from "./view/PairProductionScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type PairProductionScreenOptions = ScreenOptions & { tandem: Tandem };

export class PairProductionScreen extends Screen<PairProductionModel, PairProductionScreenView> {
  public constructor(options: PairProductionScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new PairProductionModel(),
      // View factory — receives the model instance
      (model) =>
        new PairProductionScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<PairProductionScreenOptions, EmptySelfOptions, ScreenOptions>()(
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
