/**
 * AnnihilationScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createAnnihilationIcon() in src/common/PhotonInteractionsScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createAnnihilationIcon } from "../common/PhotonInteractionsScreenIcons.js";
import PhotonInteractionsColors from "../PhotonInteractionsColors.js";
import { AnnihilationModel } from "./model/AnnihilationModel.js";
import { AnnihilationKeyboardHelpContent } from "./view/AnnihilationKeyboardHelpContent.js";
import { AnnihilationScreenView } from "./view/AnnihilationScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type AnnihilationScreenOptions = ScreenOptions & { tandem: Tandem };

export class AnnihilationScreen extends Screen<AnnihilationModel, AnnihilationScreenView> {
  public constructor(options: AnnihilationScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new AnnihilationModel(),
      // View factory — receives the model instance
      (model) =>
        new AnnihilationScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<AnnihilationScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: PhotonInteractionsColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new AnnihilationKeyboardHelpContent(),
          homeScreenIcon: createAnnihilationIcon(),
          navigationBarIcon: createAnnihilationIcon(),
        },
        options,
      ),
    );
  }
}
