/**
 * ComptonScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createComptonIcon() in src/common/PhotonInteractionsScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createComptonIcon } from "../common/PhotonInteractionsScreenIcons.js";
import PhotonInteractionsColors from "../PhotonInteractionsColors.js";
import { ComptonModel } from "./model/ComptonModel.js";
import { ComptonKeyboardHelpContent } from "./view/ComptonKeyboardHelpContent.js";
import { ComptonScreenView } from "./view/ComptonScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type ComptonScreenOptions = ScreenOptions & { tandem: Tandem };

export class ComptonScreen extends Screen<ComptonModel, ComptonScreenView> {
  public constructor(options: ComptonScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new ComptonModel(),
      // View factory — receives the model instance
      (model) =>
        new ComptonScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<ComptonScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: PhotonInteractionsColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new ComptonKeyboardHelpContent(),
          homeScreenIcon: createComptonIcon(),
          navigationBarIcon: createComptonIcon(),
        },
        options,
      ),
    );
  }
}
