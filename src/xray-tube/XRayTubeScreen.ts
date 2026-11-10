/**
 * XRayTubeScreen.ts
 *
 * Wires the screen's model and view factories and passes screen-level options
 * (name, background colour, tandem, keyboard help) to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createXRayTubeIcon() in src/common/PhotonInteractionsScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import type { TReadOnlyProperty } from "scenerystack/axon";
import { optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createXRayTubeIcon } from "../common/PhotonInteractionsScreenIcons.js";
import PhotonInteractionsColors from "../PhotonInteractionsColors.js";
import { XRayTubeModel } from "./model/XRayTubeModel.js";
import { XRayTubeKeyboardHelpContent } from "./view/XRayTubeKeyboardHelpContent.js";
import { XRayTubeScreenView } from "./view/XRayTubeScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type SelfOptions = {
  /** Whether the screen shows its governing equation (a simulation preference). */
  showEquationsProperty: TReadOnlyProperty<boolean>;
};
type XRayTubeScreenOptions = SelfOptions & ScreenOptions & { tandem: Tandem };

export class XRayTubeScreen extends Screen<XRayTubeModel, XRayTubeScreenView> {
  public constructor(options: XRayTubeScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new XRayTubeModel(),
      // View factory — receives the model instance
      (model) =>
        new XRayTubeScreenView(model, options.showEquationsProperty, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<XRayTubeScreenOptions, SelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: PhotonInteractionsColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new XRayTubeKeyboardHelpContent(),
          homeScreenIcon: createXRayTubeIcon(),
          navigationBarIcon: createXRayTubeIcon(),
        },
        options,
      ),
    );
  }
}
