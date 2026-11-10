/**
 * ComptonCollisionNode.ts
 *
 * The collision as it looks in the lab: a photon comes in from the left and hits
 * an electron at rest; the photon leaves at θ with a longer wavelength and the
 * electron recoils at φ on the other side of the beam axis. The detector on the
 * arc can be dragged to set θ (the angle slider is its keyboard equivalent).
 *
 * The wiggles are drawn to scale with each other, not with the page: the
 * scattered photon's drawn wavelength is the incident one times λ′/λ.
 */

import { Multilink } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Circle, DragListener, Line, Node, Path, Rectangle, Text } from "scenerystack/scenery";
import { ArrowNode } from "scenerystack/scenery-phet";
import { PhotonArrowNode } from "../../common/view/PhotonArrowNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import PhotonInteractionsColors from "../../PhotonInteractionsColors.js";
import { COMPTON, FONTS } from "../../PhotonInteractionsConstants.js";
import type { ComptonModel } from "../model/ComptonModel.js";

export const COLLISION_WIDTH = 420;
export const COLLISION_HEIGHT = 300;

const ORIGIN = new Vector2(180, 172);
const INCIDENT_LENGTH = 150;
const SCATTERED_LENGTH = 118;
const DETECTOR_RADIUS = 140;
const THETA_ARC_RADIUS = 34;
const PHI_ARC_RADIUS = 46;
const INCIDENT_WIGGLE_PX = 14;
const MAX_WIGGLE_PX = 90;
const ELECTRON_ARROW_MIN = 26;
const ELECTRON_ARROW_MAX = 120;

export class ComptonCollisionNode extends Node {
  public constructor(model: ComptonModel) {
    super();
    const strings = StringManager.getInstance().getComptonStrings();

    const frame = new Rectangle(0, 0, COLLISION_WIDTH, COLLISION_HEIGHT, {
      fill: PhotonInteractionsColors.chartBackgroundColorProperty,
      stroke: PhotonInteractionsColors.panelBorderColorProperty,
      cornerRadius: 6,
    });
    const title = new Text(strings.collisionTitleStringProperty, {
      font: FONTS.CHART_TITLE,
      fill: PhotonInteractionsColors.textColorProperty,
      maxWidth: COLLISION_WIDTH - 20,
      left: 10,
      top: 8,
    });

    // Beam axis, continued past the electron as a dashed reference for both angles.
    const axis = new Line(ORIGIN.x, ORIGIN.y, COLLISION_WIDTH - 12, ORIGIN.y, {
      stroke: PhotonInteractionsColors.secondaryTextColorProperty,
      lineDash: [4, 4],
    });
    // The arc the detector rides on.
    const detectorTrack = new Path(Shape.arc(ORIGIN.x, ORIGIN.y, DETECTOR_RADIUS, 0, Math.PI, true), {
      stroke: PhotonInteractionsColors.chartGridColorProperty,
      lineWidth: 1.5,
    });

    const incident = new PhotonArrowNode(PhotonInteractionsColors.photonColorProperty);
    incident.setArrow(
      new Vector2(ORIGIN.x - INCIDENT_LENGTH - 12, ORIGIN.y),
      new Vector2(ORIGIN.x - 12, ORIGIN.y),
      INCIDENT_WIGGLE_PX,
    );
    const scattered = new PhotonArrowNode(PhotonInteractionsColors.scatteredPhotonColorProperty);
    const electronArrow = new ArrowNode(0, 0, 1, 0, {
      fill: PhotonInteractionsColors.electronColorProperty,
      stroke: null,
      tailWidth: 3,
      headWidth: 10,
      headHeight: 11,
    });
    const electron = new Circle(7, {
      fill: PhotonInteractionsColors.electronColorProperty,
      center: ORIGIN,
    });

    const thetaArc = new Path(null, { stroke: PhotonInteractionsColors.scatteredPhotonColorProperty, lineWidth: 1.5 });
    const phiArc = new Path(null, { stroke: PhotonInteractionsColors.electronColorProperty, lineWidth: 1.5 });
    const symbol = (text: string, fill: typeof PhotonInteractionsColors.textColorProperty): Text =>
      new Text(text, { font: FONTS.BIG_LABEL, fill });
    const thetaLabel = symbol("θ", PhotonInteractionsColors.scatteredPhotonColorProperty);
    const phiLabel = symbol("φ", PhotonInteractionsColors.electronColorProperty);
    const incidentLabel = symbol("λ", PhotonInteractionsColors.photonColorProperty);
    incidentLabel.centerX = ORIGIN.x - INCIDENT_LENGTH / 2 - 12;
    incidentLabel.bottom = ORIGIN.y - 12;
    const scatteredLabel = symbol("λ′", PhotonInteractionsColors.scatteredPhotonColorProperty);
    const electronLabel = symbol("e⁻", PhotonInteractionsColors.electronColorProperty);

    const caption = (
      textProperty: typeof strings.incidentPhotonStringProperty,
      fill: typeof PhotonInteractionsColors.textColorProperty,
    ): Text => new Text(textProperty, { font: FONTS.TICK_LABEL, fill, maxWidth: 130 });
    const incidentCaption = caption(strings.incidentPhotonStringProperty, PhotonInteractionsColors.photonColorProperty);
    const placeIncidentCaption = (): void => {
      incidentCaption.centerX = incidentLabel.centerX;
      incidentCaption.top = ORIGIN.y + 12;
    };
    incidentCaption.localBoundsProperty.lazyLink(placeIncidentCaption);
    placeIncidentCaption();

    // The detector: a small crystal facing the electron, dragged around the arc.
    const detector = new Rectangle(-7, -13, 14, 26, {
      fill: PhotonInteractionsColors.apparatusFillColorProperty,
      stroke: PhotonInteractionsColors.scatteredPhotonColorProperty,
      lineWidth: 2,
      cornerRadius: 3,
      cursor: "pointer",
    });
    // A generous invisible target, so a finger can grab it.
    detector.touchArea = detector.localBounds.dilated(12);
    detector.mouseArea = detector.localBounds.dilated(6);
    detector.addInputListener(
      new DragListener({
        drag: (event) => {
          const point = this.globalToLocalPoint(event.pointer.point);
          const dx = point.x - ORIGIN.x;
          const dy = ORIGIN.y - point.y;
          // Below the beam axis the nearest allowed angle is whichever end is closer.
          const degrees = dy >= 0 ? (Math.atan2(dy, dx) * 180) / Math.PI : dx >= 0 ? 0 : 180;
          model.angleDegreesProperty.value = Math.round(
            Math.max(COMPTON.ANGLE_MIN_DEG, Math.min(COMPTON.ANGLE_MAX_DEG, degrees)),
          );
        },
      }),
    );

    Multilink.multilink(
      [
        model.thetaProperty,
        model.recoilAngleProperty,
        model.energyProperty,
        model.scatteredEnergyProperty,
        model.recoilKineticProperty,
      ],
      (theta, phi, energy, scatteredEnergy, kinetic) => {
        // View y points down, so a positive (counter-clockwise) angle is −θ on screen.
        const direction = new Vector2(Math.cos(theta), -Math.sin(theta));
        const wiggle = Math.min(MAX_WIGGLE_PX, (INCIDENT_WIGGLE_PX * energy) / scatteredEnergy);
        scattered.setArrow(
          ORIGIN.plus(direction.timesScalar(12)),
          ORIGIN.plus(direction.timesScalar(12 + SCATTERED_LENGTH)),
          wiggle,
        );
        detector.center = ORIGIN.plus(direction.timesScalar(DETECTOR_RADIUS));
        detector.rotation = -theta;
        scatteredLabel.center = ORIGIN.plus(direction.timesScalar(DETECTOR_RADIUS + 26));

        // The electron's arrow grows with the square root of the fraction of energy it takes,
        // so the X-ray case (1%) is still visible beside the gamma-ray case (70%).
        const length = ELECTRON_ARROW_MIN + (ELECTRON_ARROW_MAX - ELECTRON_ARROW_MIN) * Math.sqrt(kinetic / energy);
        const recoil = new Vector2(Math.cos(phi), Math.sin(phi));
        const moving = theta > 1e-6;
        electronArrow.visible = moving;
        electronLabel.visible = moving;
        phiArc.visible = moving;
        phiLabel.visible = moving;
        thetaArc.visible = moving;
        thetaLabel.visible = moving;
        if (moving) {
          const tip = ORIGIN.plus(recoil.timesScalar(8 + length));
          electronArrow.setTailAndTip(ORIGIN.x + recoil.x * 8, ORIGIN.y + recoil.y * 8, tip.x, tip.y);
          electronLabel.center = ORIGIN.plus(recoil.timesScalar(8 + length + 16));
          thetaArc.shape = Shape.arc(ORIGIN.x, ORIGIN.y, THETA_ARC_RADIUS, 0, -theta, true);
          phiArc.shape = Shape.arc(ORIGIN.x, ORIGIN.y, PHI_ARC_RADIUS, 0, phi, false);
          thetaLabel.center = ORIGIN.plus(Vector2.createPolar(THETA_ARC_RADIUS + 13, -theta / 2));
          // Between the axis and the arrow when there is room; just past the arrow when φ is small.
          phiLabel.center = ORIGIN.plus(
            phi > 0.6
              ? Vector2.createPolar(PHI_ARC_RADIUS + 13, phi / 2)
              : Vector2.createPolar(PHI_ARC_RADIUS + 16, phi + 0.38),
          );
        }
      },
    );

    this.children = [
      frame,
      title,
      axis,
      detectorTrack,
      thetaArc,
      phiArc,
      incident,
      scattered,
      electronArrow,
      electron,
      incidentLabel,
      incidentCaption,
      scatteredLabel,
      electronLabel,
      thetaLabel,
      phiLabel,
      detector,
    ];
    // Clip to the frame: a label near the edge must not overhang the neighbouring panel.
    this.clipArea = Shape.roundRect(0, 0, COLLISION_WIDTH, COLLISION_HEIGHT, 6, 6);
  }
}
