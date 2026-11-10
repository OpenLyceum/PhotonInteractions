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
import PhotonInteractionsNamespace from "../PhotonInteractionsNamespace.js";
import type { PhotonInteractionsPreferencesModel } from "./PhotonInteractionsPreferencesModel.js";

export class PhotonInteractionsPreferencesNode extends VBox {
  public constructor(preferencesModel: PhotonInteractionsPreferencesModel, tandem?: Tandem) {
    const prefStrings = StringManager.getInstance().getPreferences();

    // The Preferences dialog is always white, so use the dark "light control surface"
    // colors (readable on white in both default and projector profiles), not textColorProperty
    // (which is near-white in default mode and would be invisible on the white dialog).
    const header = new Text(prefStrings.titleStringProperty, {
      font: new PhetFont({ size: 18, weight: "bold" }),
      fill: PhotonInteractionsColors.controlSurfaceTextColorProperty,
    });

    const exampleToggleCheckbox = new Checkbox(
      preferencesModel.exampleToggleProperty,
      new Text(prefStrings.exampleToggleStringProperty, {
        font: new PhetFont(14),
        fill: PhotonInteractionsColors.controlSurfaceTextColorProperty,
      }),
      {
        checkboxColor: PhotonInteractionsColors.controlSurfaceTextColorProperty,
        checkboxColorBackground: PhotonInteractionsColors.controlSurfaceColorProperty,
        spacing: 8,
        ...(tandem && { tandem: tandem.createTandem("exampleToggleCheckbox") }),
      },
    );

    super({
      align: "left",
      spacing: 12,
      children: [header, exampleToggleCheckbox],
    });
  }
}

PhotonInteractionsNamespace.register("PhotonInteractionsPreferencesNode", PhotonInteractionsPreferencesNode);
