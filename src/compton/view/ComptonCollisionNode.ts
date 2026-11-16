import { COMPTON_COLLISION_NODE_SETTINGS } from "../../PhotonInteractionsConstants.js";
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

export const COLLISION_WIDTH: number = COMPTON_COLLISION_NODE_SETTINGS.COLLISION_WIDTH;
const COLLISION_HEIGHT: number = COMPTON_COLLISION_NODE_SETTINGS.COLLISION_HEIGHT;

const ORIGIN = new Vector2(COMPTON_COLLISION_NODE_SETTINGS.ORIGIN_X, COMPTON_COLLISION_NODE_SETTINGS.ORIGIN_Y);
const INCIDENT_LENGTH: number = COMPTON_COLLISION_NODE_SETTINGS.INCIDENT_LENGTH;
const SCATTERED_LENGTH: number = COMPTON_COLLISION_NODE_SETTINGS.SCATTERED_LENGTH;
const DETECTOR_RADIUS: number = COMPTON_COLLISION_NODE_SETTINGS.DETECTOR_RADIUS;
const THETA_ARC_RADIUS: number = COMPTON_COLLISION_NODE_SETTINGS.THETA_ARC_RADIUS;
const PHI_ARC_RADIUS: number = COMPTON_COLLISION_NODE_SETTINGS.PHI_ARC_RADIUS;
const INCIDENT_WIGGLE_PX: number = COMPTON_COLLISION_NODE_SETTINGS.INCIDENT_WIGGLE_PX;
const MAX_WIGGLE_PX: number = COMPTON_COLLISION_NODE_SETTINGS.MAX_WIGGLE_PX;
const ELECTRON_ARROW_MIN: number = COMPTON_COLLISION_NODE_SETTINGS.ELECTRON_ARROW_MIN;
const ELECTRON_ARROW_MAX: number = COMPTON_COLLISION_NODE_SETTINGS.ELECTRON_ARROW_MAX;

export class ComptonCollisionNode extends Node {
  public constructor(model: ComptonModel) {
    super();
    const strings = StringManager.getInstance().getComptonStrings();

    const frame = new Rectangle(0, 0, COLLISION_WIDTH, COLLISION_HEIGHT, {
      fill: PhotonInteractionsColors.chartBackgroundColorProperty,
      stroke: PhotonInteractionsColors.panelBorderColorProperty,
      cornerRadius: COMPTON_COLLISION_NODE_SETTINGS.FRAME_CORNER_RADIUS,
    });
    const title = new Text(strings.collisionTitleStringProperty, {
      font: FONTS.CHART_TITLE,
      fill: PhotonInteractionsColors.textColorProperty,
      maxWidth: COLLISION_WIDTH - COMPTON_COLLISION_NODE_SETTINGS.TITLE_MAX_WIDTH_OFFSET,
      left: COMPTON_COLLISION_NODE_SETTINGS.TITLE_LEFT,
      top: COMPTON_COLLISION_NODE_SETTINGS.TITLE_TOP,
    });

    // Beam axis, continued past the electron as a dashed reference for both angles.
    const axis = new Line(ORIGIN.x, ORIGIN.y, COLLISION_WIDTH - 12, ORIGIN.y, {
      stroke: PhotonInteractionsColors.secondaryTextColorProperty,
      lineDash: [
        COMPTON_COLLISION_NODE_SETTINGS.AXIS_LINE_DASH_DASH,
        COMPTON_COLLISION_NODE_SETTINGS.AXIS_LINE_DASH_DASH,
      ],
    });
    // The arc the detector rides on.
    const detectorTrack = new Path(Shape.arc(ORIGIN.x, ORIGIN.y, DETECTOR_RADIUS, 0, Math.PI, true), {
      stroke: PhotonInteractionsColors.chartGridColorProperty,
      lineWidth: COMPTON_COLLISION_NODE_SETTINGS.DETECTOR_TRACK_LINE_WIDTH,
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
      tailWidth: COMPTON_COLLISION_NODE_SETTINGS.ELECTRON_ARROW_TAIL_WIDTH,
      headWidth: COMPTON_COLLISION_NODE_SETTINGS.ELECTRON_ARROW_HEAD_WIDTH,
      headHeight: COMPTON_COLLISION_NODE_SETTINGS.ELECTRON_ARROW_HEAD_HEIGHT,
    });
    const electron = new Circle(COMPTON_COLLISION_NODE_SETTINGS.ELECTRON_RADIUS, {
      fill: PhotonInteractionsColors.electronColorProperty,
      center: ORIGIN,
    });

    const thetaArc = new Path(null, {
      stroke: PhotonInteractionsColors.scatteredPhotonColorProperty,
      lineWidth: COMPTON_COLLISION_NODE_SETTINGS.THETA_ARC_LINE_WIDTH,
    });
    const phiArc = new Path(null, {
      stroke: PhotonInteractionsColors.electronColorProperty,
      lineWidth: COMPTON_COLLISION_NODE_SETTINGS.PHI_ARC_LINE_WIDTH,
    });
    const symbol = (text: string, fill: typeof PhotonInteractionsColors.textColorProperty): Text =>
      new Text(text, { font: FONTS.BIG_LABEL, fill });
    const thetaLabel = symbol("θ", PhotonInteractionsColors.scatteredPhotonColorProperty);
    const phiLabel = symbol("φ", PhotonInteractionsColors.electronColorProperty);
    const incidentLabel = symbol("λ", PhotonInteractionsColors.photonColorProperty);
    incidentLabel.centerX =
      ORIGIN.x - INCIDENT_LENGTH / 2 - COMPTON_COLLISION_NODE_SETTINGS.CONSTRUCTOR_CENTER_X_OFFSET;
    incidentLabel.bottom = ORIGIN.y - COMPTON_COLLISION_NODE_SETTINGS.CONSTRUCTOR_BOTTOM_OFFSET;
    const scatteredLabel = symbol("λ′", PhotonInteractionsColors.scatteredPhotonColorProperty);
    const electronLabel = symbol("e⁻", PhotonInteractionsColors.electronColorProperty);

    const caption = (
      textProperty: typeof strings.incidentPhotonStringProperty,
      fill: typeof PhotonInteractionsColors.textColorProperty,
    ): Text =>
      new Text(textProperty, {
        font: FONTS.TICK_LABEL,
        fill,
        maxWidth: COMPTON_COLLISION_NODE_SETTINGS.CAPTION_MAX_WIDTH,
      });
    const incidentCaption = caption(strings.incidentPhotonStringProperty, PhotonInteractionsColors.photonColorProperty);
    const placeIncidentCaption = (): void => {
      incidentCaption.centerX = incidentLabel.centerX;
      incidentCaption.top = ORIGIN.y + COMPTON_COLLISION_NODE_SETTINGS.PLACE_INCIDENT_CAPTION_TOP_OFFSET;
    };
    incidentCaption.localBoundsProperty.lazyLink(placeIncidentCaption);
    placeIncidentCaption();

    // The detector: a small crystal facing the electron, dragged around the arc.
    const detector = new Rectangle(
      COMPTON_COLLISION_NODE_SETTINGS.DETECTOR_X,
      COMPTON_COLLISION_NODE_SETTINGS.DETECTOR_Y,
      COMPTON_COLLISION_NODE_SETTINGS.DETECTOR_WIDTH,
      COMPTON_COLLISION_NODE_SETTINGS.DETECTOR_HEIGHT,
      {
        fill: PhotonInteractionsColors.apparatusFillColorProperty,
        stroke: PhotonInteractionsColors.scatteredPhotonColorProperty,
        lineWidth: COMPTON_COLLISION_NODE_SETTINGS.DETECTOR_LINE_WIDTH,
        cornerRadius: COMPTON_COLLISION_NODE_SETTINGS.DETECTOR_CORNER_RADIUS,
        cursor: "pointer",
      },
    );
    // A generous invisible target, so a finger can grab it.
    detector.touchArea = detector.localBounds.dilated(COMPTON_COLLISION_NODE_SETTINGS.DETECTOR_DILATION);
    detector.mouseArea = detector.localBounds.dilated(COMPTON_COLLISION_NODE_SETTINGS.DETECTOR_DILATION_SEGMENT_2);
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
    this.clipArea = Shape.roundRect(
      0,
      0,
      COLLISION_WIDTH,
      COLLISION_HEIGHT,
      COMPTON_COLLISION_NODE_SETTINGS.CLIP_AREA_CORNER_X,
      COMPTON_COLLISION_NODE_SETTINGS.CLIP_AREA_CORNER_Y,
    );
  }
}
