/**
 * PairEventNode.ts
 *
 * One event, replayed: a photon arrives from the left; if a pair can be made, an
 * electron and a positron leave the nucleus. With the magnetic field on, the two
 * tracks curl in opposite directions and tighten as the particles lose energy,
 * the signature of pair production in a bubble-chamber photograph. The initial
 * radius of each track is to scale: r = p/(eB).
 *
 * If no pair can be made (too little energy, or no nucleus to take momentum),
 * the photon carries straight on.
 */

import { Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Circle, Node, Path, Rectangle, Text } from "scenerystack/scenery";
import type { FourMomentum } from "../../common/model/fourMomentum.js";
import { PhotonArrowNode } from "../../common/view/PhotonArrowNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import PhotonInteractionsColors from "../../PhotonInteractionsColors.js";
import { FONTS, PAIR } from "../../PhotonInteractionsConstants.js";
import type { PairProductionModel, PairStatus } from "../model/PairProductionModel.js";
import { trackRadiusMm } from "../model/pairProduction.js";

export const EVENT_WIDTH = 420;
export const EVENT_HEIGHT = 300;

const VERTEX = new Vector2(150, 160);
const PHOTON_START_X = 12;
/** Fraction of the animation the photon spends arriving. */
const ARRIVAL = 0.3;
const PIXELS_PER_MM = 7;
const STRAIGHT_TRACK_LENGTH = 230;
const MAX_TRACK_LENGTH = 420;
const TRACK_STEP = 1.5;
const PHOTON_WIGGLE_PX = 12;

/**
 * A track leaving the vertex at `angle` (radians, counter-clockwise on screen being
 * negative because y points down). `curvature` is +1 or −1 for the sense of
 * rotation, 0 for a straight line. `radius` is the initial radius in pixels; it
 * shrinks linearly to a small fraction over two turns' worth of path.
 */
const trackShape = (angle: number, radius: number, curvature: number, length: number): Shape => {
  const shape = new Shape().moveToPoint(VERTEX);
  let x = VERTEX.x;
  let y = VERTEX.y;
  let heading = angle;
  const range = 4 * Math.PI * radius;
  for (let s = 0; s < length; s += TRACK_STEP) {
    x += TRACK_STEP * Math.cos(heading);
    y += TRACK_STEP * Math.sin(heading);
    shape.lineTo(x, y);
    if (curvature !== 0) {
      const r = radius * Math.max(0.06, 1 - s / range);
      heading += (curvature * TRACK_STEP) / r;
    }
  }
  return shape;
};

export class PairEventNode extends Node {
  public constructor(model: PairProductionModel) {
    super();
    const strings = StringManager.getInstance().getPairProductionStrings();

    const frame = new Rectangle(0, 0, EVENT_WIDTH, EVENT_HEIGHT, {
      fill: PhotonInteractionsColors.chartBackgroundColorProperty,
      stroke: PhotonInteractionsColors.panelBorderColorProperty,
      cornerRadius: 6,
    });
    const title = new Text(strings.eventTitleStringProperty, {
      font: FONTS.CHART_TITLE,
      fill: PhotonInteractionsColors.textColorProperty,
      maxWidth: 90,
      left: 10,
      top: 8,
    });
    const statusText = new Text("", { font: FONTS.CHART_TITLE, maxWidth: EVENT_WIDTH - 120 });
    const statusStrings: Record<PairStatus, TReadOnlyProperty<string>> = {
      below: strings.status.belowStringProperty,
      allowed: strings.status.allowedStringProperty,
      forbidden: strings.status.forbiddenStringProperty,
    };
    Multilink.multilink([model.statusProperty, ...Object.values(statusStrings)] as const, (status) => {
      statusText.string = statusStrings[status].value;
      statusText.fill =
        status === "allowed"
          ? PhotonInteractionsColors.restEnergyColorProperty
          : PhotonInteractionsColors.limitColorProperty;
      statusText.right = EVENT_WIDTH - 10;
      statusText.top = 8;
    });

    const nucleus = new Circle(9, { fill: PhotonInteractionsColors.nucleusColorProperty, center: VERTEX });
    const nucleusLabel = new Text("", {
      font: FONTS.PARTICLE_LABEL,
      fill: PhotonInteractionsColors.nucleusColorProperty,
    });
    model.surroundingsProperty.link((surroundings) => {
      nucleus.visible = surroundings !== "vacuum";
      nucleusLabel.visible = nucleus.visible;
      nucleusLabel.string = surroundings === "lead" ? "Pb" : "C";
      nucleusLabel.centerX = VERTEX.x - 4;
      nucleusLabel.top = VERTEX.y + 13;
    });

    const fieldLabel = new Text(strings.fieldLabelStringProperty, {
      font: FONTS.TICK_LABEL,
      fill: PhotonInteractionsColors.secondaryTextColorProperty,
      maxWidth: 160,
      visibleProperty: model.fieldOnProperty,
    });
    const fieldSymbol = new Text("⊙", {
      font: FONTS.BIG_LABEL,
      fill: PhotonInteractionsColors.secondaryTextColorProperty,
      visibleProperty: model.fieldOnProperty,
      left: 10,
      bottom: EVENT_HEIGHT - 8,
    });
    const placeFieldLabel = (): void => {
      fieldLabel.left = fieldSymbol.right + 5;
      fieldLabel.centerY = fieldSymbol.centerY;
    };
    fieldLabel.localBoundsProperty.lazyLink(placeFieldLabel);
    placeFieldLabel();

    const photon = new PhotonArrowNode(PhotonInteractionsColors.photonColorProperty);
    const photonLabel = new Text("γ", { font: FONTS.BIG_LABEL, fill: PhotonInteractionsColors.photonColorProperty });
    photonLabel.centerX = 40;
    photonLabel.bottom = VERTEX.y - 12;
    const track = (stroke: typeof PhotonInteractionsColors.electronColorProperty): Path =>
      new Path(null, { stroke, lineWidth: 2.5, lineCap: "round" });
    const electronTrack = track(PhotonInteractionsColors.electronColorProperty);
    const positronTrack = track(PhotonInteractionsColors.positronColorProperty);
    const particleLabel = (text: string, fill: typeof PhotonInteractionsColors.electronColorProperty): Text =>
      new Text(text, { font: FONTS.BIG_LABEL, fill });
    const electronLabel = particleLabel("e⁻", PhotonInteractionsColors.electronColorProperty);
    const positronLabel = particleLabel("e⁺", PhotonInteractionsColors.positronColorProperty);

    Multilink.multilink([model.phaseProperty, model.eventProperty, model.fieldOnProperty], (phase, event, fieldOn) => {
      const arriving = phase < ARRIVAL;
      const progress = arriving ? 0 : (phase - ARRIVAL) / (1 - ARRIVAL);
      // The photon: on its way in, then (if nothing happens to it) on its way out.
      const tail = new Vector2(PHOTON_START_X, VERTEX.y);
      if (arriving) {
        const reach = PHOTON_START_X + (VERTEX.x - 14 - PHOTON_START_X) * (phase / ARRIVAL);
        photon.setArrow(tail, new Vector2(reach, VERTEX.y), PHOTON_WIGGLE_PX);
        photon.visible = true;
      } else if (event) {
        photon.visible = false;
      } else {
        const reach = VERTEX.x - 14 + (EVENT_WIDTH - 20 - VERTEX.x) * Math.min(1, 1.4 * progress);
        photon.setArrow(tail, new Vector2(reach, VERTEX.y), PHOTON_WIGGLE_PX);
        photon.visible = true;
      }

      const showTracks = event !== null && !arriving;
      electronTrack.visible = showTracks;
      positronTrack.visible = showTracks;
      electronLabel.visible = showTracks;
      positronLabel.visible = showTracks;
      if (event && showTracks) {
        const draw = (path: Path, label: Text, particle: FourMomentum, sense: number): void => {
          // Screen y points down: a momentum above the axis is drawn at a negative angle.
          const angle = -particle.angle;
          const radius = Math.max(1.5, PIXELS_PER_MM * trackRadiusMm(particle.momentumMagnitude, PAIR.FIELD_T));
          const fullLength = fieldOn ? Math.min(MAX_TRACK_LENGTH, 0.85 * 4 * Math.PI * radius) : STRAIGHT_TRACK_LENGTH;
          path.shape = trackShape(angle, radius, fieldOn ? sense : 0, fullLength * Math.min(1, 1.6 * progress));
          label.center = VERTEX.plus(Vector2.createPolar(34, angle + sense * 0.55));
        };
        // B out of the screen: the positron (below the axis) curls further down, the electron up.
        draw(electronTrack, electronLabel, event.electron, -1);
        draw(positronTrack, positronLabel, event.positron, 1);
      }
    });

    this.children = [
      frame,
      photon,
      electronTrack,
      positronTrack,
      nucleus,
      nucleusLabel,
      photonLabel,
      electronLabel,
      positronLabel,
      fieldSymbol,
      fieldLabel,
      title,
      statusText,
    ];
    this.clipArea = Shape.roundRect(0, 0, EVENT_WIDTH, EVENT_HEIGHT, 6, 6);
  }
}
