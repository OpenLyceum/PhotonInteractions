/**
 * ComptonScreenView.ts
 *
 * Layout for the Compton screen:
 *
 *   left     the collision in the lab; below it, one of three graphs
 *   middle   the momentum triangle, the table of measurements, the equation,
 *            and the detector's fire and clear controls
 *   right    incident photon, scattering angle, choice of graph; Reset All
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Dimension2, Range } from "scenerystack/dot";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { StringUtils } from "scenerystack/phetcommon";
import { HBox, Node, Text, VBox } from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { HSlider } from "scenerystack/sun";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/PhotonInteractionsButtonOptions.js";
import { PhotonInteractionsPanel } from "../../common/PhotonInteractionsPanel.js";
import { formatDegrees, formatEnergy, formatSignificant, formatWavelength } from "../../common/view/chartUtils.js";
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
import { COMPTON, CONTROL_WIDTH, FONTS, SCREEN_VIEW_MARGIN } from "../../PhotonInteractionsConstants.js";
import type { ComptonModel } from "../model/ComptonModel.js";
import { ComptonChartsNode } from "./ComptonChartsNode.js";
import { COLLISION_WIDTH, ComptonCollisionNode } from "./ComptonCollisionNode.js";
import { ComptonScreenSummaryContent } from "./ComptonScreenSummaryContent.js";
import { MomentumTriangleNode, TRIANGLE_WIDTH } from "./MomentumTriangleNode.js";

export type ComptonScreenViewOptions = ScreenViewOptions;

const READOUT_WIDTH = TRIANGLE_WIDTH - 24;
const PRESET_BUTTON_TEXT_WIDTH = 92;

export class ComptonScreenView extends ScreenView {
  public constructor(
    model: ComptonModel,
    showEquationsProperty: TReadOnlyProperty<boolean>,
    providedOptions?: ComptonScreenViewOptions,
  ) {
    const options = optionize<ComptonScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new ComptonScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);

    const bounds = this.layoutBounds;
    const sm = StringManager.getInstance();
    const strings = sm.getComptonStrings();
    const common = sm.getCommonStrings();
    const a11y = sm.getComptonA11yStrings().controls;

    // ── Left: collision and graph ───────────────────────────────────────────────
    const collision = new ComptonCollisionNode(model);
    collision.left = bounds.minX + SCREEN_VIEW_MARGIN;
    collision.top = bounds.minY + SCREEN_VIEW_MARGIN;

    const charts = new ComptonChartsNode(model);
    // The charts' own left edge is the y-axis label; the frame sits 45 px inside it.
    charts.left = collision.left + 4;
    charts.top = collision.bottom + 12;

    // ── Middle: triangle, measurements, equation, detector controls ─────────────
    const triangle = new MomentumTriangleNode(model);
    triangle.left = collision.left + COLLISION_WIDTH + 14;
    triangle.top = collision.top;

    const energyText = (property: TReadOnlyProperty<number>): TReadOnlyProperty<string> =>
      new DerivedProperty([property], (value) => formatEnergy(value, 4));
    const wavelengthText = (property: TReadOnlyProperty<number>): TReadOnlyProperty<string> =>
      new DerivedProperty([property], (value) => formatWavelength(value, 5));
    const fractionalShiftProperty = new DerivedProperty(
      [model.shiftProperty, model.wavelengthProperty],
      (shift, wavelength) => formatSignificant(shift / wavelength, 3),
    );
    const readouts = new PhotonInteractionsPanel(
      new VBox({
        align: "left",
        spacing: 5,
        children: [
          createSectionHeader(strings.readoutsHeadingStringProperty),
          createReadoutRow(
            strings.incidentWavelengthStringProperty,
            wavelengthText(model.wavelengthProperty),
            PhotonInteractionsColors.photonColorProperty,
            READOUT_WIDTH,
          ),
          createReadoutRow(
            strings.scatteredWavelengthStringProperty,
            wavelengthText(model.scatteredWavelengthProperty),
            PhotonInteractionsColors.scatteredPhotonColorProperty,
            READOUT_WIDTH,
          ),
          createReadoutRow(
            strings.shiftStringProperty,
            wavelengthText(model.shiftProperty),
            PhotonInteractionsColors.textColorProperty,
            READOUT_WIDTH,
          ),
          createReadoutRow(
            strings.fractionalShiftStringProperty,
            fractionalShiftProperty,
            PhotonInteractionsColors.textColorProperty,
            READOUT_WIDTH,
          ),
          createReadoutRow(
            strings.incidentEnergyStringProperty,
            energyText(model.energyProperty),
            PhotonInteractionsColors.photonColorProperty,
            READOUT_WIDTH,
          ),
          createReadoutRow(
            strings.scatteredEnergyStringProperty,
            energyText(model.scatteredEnergyProperty),
            PhotonInteractionsColors.scatteredPhotonColorProperty,
            READOUT_WIDTH,
          ),
          createReadoutRow(
            strings.electronKineticStringProperty,
            energyText(model.recoilKineticProperty),
            PhotonInteractionsColors.electronColorProperty,
            READOUT_WIDTH,
          ),
          createReadoutRow(
            strings.recoilAngleStringProperty,
            new DerivedProperty([model.recoilAngleProperty], (phi) => formatDegrees(phi)),
            PhotonInteractionsColors.electronColorProperty,
            READOUT_WIDTH,
          ),
        ],
      }),
      { minWidth: TRIANGLE_WIDTH },
    );
    readouts.left = triangle.left;
    readouts.top = triangle.bottom + 10;

    const equation = new EquationNode(
      "λ′ − λ = (h/mₑc)(1 − cos θ),   h/mₑc = 2.426 pm",
      showEquationsProperty,
      TRIANGLE_WIDTH,
    );
    equation.left = triangle.left;
    equation.top = readouts.bottom + 12;

    const fireCheckbox = createCheckbox(
      model.firingProperty,
      strings.firePhotonsStringProperty,
      a11y.firePhotonsStringProperty,
    );
    fireCheckbox.accessibleHelpText = a11y.firePhotonsHelpStringProperty;
    const clearButton = createPushButton(strings.clearStringProperty, {
      accessibleName: a11y.clearStringProperty,
      accessibleHelpText: a11y.clearHelpStringProperty,
      listener: () => model.clearHistogram(),
      maxTextWidth: 80,
    });
    const eventsText = new Text(
      new DerivedProperty([strings.eventsPatternStringProperty, model.eventCountProperty], (pattern, count) =>
        StringUtils.fillIn(pattern, { count }),
      ),
      { font: FONTS.READOUT, fill: PhotonInteractionsColors.textColorProperty, maxWidth: TRIANGLE_WIDTH },
    );
    const detectorControls = new VBox({
      align: "left",
      spacing: 8,
      children: [new HBox({ spacing: 24, children: [fireCheckbox, clearButton] }), eventsText],
      visibleProperty: new DerivedProperty([model.graphProperty], (graph) => graph === "detector"),
    });
    detectorControls.left = triangle.left;
    detectorControls.top = equation.top + 36;

    // ── Right: controls ─────────────────────────────────────────────────────────
    const energyValueProperty = new DerivedProperty(
      [model.energyProperty, model.wavelengthProperty],
      (energy, wavelength) => `${formatEnergy(energy, 4)}   λ = ${formatWavelength(wavelength, 4)}`,
    );
    const energySlider = new HSlider(
      model.logEnergyProperty,
      new Range(COMPTON.LOG_ENERGY_MIN, COMPTON.LOG_ENERGY_MAX),
      {
        trackSize: new Dimension2(CONTROL_WIDTH - 20, 4),
        thumbSize: new Dimension2(14, 26),
        thumbFill: PhotonInteractionsColors.accentColorProperty,
        trackFillEnabled: PhotonInteractionsColors.textColorProperty,
        keyboardStep: 0.05,
        shiftKeyboardStep: 0.005,
        pageKeyboardStep: 0.5,
        accessibleName: a11y.energyStringProperty,
        accessibleHelpText: a11y.energyHelpStringProperty,
        pdomCreateAriaValueText: () => energyValueProperty.value,
        pdomDependencies: [energyValueProperty],
      },
    );
    // One tick per decade, labelled where a unit changes: 1 eV, 1 keV, 1 MeV.
    for (let decade = COMPTON.LOG_ENERGY_MIN; decade <= COMPTON.LOG_ENERGY_MAX; decade++) {
      const labels: Record<number, string> = { [-3]: "1 eV", 0: "1 keV", 3: "1 MeV" };
      const label = labels[decade];
      if (label) {
        energySlider.addMajorTick(
          decade,
          new Text(label, { font: FONTS.TICK_LABEL, fill: PhotonInteractionsColors.textColorProperty }),
        );
      } else {
        energySlider.addMinorTick(decade);
      }
    }
    const preset = (labelProperty: TReadOnlyProperty<string>, apply: () => void) =>
      createPushButton(labelProperty, {
        accessibleName: labelProperty,
        accessibleHelpText: a11y.presetHelpStringProperty,
        listener: apply,
        maxTextWidth: PRESET_BUTTON_TEXT_WIDTH,
      });
    const presetButtons = [
      preset(strings.presets.workedExampleStringProperty, () =>
        model.setWavelength(COMPTON.WORKED_EXAMPLE_WAVELENGTH_PM),
      ),
      preset(strings.presets.molybdenumStringProperty, () => model.setWavelength(COMPTON.MOLYBDENUM_WAVELENGTH_PM)),
      preset(strings.presets.cesiumStringProperty, () => model.setEnergy(COMPTON.CESIUM_ENERGY_KEV)),
      preset(strings.presets.visibleStringProperty, () => model.setWavelength(COMPTON.VISIBLE_WAVELENGTH_PM)),
    ];
    const sourcePanel = new PhotonInteractionsPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [
          createSectionHeader(strings.sourceHeadingStringProperty),
          new Text(energyValueProperty, {
            font: FONTS.READOUT_VALUE,
            fill: PhotonInteractionsColors.photonColorProperty,
            maxWidth: CONTROL_WIDTH,
          }),
          energySlider,
          new HBox({ spacing: 6, children: presetButtons.slice(0, 2) }),
          new HBox({ spacing: 6, children: presetButtons.slice(2, 4) }),
        ],
      }),
      { minWidth: CONTROL_WIDTH + 24 },
    );

    const angleControl = createNumberControl(
      model.angleDegreesProperty,
      new Range(COMPTON.ANGLE_MIN_DEG, COMPTON.ANGLE_MAX_DEG),
      {
        titleProperty: strings.angleStringProperty,
        valuePatternProperty: common.degreesPatternStringProperty,
        accessibleName: a11y.angleStringProperty,
        accessibleHelpText: a11y.angleHelpStringProperty,
        decimalPlaces: 0,
        delta: 1,
      },
    );
    const boundCheckbox = createCheckbox(
      model.includeBoundProperty,
      strings.includeBoundStringProperty,
      a11y.includeBoundStringProperty,
    );
    const scatteringPanel = new PhotonInteractionsPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [createSectionHeader(strings.scatteringHeadingStringProperty), angleControl, boundCheckbox],
      }),
      { minWidth: CONTROL_WIDTH + 24 },
    );

    const graphRadio = createRadioButtonGroup(
      model.graphProperty,
      [
        {
          value: "shift" as const,
          labelProperty: strings.graphs.shiftStringProperty,
          accessibleName: strings.graphs.shiftStringProperty,
        },
        {
          value: "spectrometer" as const,
          labelProperty: strings.graphs.spectrometerStringProperty,
          accessibleName: strings.graphs.spectrometerStringProperty,
        },
        {
          value: "detector" as const,
          labelProperty: strings.graphs.detectorStringProperty,
          accessibleName: strings.graphs.detectorStringProperty,
        },
      ],
      { accessibleName: a11y.graphStringProperty, accessibleHelpText: a11y.graphHelpStringProperty },
    );
    const graphPanel = new PhotonInteractionsPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [createSectionHeader(strings.graphHeadingStringProperty), graphRadio],
      }),
      { minWidth: CONTROL_WIDTH + 24 },
    );

    const rightColumn = new VBox({
      spacing: 10,
      align: "right",
      children: [sourcePanel, scatteringPanel, graphPanel],
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
      collision,
      charts,
      triangle,
      readouts,
      equation,
      detectorControls,
      rightColumn,
      resetAllButton,
      new Node({
        pdomOrder: [
          energySlider,
          ...presetButtons,
          angleControl,
          boundCheckbox,
          graphRadio,
          fireCheckbox,
          clearButton,
          resetAllButton,
        ],
      }),
    ];
  }
}
