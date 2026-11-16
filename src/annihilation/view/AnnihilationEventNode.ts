import { ANNIHILATION_EVENT_NODE_SETTINGS } from "../../PhotonInteractionsConstants.js";
/**
 * AnnihilationEventNode.ts
 *
 * The annihilation in the lab: a positron arrives from the left (or sits at rest
 * beside the electron) and two photons leave. Each photon's arrow length and
 * wiggle follow its energy, so the forward photon of an in-flight annihilation
 * is visibly the more energetic.
 *
 * With "try a single photon" on, the two photons are replaced by the one photon
 * that energy conservation alone would allow, and two bars show why it cannot
 * happen: that photon would carry momentum E/c, and the pair only brings p.
 */

import { Multilink } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { StringUtils } from "scenerystack/phetcommon";
import { Circle, Line, Node, Rectangle, Text } from "scenerystack/scenery";
import { ArrowNode } from "scenerystack/scenery-phet";
import { formatEnergy } from "../../common/view/chartUtils.js";
import { PhotonArrowNode } from "../../common/view/PhotonArrowNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import PhotonInteractionsColors from "../../PhotonInteractionsColors.js";
import { ANNIHILATION, FONTS, PHYSICS } from "../../PhotonInteractionsConstants.js";
import type { AnnihilationModel } from "../model/AnnihilationModel.js";

const EVENT_WIDTH: number = ANNIHILATION_EVENT_NODE_SETTINGS.EVENT_WIDTH;
const EVENT_HEIGHT: number = ANNIHILATION_EVENT_NODE_SETTINGS.EVENT_HEIGHT;

const VERTEX = new Vector2(ANNIHILATION_EVENT_NODE_SETTINGS.VERTEX_X, ANNIHILATION_EVENT_NODE_SETTINGS.VERTEX_Y);
const PHOTON_MIN_LENGTH: number = ANNIHILATION_EVENT_NODE_SETTINGS.PHOTON_MIN_LENGTH;
const PHOTON_LENGTH_RANGE: number = ANNIHILATION_EVENT_NODE_SETTINGS.PHOTON_LENGTH_RANGE;
/** Drawn wiggle of a 511 keV photon, px; others scale with wavelength. */
const REST_WIGGLE_PX: number = ANNIHILATION_EVENT_NODE_SETTINGS.REST_WIGGLE_PX;
const POSITRON_MIN_LENGTH: number = ANNIHILATION_EVENT_NODE_SETTINGS.POSITRON_MIN_LENGTH;
const POSITRON_LENGTH_RANGE: number = ANNIHILATION_EVENT_NODE_SETTINGS.POSITRON_LENGTH_RANGE;
const BAR_LEFT: number = ANNIHILATION_EVENT_NODE_SETTINGS.BAR_LEFT;
const BAR_WIDTH: number = ANNIHILATION_EVENT_NODE_SETTINGS.BAR_WIDTH;
const BAR_HEIGHT: number = ANNIHILATION_EVENT_NODE_SETTINGS.BAR_HEIGHT;

export class AnnihilationEventNode extends Node {
  public constructor(model: AnnihilationModel) {
    super();
    const strings = StringManager.getInstance().getAnnihilationStrings();

    const frame = new Rectangle(0, 0, EVENT_WIDTH, EVENT_HEIGHT, {
      fill: PhotonInteractionsColors.chartBackgroundColorProperty,
      stroke: PhotonInteractionsColors.panelBorderColorProperty,
      cornerRadius: ANNIHILATION_EVENT_NODE_SETTINGS.FRAME_CORNER_RADIUS,
    });
    const title = new Text(strings.eventTitleStringProperty, {
      font: FONTS.CHART_TITLE,
      fill: PhotonInteractionsColors.textColorProperty,
      maxWidth: EVENT_WIDTH - ANNIHILATION_EVENT_NODE_SETTINGS.TITLE_MAX_WIDTH_OFFSET,
      left: ANNIHILATION_EVENT_NODE_SETTINGS.TITLE_LEFT,
      top: ANNIHILATION_EVENT_NODE_SETTINGS.TITLE_TOP,
    });
    const axis = new Line(ANNIHILATION_EVENT_NODE_SETTINGS.AXIS_START_X, VERTEX.y, EVENT_WIDTH - 12, VERTEX.y, {
      stroke: PhotonInteractionsColors.secondaryTextColorProperty,
      lineDash: [
        ANNIHILATION_EVENT_NODE_SETTINGS.AXIS_LINE_DASH_DASH,
        ANNIHILATION_EVENT_NODE_SETTINGS.AXIS_LINE_DASH_DASH,
      ],
    });

    const electron = new Circle(ANNIHILATION_EVENT_NODE_SETTINGS.ELECTRON_RADIUS, {
      fill: PhotonInteractionsColors.electronColorProperty,
    });
    const positron = new Circle(ANNIHILATION_EVENT_NODE_SETTINGS.POSITRON_RADIUS, {
      fill: PhotonInteractionsColors.positronColorProperty,
    });
    const positronArrow = new ArrowNode(0, 0, 1, 0, {
      fill: PhotonInteractionsColors.positronColorProperty,
      stroke: null,
      tailWidth: ANNIHILATION_EVENT_NODE_SETTINGS.POSITRON_ARROW_TAIL_WIDTH,
      headWidth: ANNIHILATION_EVENT_NODE_SETTINGS.POSITRON_ARROW_HEAD_WIDTH,
      headHeight: ANNIHILATION_EVENT_NODE_SETTINGS.POSITRON_ARROW_HEAD_HEIGHT,
    });
    const label = (text: string, fill: typeof PhotonInteractionsColors.textColorProperty): Text =>
      new Text(text, { font: FONTS.BIG_LABEL, fill });
    const electronLabel = label("e⁻", PhotonInteractionsColors.electronColorProperty);
    const positronLabel = label("e⁺", PhotonInteractionsColors.positronColorProperty);

    const photon1 = new PhotonArrowNode(PhotonInteractionsColors.photonColorProperty);
    const photon2 = new PhotonArrowNode(PhotonInteractionsColors.scatteredPhotonColorProperty);
    const photon1Label = label("γ₁", PhotonInteractionsColors.photonColorProperty);
    const photon2Label = label("γ₂", PhotonInteractionsColors.scatteredPhotonColorProperty);
    const single = new PhotonArrowNode(PhotonInteractionsColors.limitColorProperty);
    const singleLabel = label("γ ?", PhotonInteractionsColors.limitColorProperty);

    // ── Single-photon momentum check ────────────────────────────────────────────
    const NEEDS_Y: number = ANNIHILATION_EVENT_NODE_SETTINGS.NEEDS_Y;
    const HAS_Y: number = ANNIHILATION_EVENT_NODE_SETTINGS.HAS_Y;
    const rowLabel = (textProperty: typeof strings.onePhotonNeedsStringProperty, centerY: number): Text => {
      const text = new Text(textProperty, {
        font: FONTS.TICK_LABEL,
        fill: PhotonInteractionsColors.secondaryTextColorProperty,
        maxWidth: BAR_LEFT - ANNIHILATION_EVENT_NODE_SETTINGS.TEXT_MAX_WIDTH_OFFSET,
      });
      const place = (): void => {
        text.right = BAR_LEFT - ANNIHILATION_EVENT_NODE_SETTINGS.PLACE_RIGHT_OFFSET;
        text.centerY = centerY;
      };
      text.localBoundsProperty.lazyLink(place);
      place();
      return text;
    };
    const needsBar = new Rectangle(BAR_LEFT, NEEDS_Y - BAR_HEIGHT / 2, 0, BAR_HEIGHT, {
      fill: PhotonInteractionsColors.limitColorProperty,
    });
    const hasBar = new Rectangle(BAR_LEFT, HAS_Y - BAR_HEIGHT / 2, 0, BAR_HEIGHT, {
      fill: PhotonInteractionsColors.positronColorProperty,
    });
    const needsValue = new Text("", { font: FONTS.TICK_LABEL, fill: PhotonInteractionsColors.limitColorProperty });
    const hasValue = new Text("", { font: FONTS.TICK_LABEL, fill: PhotonInteractionsColors.positronColorProperty });
    const verdict = new Text("", {
      font: FONTS.READOUT_VALUE,
      fill: PhotonInteractionsColors.limitColorProperty,
      maxWidth: EVENT_WIDTH - ANNIHILATION_EVENT_NODE_SETTINGS.VERDICT_MAX_WIDTH_OFFSET,
      left: ANNIHILATION_EVENT_NODE_SETTINGS.VERDICT_LEFT,
    });
    const onePhotonLayer = new Node({
      children: [
        new Text(strings.onePhotonTitleStringProperty, {
          font: FONTS.CHART_TITLE,
          fill: PhotonInteractionsColors.textColorProperty,
          maxWidth: EVENT_WIDTH - ANNIHILATION_EVENT_NODE_SETTINGS.ONE_PHOTON_LAYER_MAX_WIDTH_OFFSET,
          left: ANNIHILATION_EVENT_NODE_SETTINGS.ONE_PHOTON_LAYER_LEFT,
          top: ANNIHILATION_EVENT_NODE_SETTINGS.ONE_PHOTON_LAYER_TOP,
        }),
        rowLabel(strings.onePhotonNeedsStringProperty, NEEDS_Y),
        rowLabel(strings.onePhotonHasStringProperty, HAS_Y),
        needsBar,
        hasBar,
        needsValue,
        hasValue,
        verdict,
        single,
        singleLabel,
      ],
      visibleProperty: model.onePhotonProperty,
    });

    Multilink.multilink(
      [
        model.kineticProperty,
        model.photonsProperty,
        model.totalProperty,
        model.deficitProperty,
        model.onePhotonProperty,
        strings.onePhotonForbiddenPatternStringProperty,
      ],
      (kinetic, [first, second], total, deficit, onePhoton, forbiddenPattern) => {
        // Incoming particles: a positron at rest sits beside the electron; one in flight arrives along an arrow.
        const atRest = kinetic === 0;
        positronArrow.visible = !atRest;
        positron.visible = atRest;
        electron.center = atRest ? VERTEX.plusXY(ANNIHILATION_EVENT_NODE_SETTINGS.ELECTRON_X_OFFSET, 0) : VERTEX;
        positron.center = VERTEX.plusXY(ANNIHILATION_EVENT_NODE_SETTINGS.POSITRON_X_OFFSET, 0);
        electronLabel.right = electron.centerX - ANNIHILATION_EVENT_NODE_SETTINGS.CONSTRUCTOR_RIGHT_OFFSET;
        electronLabel.top = VERTEX.y + ANNIHILATION_EVENT_NODE_SETTINGS.CONSTRUCTOR_TOP_OFFSET;
        if (atRest) {
          positronLabel.centerX = positron.centerX - ANNIHILATION_EVENT_NODE_SETTINGS.CONSTRUCTOR_CENTER_X_OFFSET;
          positronLabel.bottom = VERTEX.y - ANNIHILATION_EVENT_NODE_SETTINGS.CONSTRUCTOR_BOTTOM_OFFSET;
        } else {
          const length =
            POSITRON_MIN_LENGTH + (POSITRON_LENGTH_RANGE * kinetic) / (1000 * ANNIHILATION.KINETIC_MAX_MEV);
          positronArrow.setTailAndTip(VERTEX.x - 12 - length, VERTEX.y, VERTEX.x - 12, VERTEX.y);
          positronLabel.centerX = VERTEX.x - 12 - length / 2;
          positronLabel.bottom = VERTEX.y - ANNIHILATION_EVENT_NODE_SETTINGS.CONSTRUCTOR_BOTTOM_OFFSET;
        }

        const drawPhoton = (
          arrow: PhotonArrowNode,
          text: Text,
          energy: number,
          angle: number,
          fraction: number,
        ): void => {
          // Screen y points down.
          const direction = new Vector2(Math.cos(angle), -Math.sin(angle));
          const length = PHOTON_MIN_LENGTH + PHOTON_LENGTH_RANGE * fraction;
          const wiggle = Math.max(5, Math.min(40, (REST_WIGGLE_PX * PHYSICS.ELECTRON_REST_ENERGY_KEV) / energy));
          arrow.setArrow(
            VERTEX.plus(direction.timesScalar(16)),
            VERTEX.plus(direction.timesScalar(16 + length)),
            wiggle,
          );
          text.center = VERTEX.plus(direction.timesScalar(16 + length + 15));
        };
        photon1.visible = !onePhoton;
        photon2.visible = !onePhoton;
        photon1Label.visible = !onePhoton;
        photon2Label.visible = !onePhoton;
        if (onePhoton) {
          drawPhoton(single, singleLabel, total.energy, 0, 1);
          const scale =
            BAR_WIDTH / (1.05 * (1000 * ANNIHILATION.KINETIC_MAX_MEV + 2 * PHYSICS.ELECTRON_REST_ENERGY_KEV));
          needsBar.rectWidth = total.energy * scale;
          hasBar.rectWidth = total.px * scale;
          needsValue.string = formatEnergy(
            total.energy,
            ANNIHILATION_EVENT_NODE_SETTINGS.ENERGY_FORMAT_ENERGY_DIGITS,
            "/c",
          );
          needsValue.left = BAR_LEFT + needsBar.rectWidth + ANNIHILATION_EVENT_NODE_SETTINGS.CONSTRUCTOR_LEFT_OFFSET;
          needsValue.centerY = NEEDS_Y;
          hasValue.string = formatEnergy(total.px, ANNIHILATION_EVENT_NODE_SETTINGS.PX_FORMAT_ENERGY_DIGITS, "/c");
          hasValue.left = BAR_LEFT + hasBar.rectWidth + ANNIHILATION_EVENT_NODE_SETTINGS.CONSTRUCTOR_LEFT_OFFSET;
          hasValue.centerY = HAS_Y;
          verdict.string = StringUtils.fillIn(forbiddenPattern, {
            deficit: formatEnergy(deficit, ANNIHILATION_EVENT_NODE_SETTINGS.VERDICT_DIGITS, "/c"),
          });
          verdict.top = HAS_Y + 14;
        } else {
          drawPhoton(photon1, photon1Label, first.energy, first.angle, first.energy / total.energy);
          drawPhoton(photon2, photon2Label, second.energy, second.angle, second.energy / total.energy);
        }
      },
    );

    this.children = [
      frame,
      title,
      axis,
      photon1,
      photon2,
      positronArrow,
      electron,
      positron,
      electronLabel,
      positronLabel,
      photon1Label,
      photon2Label,
      onePhotonLayer,
    ];
    this.clipArea = Shape.roundRect(
      0,
      0,
      EVENT_WIDTH,
      EVENT_HEIGHT,
      ANNIHILATION_EVENT_NODE_SETTINGS.CLIP_AREA_CORNER_X,
      ANNIHILATION_EVENT_NODE_SETTINGS.CLIP_AREA_CORNER_Y,
    );
  }
}
