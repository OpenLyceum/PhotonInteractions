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

export const BUDGET_WIDTH = 420;
export const BUDGET_HEIGHT = 246;

const BAR_LEFT = 104;
const BAR_WIDTH = 258;
const BAR_HEIGHT = 16;
/** The bars are scaled so this much energy (keV) fills the width, until the photon needs more room. */
const MINIMUM_FULL_SCALE_KEV = 4000;
/** A gap narrower than this is drawn this wide, so the momentum shortfall never vanishes from view. */
const MINIMUM_GAP_PX = 2;

type Paint = typeof PhotonInteractionsColors.textColorProperty;

export class PairBudgetNode extends Node {
  public constructor(model: PairProductionModel) {
    super();
    const strings = StringManager.getInstance().getPairProductionStrings();

    const frame = new Rectangle(0, 0, BUDGET_WIDTH, BUDGET_HEIGHT, {
      fill: PhotonInteractionsColors.chartBackgroundColorProperty,
      stroke: PhotonInteractionsColors.panelBorderColorProperty,
      cornerRadius: 6,
    });
    const heading = (textProperty: TReadOnlyProperty<string>, top: number): Text =>
      new Text(textProperty, {
        font: FONTS.CHART_TITLE,
        fill: PhotonInteractionsColors.textColorProperty,
        maxWidth: BUDGET_WIDTH - 20,
        left: 10,
        top,
      });
    const rowLabel = (textProperty: TReadOnlyProperty<string>, centerY: number): Text => {
      const text = new Text(textProperty, {
        font: FONTS.TICK_LABEL,
        fill: PhotonInteractionsColors.secondaryTextColorProperty,
        maxWidth: BAR_LEFT - 16,
      });
      const place = (): void => {
        text.right = BAR_LEFT - 6;
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
        spacing: 4,
        children: [
          new Rectangle(0, 0, 9, 9, { fill }),
          new Text(textProperty, {
            font: FONTS.TICK_LABEL,
            fill: PhotonInteractionsColors.textColorProperty,
            maxWidth: 104,
          }),
        ],
      });

    // ── Energy ──────────────────────────────────────────────────────────────────
    const ENERGY_PHOTON_Y = 40;
    const ENERGY_PAIR_Y = 64;
    const photonEnergyBar = bar(PhotonInteractionsColors.photonColorProperty, ENERGY_PHOTON_Y);
    const restBar = bar(PhotonInteractionsColors.restEnergyColorProperty, ENERGY_PAIR_Y);
    const electronBar = bar(PhotonInteractionsColors.electronColorProperty, ENERGY_PAIR_Y);
    const positronBar = bar(PhotonInteractionsColors.positronColorProperty, ENERGY_PAIR_Y);
    // Outline of the 2mₑc² the pair needs, shown when the photon cannot pay for it.
    const restNeeded = new Rectangle(BAR_LEFT, ENERGY_PAIR_Y - BAR_HEIGHT / 2, 0, BAR_HEIGHT, {
      stroke: PhotonInteractionsColors.restEnergyColorProperty,
      lineDash: [4, 3],
    });
    const restNeededLabel = new Text(strings.restEnergyNeededStringProperty, {
      font: FONTS.TICK_LABEL,
      fill: PhotonInteractionsColors.limitColorProperty,
      maxWidth: 150,
    });
    const photonEnergyValue = new Text("", {
      font: FONTS.TICK_LABEL,
      fill: PhotonInteractionsColors.photonColorProperty,
    });
    const energyLegend = new HBox({
      spacing: 12,
      children: [
        legendItem(strings.restEnergyStringProperty, PhotonInteractionsColors.restEnergyColorProperty),
        legendItem(strings.electronKineticStringProperty, PhotonInteractionsColors.electronColorProperty),
        legendItem(strings.positronKineticStringProperty, PhotonInteractionsColors.positronColorProperty),
      ],
      left: 14,
      top: ENERGY_PAIR_Y + 16,
    });

    // ── Momentum ────────────────────────────────────────────────────────────────
    const MOMENTUM_TOP = 124;
    const MOMENTUM_PHOTON_Y = MOMENTUM_TOP + 32;
    const MOMENTUM_PAIR_Y = MOMENTUM_TOP + 56;
    const photonMomentumBar = bar(PhotonInteractionsColors.photonColorProperty, MOMENTUM_PHOTON_Y);
    const pairMomentumBar = bar(PhotonInteractionsColors.electronColorProperty, MOMENTUM_PAIR_Y);
    const gapBar = bar(PhotonInteractionsColors.nucleusColorProperty, MOMENTUM_PAIR_Y);
    const photonMomentumValue = new Text("", {
      font: FONTS.TICK_LABEL,
      fill: PhotonInteractionsColors.photonColorProperty,
    });
    const caption = new Text("", { font: FONTS.READOUT, maxWidth: BUDGET_WIDTH - 28, left: 14 });

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
        photonEnergyValue.string = formatEnergy(energy, 4);
        photonEnergyValue.left = BAR_LEFT + photonWidth + 5;
        photonEnergyValue.centerY = ENERGY_PHOTON_Y;
        photonMomentumValue.string = formatEnergy(energy, 4, "/c");
        photonMomentumValue.left = BAR_LEFT + photonWidth + 5;
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
              shortfall: formatEnergy(shortfall, 3, "/c"),
            })
          : below;
        caption.fill =
          status === "allowed"
            ? PhotonInteractionsColors.nucleusColorProperty
            : PhotonInteractionsColors.limitColorProperty;
        caption.top = MOMENTUM_PAIR_Y + 18;
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
