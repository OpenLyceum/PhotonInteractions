/**
 * PetRingNode.ts
 *
 * A PET scanner seen along its axis: a ring of detectors around a positron-
 * emitting tracer. Every annihilation fires two detectors on opposite sides of
 * the tracer; the line between them is a "line of response". The lines pile up
 * where the tracer is, which is how the scanner finds it.
 *
 * The tracer can be dragged (pointer or arrow keys) and hidden, so the lines can
 * be used to find it.
 */

import { Multilink } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { ModelViewTransform2, StringUtils } from "scenerystack/phetcommon";
import { Circle, InteractiveHighlighting, Node, Path, Rectangle, RichDragListener } from "scenerystack/scenery";
import { formatTickValue } from "../../common/view/chartUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import PhotonInteractionsColors from "../../PhotonInteractionsColors.js";
import { ANNIHILATION } from "../../PhotonInteractionsConstants.js";
import type { AnnihilationModel } from "../model/AnnihilationModel.js";
import { detectorPosition } from "../model/petRing.js";

/** Ring radius on screen, px. */
export const RING_RADIUS_PX = 104;
const DETECTOR_DEPTH = 12;
const TRACER_RADIUS = 8;
const KEYBOARD_STEP_CM = 2;

class Handle extends InteractiveHighlighting(Circle) {}

export class PetRingNode extends Node {
  public readonly tracer: Node;

  public constructor(model: AnnihilationModel) {
    super();
    const a11y = StringManager.getInstance().getAnnihilationA11yStrings().controls;

    // Model (cm, y up, origin at the ring's centre) to view (px, y down).
    const transform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO,
      Vector2.ZERO,
      RING_RADIUS_PX / ANNIHILATION.RING_RADIUS_CM,
    );

    const bore = new Circle(RING_RADIUS_PX, {
      fill: PhotonInteractionsColors.chartBackgroundColorProperty,
      stroke: PhotonInteractionsColors.chartGridColorProperty,
    });

    // Detectors: crystals just outside the bore, each facing the centre.
    const count = ANNIHILATION.DETECTOR_COUNT;
    const width = ((2 * Math.PI * RING_RADIUS_PX) / count) * 0.8;
    const detectors: Rectangle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count;
      const detector = new Rectangle(0, -width / 2, DETECTOR_DEPTH, width, {
        fill: PhotonInteractionsColors.apparatusFillColorProperty,
        stroke: PhotonInteractionsColors.apparatusColorProperty,
        lineWidth: 1,
      });
      // The view angle is the negative of the model angle because y is inverted.
      detector.rotation = -angle;
      detector.translation = transform.modelToViewPosition(detectorPosition(i, count, ANNIHILATION.RING_RADIUS_CM));
      detectors.push(detector);
    }

    const lines = new Path(null, {
      stroke: PhotonInteractionsColors.photonColorProperty,
      lineWidth: 1,
      opacity: 0.45,
    });
    const latest = new Path(null, { stroke: PhotonInteractionsColors.scatteredPhotonColorProperty, lineWidth: 2 });

    const tracer = new Handle(TRACER_RADIUS, {
      fill: PhotonInteractionsColors.positronColorProperty,
      stroke: PhotonInteractionsColors.backgroundColorProperty,
      cursor: "pointer",
      tagName: "div",
      focusable: true,
      ariaRole: "application",
      accessibleName: a11y.tracerStringProperty,
      accessibleHelpText: a11y.tracerHelpStringProperty,
      visibleProperty: model.showTracerProperty,
    });
    tracer.touchArea = tracer.localBounds.dilated(10);
    this.tracer = tracer;

    const clampToDisk = (position: Vector2): Vector2 =>
      position.magnitude > ANNIHILATION.SOURCE_MAX_RADIUS_CM
        ? position.withMagnitude(ANNIHILATION.SOURCE_MAX_RADIUS_CM)
        : position;
    // Spoken when a drag ends, not on every step: rewriting a focused element's
    // description mid-drag drops keyboard focus.
    let positionResponse = "";
    tracer.addInputListener(
      new RichDragListener({
        positionProperty: model.tracerPositionProperty,
        transform,
        mapPosition: clampToDisk,
        keyboardDragListenerOptions: {
          dragDelta: transform.modelToViewDeltaX(KEYBOARD_STEP_CM),
          shiftDragDelta: transform.modelToViewDeltaX(KEYBOARD_STEP_CM / 4),
        },
        end: () => tracer.addAccessibleObjectResponse(positionResponse),
      }),
    );
    Multilink.multilink([model.tracerPositionProperty, a11y.tracerValuePatternStringProperty], (position, pattern) => {
      tracer.center = transform.modelToViewPosition(position);
      positionResponse = StringUtils.fillIn(pattern, {
        x: formatTickValue(position.x, 0),
        y: formatTickValue(position.y, 0),
      });
    });

    let fired: Rectangle[] = [];
    model.linesChangedEmitter.addListener(() => {
      const shape = new Shape();
      for (const line of model.lines) {
        const a = transform.modelToViewPosition(line.a);
        const b = transform.modelToViewPosition(line.b);
        shape.moveToPoint(a).lineToPoint(b);
      }
      lines.shape = shape;

      for (const detector of fired) {
        detector.fill = PhotonInteractionsColors.apparatusFillColorProperty;
      }
      fired = [];
      const last = model.lines[model.lines.length - 1];
      if (last) {
        latest.shape = Shape.lineSegment(transform.modelToViewPosition(last.a), transform.modelToViewPosition(last.b));
        for (const index of [last.indexA, last.indexB]) {
          const detector = detectors[index];
          if (detector) {
            detector.fill = PhotonInteractionsColors.scatteredPhotonColorProperty;
            fired.push(detector);
          }
        }
      } else {
        latest.shape = null;
      }
    });

    this.children = [bore, ...detectors, lines, latest, tracer];
  }
}
