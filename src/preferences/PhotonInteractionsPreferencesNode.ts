/**
 * PhotonInteractionsPreferencesNode.ts
 *
 * Custom preferences UI shown in Preferences → Simulation. Controls are bound
 * to PhotonInteractionsPreferencesModel Properties (whose initial values come from
 * photonInteractionsQueryParameters).
 */

import { Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Checkbox } from "scenerystack/sun";
import type { Tandem } from "scenerystack/tandem";
import { StringManager } from "../i18n/StringManager.js";
import PhotonInteractionsColors from "../PhotonInteractionsColors.js";
import { PREFERENCES } from "../PhotonInteractionsConstants.js";
import PhotonInteractionsNamespace from "../PhotonInteractionsNamespace.js";
import type { PhotonInteractionsPreferencesModel } from "./PhotonInteractionsPreferencesModel.js";

export class PhotonInteractionsPreferencesNode extends VBox {
  public constructor(preferencesModel: PhotonInteractionsPreferencesModel, tandem?: Tandem) {
    const prefStrings = StringManager.getInstance().getPreferences();

    // The Preferences dialog is always white, so use the dark "light control surface"
    // colors (readable on white in both default and projector profiles), not textColorProperty
    // (which is near-white in default mode and would be invisible on the white dialog).
    const header = new Text(prefStrings.titleStringProperty, {
      font: new PhetFont({ size: PREFERENCES.HEADER_FONT_SIZE, weight: "bold" }),
      fill: PhotonInteractionsColors.controlSurfaceTextColorProperty,
    });

    const showEquationsCheckbox = new Checkbox(
      preferencesModel.showEquationsProperty,
      new Text(prefStrings.showEquationsStringProperty, {
        font: new PhetFont(PREFERENCES.CHECKBOX_FONT_SIZE),
        fill: PhotonInteractionsColors.controlSurfaceTextColorProperty,
      }),
      {
        checkboxColor: PhotonInteractionsColors.controlSurfaceTextColorProperty,
        checkboxColorBackground: PhotonInteractionsColors.controlSurfaceColorProperty,
        spacing: PREFERENCES.CHECKBOX_SPACING,
        ...(tandem && { tandem: tandem.createTandem("showEquationsCheckbox") }),
      },
    );

    super({
      align: "left",
      spacing: PREFERENCES.SPACING,
      children: [header, showEquationsCheckbox],
    });
  }
}

PhotonInteractionsNamespace.register("PhotonInteractionsPreferencesNode", PhotonInteractionsPreferencesNode);
