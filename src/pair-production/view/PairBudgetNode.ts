import { PAIR_BUDGET_NODE_SETTINGS } from "../../PhotonInteractionsConstants.js";
/**
 * PairBudgetNode.ts
 *
 * The two conservation laws as bars, on one scale (1 keV of energy is as long as
 * 1 keV/c of momentum).
 *
 * Energy: the photon's energy against what the pair needs. Rest energy 2mₑc²
 * comes first; whatever is left is kinetic energy, shared as the control says.
 *
 * Momentum: the photon's E/c against the most a pair of that energy can carry.
 * The pair's bar is always shorter. The gap is what the nucleus absorbs, or, in
 * empty space, what makes the process impossible.
 */

import { Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import { HBox, Node, Rectangle, Text } from "scenerystack/scenery";
import { formatEnergy } from "../../common/view/chartUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import PhotonInteractionsColors from "../../PhotonInteractionsColors.js";
import { FONTS } from "../../PhotonInteractionsConstants.js";
import type { PairProductionModel } from "../model/PairProductionModel.js";
import { PAIR_REST_ENERGY_KEV } from "../model/pairProduction.js";

const BUDGET_WIDTH: number = PAIR_BUDGET_NODE_SETTINGS.BUDGET_WIDTH;
const BUDGET_HEIGHT: number = PAIR_BUDGET_NODE_SETTINGS.BUDGET_HEIGHT;

const BAR_LEFT: number = PAIR_BUDGET_NODE_SETTINGS.BAR_LEFT;
const BAR_WIDTH: number = PAIR_BUDGET_NODE_SETTINGS.BAR_WIDTH;
const BAR_HEIGHT: number = PAIR_BUDGET_NODE_SETTINGS.BAR_HEIGHT;
/** The bars are scaled so this much energy (keV) fills the width, until the photon needs more room. */
const MINIMUM_FULL_SCALE_KEV: number = PAIR_BUDGET_NODE_SETTINGS.MINIMUM_FULL_SCALE_KEV;
/** A gap narrower than this is drawn this wide, so the momentum shortfall never vanishes from view. */
const MINIMUM_GAP_PX: number = PAIR_BUDGET_NODE_SETTINGS.MINIMUM_GAP_PX;

type Paint = typeof PhotonInteractionsColors.textColorProperty;

export class PairBudgetNode extends Node {
  public constructor(model: PairProductionModel) {
    super();
    const strings = StringManager.getInstance().getPairProductionStrings();

    const frame = new Rectangle(0, 0, BUDGET_WIDTH, BUDGET_HEIGHT, {
      fill: PhotonInteractionsColors.chartBackgroundColorProperty,
      stroke: PhotonInteractionsColors.panelBorderColorProperty,
      cornerRadius: PAIR_BUDGET_NODE_SETTINGS.FRAME_CORNER_RADIUS,
    });
    const heading = (textProperty: TReadOnlyProperty<string>, top: number): Text =>
      new Text(textProperty, {
        font: FONTS.CHART_TITLE,
        fill: PhotonInteractionsColors.textColorProperty,
        maxWidth: BUDGET_WIDTH - PAIR_BUDGET_NODE_SETTINGS.HEADING_MAX_WIDTH_OFFSET,
        left: PAIR_BUDGET_NODE_SETTINGS.HEADING_LEFT,
        top,
      });
    const rowLabel = (textProperty: TReadOnlyProperty<string>, centerY: number): Text => {
      const text = new Text(textProperty, {
        font: FONTS.TICK_LABEL,
        fill: PhotonInteractionsColors.secondaryTextColorProperty,
        maxWidth: BAR_LEFT - PAIR_BUDGET_NODE_SETTINGS.TEXT_MAX_WIDTH_OFFSET,
      });
      const place = (): void => {
        text.right = BAR_LEFT - PAIR_BUDGET_NODE_SETTINGS.PLACE_RIGHT_OFFSET;
        text.centerY = centerY;
      };
      text.localBoundsProperty.lazyLink(place);
      place();
      return text;
    };
    const bar = (fill: Paint, centerY: number): Rectangle =>
      new Rectangle(BAR_LEFT, centerY - BAR_HEIGHT / 2, 0, BAR_HEIGHT, { fill });
    const legendItem = (textProperty: TReadOnlyProperty<string>, fill: Paint): Node =>
      new HBox({
        spacing: PAIR_BUDGET_NODE_SETTINGS.LEGEND_ITEM_SPACING,
        children: [
          new Rectangle(
            0,
            0,
            PAIR_BUDGET_NODE_SETTINGS.LEGEND_ITEM_WIDTH,
            PAIR_BUDGET_NODE_SETTINGS.LEGEND_ITEM_HEIGHT,
            { fill },
          ),
          new Text(textProperty, {
            font: FONTS.TICK_LABEL,
            fill: PhotonInteractionsColors.textColorProperty,
            maxWidth: PAIR_BUDGET_NODE_SETTINGS.LEGEND_ITEM_MAX_WIDTH,
          }),
        ],
      });

    // ── Energy ──────────────────────────────────────────────────────────────────
    const ENERGY_PHOTON_Y: number = PAIR_BUDGET_NODE_SETTINGS.ENERGY_PHOTON_Y;
    const ENERGY_PAIR_Y: number = PAIR_BUDGET_NODE_SETTINGS.ENERGY_PAIR_Y;
    const photonEnergyBar = bar(PhotonInteractionsColors.photonColorProperty, ENERGY_PHOTON_Y);
    const restBar = bar(PhotonInteractionsColors.restEnergyColorProperty, ENERGY_PAIR_Y);
    const electronBar = bar(PhotonInteractionsColors.electronColorProperty, ENERGY_PAIR_Y);
    const positronBar = bar(PhotonInteractionsColors.positronColorProperty, ENERGY_PAIR_Y);
    // Outline of the 2mₑc² the pair needs, shown when the photon cannot pay for it.
    const restNeeded = new Rectangle(BAR_LEFT, ENERGY_PAIR_Y - BAR_HEIGHT / 2, 0, BAR_HEIGHT, {
      stroke: PhotonInteractionsColors.restEnergyColorProperty,
      lineDash: [
        PAIR_BUDGET_NODE_SETTINGS.REST_NEEDED_LINE_DASH_DASH,
        PAIR_BUDGET_NODE_SETTINGS.CONSTRUCTOR_REST_NEEDED_LINE_DASH_DASH,
      ],
    });
    const restNeededLabel = new Text(strings.restEnergyNeededStringProperty, {
      font: FONTS.TICK_LABEL,
      fill: PhotonInteractionsColors.limitColorProperty,
      maxWidth: PAIR_BUDGET_NODE_SETTINGS.REST_NEEDED_LABEL_MAX_WIDTH,
    });
    const photonEnergyValue = new Text("", {
      font: FONTS.TICK_LABEL,
      fill: PhotonInteractionsColors.photonColorProperty,
    });
    const energyLegend = new HBox({
      spacing: PAIR_BUDGET_NODE_SETTINGS.ENERGY_LEGEND_SPACING,
      children: [
        legendItem(strings.restEnergyStringProperty, PhotonInteractionsColors.restEnergyColorProperty),
        legendItem(strings.electronKineticStringProperty, PhotonInteractionsColors.electronColorProperty),
        legendItem(strings.positronKineticStringProperty, PhotonInteractionsColors.positronColorProperty),
      ],
      left: PAIR_BUDGET_NODE_SETTINGS.ENERGY_LEGEND_LEFT,
      top: ENERGY_PAIR_Y + PAIR_BUDGET_NODE_SETTINGS.ENERGY_LEGEND_TOP_OFFSET,
    });

    // ── Momentum ────────────────────────────────────────────────────────────────
    const MOMENTUM_TOP: number = PAIR_BUDGET_NODE_SETTINGS.MOMENTUM_TOP;
    const MOMENTUM_PHOTON_Y = MOMENTUM_TOP + 32;
    const MOMENTUM_PAIR_Y = MOMENTUM_TOP + 56;
    const photonMomentumBar = bar(PhotonInteractionsColors.photonColorProperty, MOMENTUM_PHOTON_Y);
    const pairMomentumBar = bar(PhotonInteractionsColors.electronColorProperty, MOMENTUM_PAIR_Y);
    const gapBar = bar(PhotonInteractionsColors.nucleusColorProperty, MOMENTUM_PAIR_Y);
    const photonMomentumValue = new Text("", {
      font: FONTS.TICK_LABEL,
      fill: PhotonInteractionsColors.photonColorProperty,
    });
    const caption = new Text("", {
      font: FONTS.READOUT,
      maxWidth: BUDGET_WIDTH - PAIR_BUDGET_NODE_SETTINGS.CAPTION_MAX_WIDTH_OFFSET,
      left: PAIR_BUDGET_NODE_SETTINGS.CAPTION_LEFT,
    });

    Multilink.multilink(
      [
        model.energyProperty,
        model.eventProperty,
        model.statusProperty,
        model.sharePercentProperty,
        model.shortfallProperty,
        strings.nucleusTakesStringProperty,
        strings.nothingTakesStringProperty,
        strings.status.belowStringProperty,
        strings.shortfallPatternStringProperty,
        restNeededLabel.localBoundsProperty,
      ],
      (energy, event, status, sharePercent, shortfall, nucleusTakes, nothingTakes, below, pattern) => {
        const scale = BAR_WIDTH / Math.max(MINIMUM_FULL_SCALE_KEV, 1.1 * energy);
        const photonWidth = energy * scale;
        photonEnergyBar.rectWidth = photonWidth;
        photonMomentumBar.rectWidth = photonWidth;
        photonEnergyValue.string = formatEnergy(energy, PAIR_BUDGET_NODE_SETTINGS.PHOTON_ENERGY_VALUE_DIGITS);
        photonEnergyValue.left = BAR_LEFT + photonWidth + PAIR_BUDGET_NODE_SETTINGS.CONSTRUCTOR_LEFT_OFFSET;
        photonEnergyValue.centerY = ENERGY_PHOTON_Y;
        photonMomentumValue.string = formatEnergy(energy, PAIR_BUDGET_NODE_SETTINGS.PHOTON_MOMENTUM_VALUE_DIGITS, "/c");
        photonMomentumValue.left = BAR_LEFT + photonWidth + PAIR_BUDGET_NODE_SETTINGS.CONSTRUCTOR_LEFT_OFFSET;
        photonMomentumValue.centerY = MOMENTUM_PHOTON_Y;

        // Energy: enough for the rest energy or not.
        const enough = status !== "below";
        const restWidth = PAIR_REST_ENERGY_KEV * scale;
        restBar.visible = enough;
        electronBar.visible = enough;
        positronBar.visible = enough;
        restNeeded.visible = !enough;
        restNeededLabel.visible = !enough;
        restNeeded.rectWidth = restWidth;
        restNeededLabel.left = BAR_LEFT + restWidth + 6;
        restNeededLabel.centerY = ENERGY_PAIR_Y;
        if (enough) {
          // In empty space the energy would balance; split the kinetic energy as the control asks.
          const kinetic = energy - PAIR_REST_ENERGY_KEV;
          const electronKinetic = event ? event.electronKinetic : (kinetic * sharePercent) / 100;
          restBar.rectWidth = restWidth;
          electronBar.rectX = BAR_LEFT + restWidth;
          electronBar.rectWidth = electronKinetic * scale;
          positronBar.rectX = BAR_LEFT + restWidth + electronKinetic * scale;
          positronBar.rectWidth = Math.max(0, kinetic - electronKinetic) * scale;
        }

        // Momentum: the pair always falls short.
        pairMomentumBar.visible = enough;
        gapBar.visible = enough;
        if (enough) {
          const gapWidth = Math.max(MINIMUM_GAP_PX, shortfall * scale);
          pairMomentumBar.rectWidth = photonWidth - gapWidth;
          gapBar.rectX = BAR_LEFT + photonWidth - gapWidth;
          gapBar.rectWidth = gapWidth;
          gapBar.fill =
            status === "allowed"
              ? PhotonInteractionsColors.nucleusColorProperty
              : PhotonInteractionsColors.limitColorProperty;
        }
        caption.string = enough
          ? StringUtils.fillIn(pattern, {
              message: status === "allowed" ? nucleusTakes : nothingTakes,
              shortfall: formatEnergy(shortfall, PAIR_BUDGET_NODE_SETTINGS.CAPTION_DIGITS, "/c"),
            })
          : below;
        caption.fill =
          status === "allowed"
            ? PhotonInteractionsColors.nucleusColorProperty
            : PhotonInteractionsColors.limitColorProperty;
        caption.top = MOMENTUM_PAIR_Y + PAIR_BUDGET_NODE_SETTINGS.CONSTRUCTOR_TOP_OFFSET;
      },
    );

    this.children = [
      frame,
      heading(strings.budgetTitleStringProperty, 8),
      rowLabel(strings.photonEnergyStringProperty, ENERGY_PHOTON_Y),
      rowLabel(strings.pairEnergyStringProperty, ENERGY_PAIR_Y),
      photonEnergyBar,
      photonEnergyValue,
      restBar,
      electronBar,
      positronBar,
      restNeeded,
      restNeededLabel,
      energyLegend,
      heading(strings.momentumTitleStringProperty, MOMENTUM_TOP),
      rowLabel(strings.photonMomentumStringProperty, MOMENTUM_PHOTON_Y),
      rowLabel(strings.pairMomentumStringProperty, MOMENTUM_PAIR_Y),
      photonMomentumBar,
      photonMomentumValue,
      pairMomentumBar,
      gapBar,
      caption,
    ];
  }
}
