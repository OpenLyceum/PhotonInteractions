/**
 * PairProductionScreenView.ts
 *
 * Layout for the Pair Production screen:
 *
 *   left     the event, replayed; below it, the energy and momentum budgets
 *   middle   what the products carry, and the equation
 *   right    photon energy, surroundings, energy sharing and field; Reset All
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { StringUtils } from "scenerystack/phetcommon";
import { HBox, Node, VBox } from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { betaOfKineticEnergy } from "../../common/model/fourMomentum.js";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/PhotonInteractionsButtonOptions.js";
import { PhotonInteractionsPanel } from "../../common/PhotonInteractionsPanel.js";
import { formatEnergy, formatSignificant } from "../../common/view/chartUtils.js";
import {
  createCheckbox,
  createNumberControl,
  createPushButton,
  createRadioButtonGroup,
  createReadoutRow,
  createSectionHeader,
} from "../../common/view/controlHelpers.js";
import { EquationNode } from "../../common/view/EquationNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import PhotonInteractionsColors from "../../PhotonInteractionsColors.js";
import { CONTROL_WIDTH, PAIR, PHYSICS, SCREEN_VIEW_MARGIN } from "../../PhotonInteractionsConstants.js";
import type { PairProductionModel } from "../model/PairProductionModel.js";
import { PAIR_REST_ENERGY_KEV, type PairEvent } from "../model/pairProduction.js";
import { PairBudgetNode } from "./PairBudgetNode.js";
import { PairEventNode } from "./PairEventNode.js";
import { PairProductionScreenSummaryContent } from "./PairProductionScreenSummaryContent.js";

export type PairProductionScreenViewOptions = ScreenViewOptions;

const MIDDLE_WIDTH = 290;
const READOUT_WIDTH = MIDDLE_WIDTH - 24;
const PRESET_BUTTON_TEXT_WIDTH = 58;
const NO_VALUE = "—";

export class PairProductionScreenView extends ScreenView {
  public constructor(
    model: PairProductionModel,
    showEquationsProperty: TReadOnlyProperty<boolean>,
    providedOptions?: PairProductionScreenViewOptions,
  ) {
    const options = optionize<PairProductionScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new PairProductionScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);

    const bounds = this.layoutBounds;
    const sm = StringManager.getInstance();
    const strings = sm.getPairProductionStrings();
    const common = sm.getCommonStrings();
    const a11y = sm.getPairProductionA11yStrings().controls;

    // ── Left: event and budgets ─────────────────────────────────────────────────
    const eventNode = new PairEventNode(model);
    eventNode.left = bounds.minX + SCREEN_VIEW_MARGIN;
    eventNode.top = bounds.minY + SCREEN_VIEW_MARGIN;

    const budget = new PairBudgetNode(model);
    budget.left = eventNode.left;
    budget.top = eventNode.bottom + 12;

    // ── Middle: products and equation ───────────────────────────────────────────
    const fromEvent = (format: (event: PairEvent) => string): TReadOnlyProperty<string> =>
      new DerivedProperty([model.eventProperty], (event) => (event ? format(event) : NO_VALUE));
    const speed = (kinetic: (event: PairEvent) => number): TReadOnlyProperty<string> =>
      new DerivedProperty([model.eventProperty, common.speedPatternStringProperty], (event, pattern) =>
        event
          ? StringUtils.fillIn(pattern, {
              value: formatSignificant(betaOfKineticEnergy(PHYSICS.ELECTRON_REST_ENERGY_KEV, kinetic(event)), 3),
            })
          : NO_VALUE,
      );
    const readouts = new PhotonInteractionsPanel(
      new VBox({
        align: "left",
        spacing: 5,
        children: [
          createSectionHeader(strings.readoutsHeadingStringProperty),
          createReadoutRow(
            strings.electronEnergyStringProperty,
            fromEvent((event) => formatEnergy(event.electronKinetic, 4)),
            PhotonInteractionsColors.electronColorProperty,
            READOUT_WIDTH,
          ),
          createReadoutRow(
            strings.positronEnergyStringProperty,
            fromEvent((event) => formatEnergy(event.positronKinetic, 4)),
            PhotonInteractionsColors.positronColorProperty,
            READOUT_WIDTH,
          ),
          createReadoutRow(
            strings.electronSpeedStringProperty,
            speed((event) => event.electronKinetic),
            PhotonInteractionsColors.electronColorProperty,
            READOUT_WIDTH,
          ),
          createReadoutRow(
            strings.positronSpeedStringProperty,
            speed((event) => event.positronKinetic),
            PhotonInteractionsColors.positronColorProperty,
            READOUT_WIDTH,
          ),
          createReadoutRow(
            strings.nucleusMomentumStringProperty,
            fromEvent((event) => formatEnergy(event.nucleusMomentum, 3, "/c")),
            PhotonInteractionsColors.nucleusColorProperty,
            READOUT_WIDTH,
          ),
          createReadoutRow(
            strings.nucleusKineticStringProperty,
            fromEvent((event) => formatEnergy(event.nucleusKinetic, 3)),
            PhotonInteractionsColors.nucleusColorProperty,
            READOUT_WIDTH,
          ),
          createReadoutRow(
            strings.shortfallStringProperty,
            new DerivedProperty([model.energyProperty, model.shortfallProperty], (energy, shortfall) =>
              energy > PAIR_REST_ENERGY_KEV ? formatEnergy(shortfall, 3, "/c") : NO_VALUE,
            ),
            PhotonInteractionsColors.limitColorProperty,
            READOUT_WIDTH,
          ),
        ],
      }),
      { minWidth: MIDDLE_WIDTH },
    );
    readouts.left = eventNode.right + 14;
    readouts.top = eventNode.top;

    const equations = new VBox({
      align: "left",
      spacing: 8,
      children: [
        new EquationNode("E<sub>γ</sub> = 2mₑc² + K₋ + K₊", showEquationsProperty, MIDDLE_WIDTH),
        new EquationNode("2mₑc² = 1.022 MeV", showEquationsProperty, MIDDLE_WIDTH),
        new EquationNode("r = p / eB", showEquationsProperty, MIDDLE_WIDTH),
      ],
    });
    equations.left = readouts.left;
    equations.top = readouts.bottom + 14;

    // ── Right: controls ─────────────────────────────────────────────────────────
    const energyControl = createNumberControl(
      model.energyMeVProperty,
      new Range(PAIR.ENERGY_MIN_MEV, PAIR.ENERGY_MAX_MEV),
      {
        titleProperty: strings.energyStringProperty,
        valuePatternProperty: common.megaelectronvoltsPatternStringProperty,
        accessibleName: a11y.energyStringProperty,
        accessibleHelpText: a11y.energyHelpStringProperty,
        decimalPlaces: 2,
        delta: 0.01,
      },
    );
    const preset = (labelProperty: TReadOnlyProperty<string>, energyMeV: number) =>
      createPushButton(labelProperty, {
        accessibleName: labelProperty,
        accessibleHelpText: a11y.presetHelpStringProperty,
        listener: () => {
          model.energyMeVProperty.value = energyMeV;
        },
        maxTextWidth: PRESET_BUTTON_TEXT_WIDTH,
      });
    const presetButtons = [
      preset(strings.presets.thresholdStringProperty, 1.03),
      preset(strings.presets.problemStringProperty, 2.5),
      preset(strings.presets.workedExampleStringProperty, 3),
    ];
    const photonPanel = new PhotonInteractionsPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [
          createSectionHeader(strings.photonHeadingStringProperty),
          energyControl,
          new HBox({ spacing: 5, children: presetButtons }),
        ],
      }),
      { minWidth: CONTROL_WIDTH + 24 },
    );

    const surroundingsRadio = createRadioButtonGroup(
      model.surroundingsProperty,
      [
        {
          value: "lead" as const,
          labelProperty: strings.surroundings.leadStringProperty,
          accessibleName: strings.surroundings.leadStringProperty,
        },
        {
          value: "carbon" as const,
          labelProperty: strings.surroundings.carbonStringProperty,
          accessibleName: strings.surroundings.carbonStringProperty,
        },
        {
          value: "vacuum" as const,
          labelProperty: strings.surroundings.vacuumStringProperty,
          accessibleName: strings.surroundings.vacuumStringProperty,
        },
      ],
      { accessibleName: a11y.surroundingsStringProperty, accessibleHelpText: a11y.surroundingsHelpStringProperty },
    );
    const surroundingsPanel = new PhotonInteractionsPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [createSectionHeader(strings.surroundingsHeadingStringProperty), surroundingsRadio],
      }),
      { minWidth: CONTROL_WIDTH + 24 },
    );

    const shareControl = createNumberControl(
      model.sharePercentProperty,
      new Range(100 * PAIR.SHARE_MIN, 100 * PAIR.SHARE_MAX),
      {
        titleProperty: strings.shareStringProperty,
        valuePatternProperty: common.percentPatternStringProperty,
        accessibleName: a11y.shareStringProperty,
        accessibleHelpText: a11y.shareHelpStringProperty,
        decimalPlaces: 0,
        delta: 1,
      },
    );
    const fieldCheckbox = createCheckbox(
      model.fieldOnProperty,
      strings.magneticFieldStringProperty,
      a11y.magneticFieldStringProperty,
    );
    const pairPanel = new PhotonInteractionsPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [createSectionHeader(strings.pairHeadingStringProperty), shareControl, fieldCheckbox],
      }),
      { minWidth: CONTROL_WIDTH + 24 },
    );

    const rightColumn = new VBox({
      spacing: 10,
      align: "right",
      children: [photonPanel, surroundingsPanel, pairPanel],
    });
    rightColumn.right = bounds.maxX - SCREEN_VIEW_MARGIN;
    rightColumn.top = bounds.minY + SCREEN_VIEW_MARGIN;

    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
      },
      right: bounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: bounds.maxY - SCREEN_VIEW_MARGIN,
    });

    this.children = [
      eventNode,
      budget,
      readouts,
      equations,
      rightColumn,
      resetAllButton,
      new Node({
        pdomOrder: [energyControl, ...presetButtons, surroundingsRadio, shareControl, fieldCheckbox, resetAllButton],
      }),
    ];
  }
}
