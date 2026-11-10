/**
 * PhotonInteractionsPanel.ts
 *
 * A pre-themed Panel that automatically uses PhotonInteractionsColors for background and
 * border. Use this for all control panels and info boxes in the sim so that
 * default / projector mode switching is handled automatically.
 *
 * ── Basic usage ───────────────────────────────────────────────────────────────
 *
 *   import { PhotonInteractionsPanel } from "../../common/PhotonInteractionsPanel.js";
 *   import { VBox, Text } from "scenerystack/scenery";
 *
 *   const content = new VBox({
 *     children: [ new Text("label"), slider ],
 *     spacing: 8,
 *   });
 *   const panel = new PhotonInteractionsPanel(content);
 *
 * ── Overriding defaults ───────────────────────────────────────────────────────
 *
 *   // Wider margins, sharper corners, custom stroke
 *   const panel = new PhotonInteractionsPanel(content, { xMargin: 20, cornerRadius: 0 });
 *
 *   // Transparent background (decorative border only)
 *   const panel = new PhotonInteractionsPanel(content, { fill: "transparent" });
 */

import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { Node } from "scenerystack/scenery";
import { Panel, type PanelOptions } from "scenerystack/sun";
import PhotonInteractionsColors from "../PhotonInteractionsColors.js";
import { PANEL_CORNER_RADIUS } from "../PhotonInteractionsConstants.js";

export type PhotonInteractionsPanelOptions = PanelOptions;

export class PhotonInteractionsPanel extends Panel {
  public constructor(content: Node, providedOptions?: PhotonInteractionsPanelOptions) {
    const options = optionize<PhotonInteractionsPanelOptions, EmptySelfOptions, PanelOptions>()(
      {
        fill: PhotonInteractionsColors.panelBackgroundColorProperty,
        stroke: PhotonInteractionsColors.panelBorderColorProperty,
        cornerRadius: PANEL_CORNER_RADIUS,
        xMargin: 12,
        yMargin: 10,
      },
      providedOptions,
    );
    super(content, options);
  }
}
