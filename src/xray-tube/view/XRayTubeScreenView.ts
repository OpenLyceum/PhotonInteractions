/**
 * XRayTubeScreenView.ts
 *
 * Layout for the X-Ray Tube screen:
 *
 *   left     the tube; below it, the spectrum
 *   middle   the anode atom's inner shells, the limits, the equation, and
 *            (optionally) the Moseley plot
 *   right    voltage and current, anode metal, graph options; Reset All
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { StringUtils } from "scenerystack/phetcommon";
import { HBox, Node, VBox } from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/PhotonInteractionsButtonOptions.js";
import { PhotonInteractionsPanel } from "../../common/PhotonInteractionsPanel.js";
import { formatEnergy, formatSignificant, formatWavelength } from "../../common/view/chartUtils.js";
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
import { CONTROL_WIDTH, SCREEN_VIEW_MARGIN, XRAY } from "../../PhotonInteractionsConstants.js";
import type { XRayTubeModel } from "../model/XRayTubeModel.js";
import { XRAY_TARGETS, type XRayTargetId } from "../model/xrayTargets.js";
import { MoseleyChartNode } from "./MoseleyChartNode.js";
import { SHELL_WIDTH, ShellDiagramNode } from "./ShellDiagramNode.js";
import { XRaySpectrumChartNode } from "./XRaySpectrumChartNode.js";
import { XRayTubeNode } from "./XRayTubeNode.js";
import { XRayTubeScreenSummaryContent } from "./XRayTubeScreenSummaryContent.js";

export type XRayTubeScreenViewOptions = ScreenViewOptions;

const READOUT_WIDTH = SHELL_WIDTH - 24;
const PRESET_BUTTON_TEXT_WIDTH = 92;

export class XRayTubeScreenView extends ScreenView {
  private readonly tube: XRayTubeNode;

  public constructor(
    model: XRayTubeModel,
    showEquationsProperty: TReadOnlyProperty<boolean>,
    providedOptions?: XRayTubeScreenViewOptions,
  ) {
    const options = optionize<XRayTubeScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new XRayTubeScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);

    const bounds = this.layoutBounds;
    const sm = StringManager.getInstance();
    const strings = sm.getXRayTubeStrings();
    const common = sm.getCommonStrings();
    const a11y = sm.getXRayTubeA11yStrings().controls;

    // ── Left: tube and spectrum ─────────────────────────────────────────────────
    this.tube = new XRayTubeNode(model);
    this.tube.left = bounds.minX + SCREEN_VIEW_MARGIN;
    this.tube.top = bounds.minY + SCREEN_VIEW_MARGIN;

    const spectrum = new XRaySpectrumChartNode(model);
    spectrum.left = this.tube.left + 4;
    spectrum.top = this.tube.bottom + 12;

    // ── Middle: shells, limits, equation, Moseley plot ──────────────────────────
    const shells = new ShellDiagramNode(model);
    shells.left = this.tube.right + 14;
    shells.top = this.tube.top;

    const targetNames: Record<XRayTargetId, TReadOnlyProperty<string>> = {
      chromium: strings.targets.chromiumStringProperty,
      copper: strings.targets.copperStringProperty,
      molybdenum: strings.targets.molybdenumStringProperty,
      silver: strings.targets.silverStringProperty,
      tungsten: strings.targets.tungstenStringProperty,
    };

    const readouts = new PhotonInteractionsPanel(
      new VBox({
        align: "left",
        spacing: 5,
        children: [
          createSectionHeader(strings.readoutsHeadingStringProperty),
          createReadoutRow(
            strings.minimumWavelengthStringProperty,
            new DerivedProperty([model.minimumWavelengthProperty], (wavelength) => formatWavelength(wavelength, 4)),
            PhotonInteractionsColors.limitColorProperty,
            READOUT_WIDTH,
          ),
          createReadoutRow(
            strings.maximumEnergyStringProperty,
            new DerivedProperty([model.voltageProperty], (voltage) => formatEnergy(voltage, 4)),
            PhotonInteractionsColors.limitColorProperty,
            READOUT_WIDTH,
          ),
          createReadoutRow(
            strings.electronSpeedStringProperty,
            new DerivedProperty([model.electronBetaProperty, common.speedPatternStringProperty], (beta, pattern) =>
              StringUtils.fillIn(pattern, { value: formatSignificant(beta, 3) }),
            ),
            PhotonInteractionsColors.electronColorProperty,
            READOUT_WIDTH,
          ),
          createReadoutRow(
            strings.kEdgeStringProperty,
            new DerivedProperty([model.targetProperty], (target) => formatEnergy(target.kEdgeKeV, 4)),
            PhotonInteractionsColors.textColorProperty,
            READOUT_WIDTH,
          ),
          createReadoutRow(
            strings.kLinesStringProperty,
            new DerivedProperty(
              [model.kShellIonizedProperty, strings.excitedStringProperty, strings.notExcitedStringProperty],
              (ionized, excited, notExcited) => (ionized ? excited : notExcited),
            ),
            PhotonInteractionsColors.photonColorProperty,
            READOUT_WIDTH,
          ),
        ],
      }),
      { minWidth: SHELL_WIDTH },
    );
    readouts.left = shells.left;
    readouts.top = shells.bottom + 10;

    const equation = new EquationNode(
      "λ<sub>min</sub> = hc / eV,   hc = 1240 eV·nm",
      showEquationsProperty,
      SHELL_WIDTH,
    );
    equation.left = shells.left;
    equation.top = readouts.bottom + 12;

    const moseley = new MoseleyChartNode(model);
    moseley.left = shells.left + 4;
    moseley.top = equation.top + 34;

    // ── Right: controls ─────────────────────────────────────────────────────────
    const voltageControl = createNumberControl(
      model.voltageProperty,
      new Range(XRAY.VOLTAGE_MIN_KV, XRAY.VOLTAGE_MAX_KV),
      {
        titleProperty: strings.voltageStringProperty,
        valuePatternProperty: common.kilovoltsPatternStringProperty,
        accessibleName: a11y.voltageStringProperty,
        accessibleHelpText: a11y.voltageHelpStringProperty,
        decimalPlaces: 0,
        delta: 1,
      },
    );
    const currentControl = createNumberControl(
      model.currentProperty,
      new Range(XRAY.CURRENT_MIN_MA, XRAY.CURRENT_MAX_MA),
      {
        titleProperty: strings.currentStringProperty,
        valuePatternProperty: common.milliampsPatternStringProperty,
        accessibleName: a11y.currentStringProperty,
        accessibleHelpText: a11y.currentHelpStringProperty,
        decimalPlaces: 0,
        delta: 1,
      },
    );
    const preset = (labelProperty: TReadOnlyProperty<string>, voltage: number) =>
      createPushButton(labelProperty, {
        accessibleName: labelProperty,
        accessibleHelpText: a11y.presetHelpStringProperty,
        listener: () => model.setExample(voltage, "tungsten"),
        maxTextWidth: PRESET_BUTTON_TEXT_WIDTH,
      });
    const presetButtons = [
      preset(strings.presets.workedExampleStringProperty, 80),
      preset(strings.presets.problemStringProperty, 120),
    ];
    const tubePanel = new PhotonInteractionsPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [
          createSectionHeader(strings.tubeHeadingStringProperty),
          voltageControl,
          currentControl,
          new HBox({ spacing: 6, children: presetButtons }),
        ],
      }),
      { minWidth: CONTROL_WIDTH + 24 },
    );

    const anodeRadio = createRadioButtonGroup(
      model.targetIdProperty,
      XRAY_TARGETS.map((target) => ({
        value: target.id,
        labelProperty: targetNames[target.id],
        accessibleName: targetNames[target.id],
      })),
      { accessibleName: a11y.anodeStringProperty, accessibleHelpText: a11y.anodeHelpStringProperty },
    );
    const anodePanel = new PhotonInteractionsPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [createSectionHeader(strings.anodeHeadingStringProperty), anodeRadio],
      }),
      { minWidth: CONTROL_WIDTH + 24 },
    );

    const axisRadio = createRadioButtonGroup(
      model.axisProperty,
      [
        {
          value: "wavelength" as const,
          labelProperty: strings.axes.wavelengthStringProperty,
          accessibleName: strings.axes.wavelengthStringProperty,
        },
        {
          value: "energy" as const,
          labelProperty: strings.axes.energyStringProperty,
          accessibleName: strings.axes.energyStringProperty,
        },
      ],
      { accessibleName: a11y.axisStringProperty, accessibleHelpText: a11y.axisHelpStringProperty },
    );
    const moseleyCheckbox = createCheckbox(
      model.showMoseleyProperty,
      strings.showMoseleyStringProperty,
      a11y.showMoseleyStringProperty,
    );
    const graphPanel = new PhotonInteractionsPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [createSectionHeader(strings.graphHeadingStringProperty), axisRadio, moseleyCheckbox],
      }),
      { minWidth: CONTROL_WIDTH + 24 },
    );

    const rightColumn = new VBox({
      spacing: 8,
      align: "right",
      children: [tubePanel, anodePanel, graphPanel],
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
      this.tube,
      spectrum,
      shells,
      readouts,
      equation,
      moseley,
      rightColumn,
      resetAllButton,
      new Node({
        pdomOrder: [
          voltageControl,
          currentControl,
          ...presetButtons,
          anodeRadio,
          axisRadio,
          moseleyCheckbox,
          resetAllButton,
        ],
      }),
    ];
  }

  /** Moves the electrons across the tube. */
  public override step(dt: number): void {
    this.tube.step(dt);
  }
}
