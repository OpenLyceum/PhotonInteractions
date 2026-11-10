/**
 * MomentumTriangleNode.ts
 *
 * Conservation of momentum as a picture: the incident photon's momentum h/λ is
 * the vector sum of the scattered photon's h/λ′ and the electron's pₑ. This is
 * the triangle to which the chapter applies the law of cosines (equation i).
 * The incident momentum is always drawn the same length; the other two are to
 * scale with it.
 */

import { Multilink } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { Node, Rectangle, Text } from "scenerystack/scenery";
import { ArrowNode } from "scenerystack/scenery-phet";
import { StringManager } from "../../i18n/StringManager.js";
import PhotonInteractionsColors from "../../PhotonInteractionsColors.js";
import { FONTS } from "../../PhotonInteractionsConstants.js";
import type { ComptonModel } from "../model/ComptonModel.js";

export const TRIANGLE_WIDTH = 290;
export const TRIANGLE_HEIGHT = 158;

const INCIDENT_LENGTH = 112;
const TAIL = new Vector2(TRIANGLE_WIDTH / 2 - 8, TRIANGLE_HEIGHT - 26);

export class MomentumTriangleNode extends Node {
  public constructor(model: ComptonModel) {
    super();
    const strings = StringManager.getInstance().getComptonStrings();

    const frame = new Rectangle(0, 0, TRIANGLE_WIDTH, TRIANGLE_HEIGHT, {
      fill: PhotonInteractionsColors.chartBackgroundColorProperty,
      stroke: PhotonInteractionsColors.panelBorderColorProperty,
      cornerRadius: 6,
    });
    const title = new Text(strings.triangleTitleStringProperty, {
      font: FONTS.CHART_TITLE,
      fill: PhotonInteractionsColors.textColorProperty,
      maxWidth: TRIANGLE_WIDTH - 20,
      left: 10,
      top: 8,
    });

    const arrow = (fill: typeof PhotonInteractionsColors.textColorProperty): ArrowNode =>
      new ArrowNode(0, 0, 1, 0, { fill, stroke: null, tailWidth: 3, headWidth: 9, headHeight: 10 });
    const incident = arrow(PhotonInteractionsColors.photonColorProperty);
    const scattered = arrow(PhotonInteractionsColors.scatteredPhotonColorProperty);
    const electron = arrow(PhotonInteractionsColors.electronColorProperty);
    const tip = TAIL.plusXY(INCIDENT_LENGTH, 0);
    incident.setTailAndTip(TAIL.x, TAIL.y, tip.x, tip.y);

    const label = (text: string, fill: typeof PhotonInteractionsColors.textColorProperty): Text =>
      new Text(text, { font: FONTS.PARTICLE_LABEL, fill });
    const incidentLabel = label("h/λ", PhotonInteractionsColors.photonColorProperty);
    incidentLabel.centerX = TAIL.x + INCIDENT_LENGTH / 2;
    incidentLabel.top = TAIL.y + 5;
    const scatteredLabel = label("h/λ′", PhotonInteractionsColors.scatteredPhotonColorProperty);
    const electronLabel = label("pₑ", PhotonInteractionsColors.electronColorProperty);

    Multilink.multilink(
      [model.thetaProperty, model.energyProperty, model.scatteredEnergyProperty],
      (theta, energy, scatteredEnergy) => {
        const length = (INCIDENT_LENGTH * scatteredEnergy) / energy;
        const corner = TAIL.plusXY(length * Math.cos(theta), -length * Math.sin(theta));
        scattered.setTailAndTip(TAIL.x, TAIL.y, corner.x, corner.y);
        const closes = corner.distance(tip) > 2;
        electron.visible = closes;
        electronLabel.visible = closes;
        if (closes) {
          electron.setTailAndTip(corner.x, corner.y, tip.x, tip.y);
        }
        // Labels sit outside the triangle: left of the scattered side, right of the electron's.
        const outward = new Vector2(-Math.sin(theta), -Math.cos(theta));
        scatteredLabel.center = TAIL.blend(corner, 0.5).plus(outward.timesScalar(theta > Math.PI - 0.2 ? -14 : 16));
        const side = tip.minus(corner);
        const normal = side.magnitude > 0 ? new Vector2(-side.y, side.x).normalized() : new Vector2(0, -1);
        electronLabel.center = corner.blend(tip, 0.5).plus(normal.timesScalar(normal.y > 0 ? -15 : 15));
      },
    );

    this.children = [frame, title, incident, scattered, electron, incidentLabel, scatteredLabel, electronLabel];
  }
}
