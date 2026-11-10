/**
 * AnnihilationScreenView.ts
 *
 * Layout for the Annihilation screen:
 *
 *   left     the annihilation in the lab; below it, the PET scanner's ring
 *   middle   the two photons' energies, wavelengths and directions; the equation
 *   right    positron energy, emission angle and the single-photon test, the
 *            scanner's controls; Reset All
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { StringUtils } from "scenerystack/phetcommon";
import { Node, Text, VBox } from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { type FourMomentum, wavelengthOfEnergy } from "../../common/model/fourMomentum.js";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/PhotonInteractionsButtonOptions.js";
import { PhotonInteractionsPanel } from "../../common/PhotonInteractionsPanel.js";
import { formatDegrees, formatEnergy, formatWavelength } from "../../common/view/chartUtils.js";
import {
  createCheckbox,
  createNumberControl,
  createPushButton,
  createReadoutRow,
  createSectionHeader,
} from "../../common/view/controlHelpers.js";
import { EquationNode } from "../../common/view/EquationNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import PhotonInteractionsColors from "../../PhotonInteractionsColors.js";
import { ANNIHILATION, CONTROL_WIDTH, FONTS, SCREEN_VIEW_MARGIN } from "../../PhotonInteractionsConstants.js";
import type { AnnihilationModel } from "../model/AnnihilationModel.js";
import { AnnihilationEventNode } from "./AnnihilationEventNode.js";
import { AnnihilationScreenSummaryContent } from "./AnnihilationScreenSummaryContent.js";
import { PetRingNode, RING_RADIUS_PX } from "./PetRingNode.js";

export type AnnihilationScreenViewOptions = ScreenViewOptions;

const MIDDLE_WIDTH = 290;
const READOUT_WIDTH = MIDDLE_WIDTH - 24;

export class AnnihilationScreenView extends ScreenView {
  public constructor(
    model: AnnihilationModel,
    showEquationsProperty: TReadOnlyProperty<boolean>,
    providedOptions?: AnnihilationScreenViewOptions,
  ) {
    const options = optionize<AnnihilationScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new AnnihilationScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);

    const bounds = this.layoutBounds;
    const sm = StringManager.getInstance();
    const strings = sm.getAnnihilationStrings();
    const common = sm.getCommonStrings();
    const a11y = sm.getAnnihilationA11yStrings().controls;

    // ── Left: event and scanner ─────────────────────────────────────────────────
    const eventNode = new AnnihilationEventNode(model);
    eventNode.left = bounds.minX + SCREEN_VIEW_MARGIN;
    eventNode.top = bounds.minY + SCREEN_VIEW_MARGIN;

    const ring = new PetRingNode(model);
    // The ring node's origin is the ring's centre.
    ring.x = eventNode.left + RING_RADIUS_PX + 30;
    ring.y = eventNode.bottom + 16 + RING_RADIUS_PX + 12;
    const ringTitle = new Text(strings.petHeadingStringProperty, {
      font: FONTS.CHART_TITLE,
      fill: PhotonInteractionsColors.textColorProperty,
      maxWidth: 150,
    });
    ringTitle.left = ring.x + RING_RADIUS_PX + 30;
    ringTitle.top = eventNode.bottom + 20;
    const countText = new Text(
      new DerivedProperty([strings.petCountPatternStringProperty, model.coincidenceCountProperty], (pattern, count) =>
        StringUtils.fillIn(pattern, { count }),
      ),
      { font: FONTS.READOUT, fill: PhotonInteractionsColors.textColorProperty, maxWidth: 170 },
    );
    countText.left = ringTitle.left;
    countText.top = ringTitle.bottom + 10;

    // ── Middle: the two photons ─────────────────────────────────────────────────
    const fromPhoton = (index: 0 | 1, format: (photon: FourMomentum) => string): TReadOnlyProperty<string> =>
      new DerivedProperty([model.photonsProperty], (photons) => format(photons[index]));
    const energy = (photon: FourMomentum): string => formatEnergy(photon.energy, 4);
    const wavelength = (photon: FourMomentum): string => formatWavelength(wavelengthOfEnergy(photon.energy), 4);
    const direction = (photon: FourMomentum): string => formatDegrees(photon.angle);
    const first = PhotonInteractionsColors.photonColorProperty;
    const second = PhotonInteractionsColors.scatteredPhotonColorProperty;
    const readouts = new PhotonInteractionsPanel(
      new VBox({
        align: "left",
        spacing: 5,
        children: [
          createSectionHeader(strings.readoutsHeadingStringProperty),
          createReadoutRow(strings.photon1EnergyStringProperty, fromPhoton(0, energy), first, READOUT_WIDTH),
          createReadoutRow(strings.photon2EnergyStringProperty, fromPhoton(1, energy), second, READOUT_WIDTH),
          createReadoutRow(strings.photon1WavelengthStringProperty, fromPhoton(0, wavelength), first, READOUT_WIDTH),
          createReadoutRow(strings.photon2WavelengthStringProperty, fromPhoton(1, wavelength), second, READOUT_WIDTH),
          createReadoutRow(strings.photon1AngleStringProperty, fromPhoton(0, direction), first, READOUT_WIDTH),
          createReadoutRow(strings.photon2AngleStringProperty, fromPhoton(1, direction), second, READOUT_WIDTH),
          createReadoutRow(
            strings.openingAngleStringProperty,
            new DerivedProperty([model.openingAngleProperty], (angle) => formatDegrees(angle)),
            PhotonInteractionsColors.textColorProperty,
            READOUT_WIDTH,
          ),
          createReadoutRow(
            strings.totalEnergyStringProperty,
            new DerivedProperty([model.totalProperty], (total) => formatEnergy(total.energy, 4)),
            PhotonInteractionsColors.textColorProperty,
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
        new EquationNode("e⁺ + e⁻ → γ + γ", showEquationsProperty, MIDDLE_WIDTH),
        new EquationNode("E₁ + E₂ = K + 2mₑc²", showEquationsProperty, MIDDLE_WIDTH),
        new EquationNode("mₑc² = 511 keV", showEquationsProperty, MIDDLE_WIDTH),
      ],
    });
    equations.left = readouts.left;
    equations.top = readouts.bottom + 14;

    // ── Right: controls ─────────────────────────────────────────────────────────
    const kineticControl = createNumberControl(
      model.kineticMeVProperty,
      new Range(ANNIHILATION.KINETIC_MIN_MEV, ANNIHILATION.KINETIC_MAX_MEV),
      {
        titleProperty: strings.kineticStringProperty,
        valuePatternProperty: common.megaelectronvoltsPatternStringProperty,
        accessibleName: a11y.kineticStringProperty,
        accessibleHelpText: a11y.kineticHelpStringProperty,
        decimalPlaces: 2,
        delta: 0.01,
      },
    );
    const positronPanel = new PhotonInteractionsPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [createSectionHeader(strings.positronHeadingStringProperty), kineticControl],
      }),
      { minWidth: CONTROL_WIDTH + 24 },
    );

    const angleControl = createNumberControl(
      model.cmAngleDegreesProperty,
      new Range(ANNIHILATION.CM_ANGLE_MIN_DEG, ANNIHILATION.CM_ANGLE_MAX_DEG),
      {
        titleProperty: strings.cmAngleStringProperty,
        valuePatternProperty: common.degreesPatternStringProperty,
        accessibleName: a11y.cmAngleStringProperty,
        accessibleHelpText: a11y.cmAngleHelpStringProperty,
        decimalPlaces: 0,
        delta: 1,
      },
    );
    const onePhotonCheckbox = createCheckbox(
      model.onePhotonProperty,
      strings.onePhotonStringProperty,
      a11y.onePhotonStringProperty,
    );
    const photonsPanel = new PhotonInteractionsPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [createSectionHeader(strings.photonsHeadingStringProperty), angleControl, onePhotonCheckbox],
      }),
      { minWidth: CONTROL_WIDTH + 24 },
    );

    const recordCheckbox = createCheckbox(
      model.recordingProperty,
      strings.petRunStringProperty,
      a11y.petRunStringProperty,
    );
    recordCheckbox.accessibleHelpText = a11y.petRunHelpStringProperty;
    const tracerCheckbox = createCheckbox(
      model.showTracerProperty,
      strings.petShowTracerStringProperty,
      a11y.petShowTracerStringProperty,
    );
    const clearButton = createPushButton(strings.petClearStringProperty, {
      accessibleName: a11y.petClearStringProperty,
      accessibleHelpText: a11y.petClearHelpStringProperty,
      listener: () => model.clearLines(),
      maxTextWidth: 90,
    });
    const scannerPanel = new PhotonInteractionsPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [createSectionHeader(strings.petHeadingStringProperty), recordCheckbox, tracerCheckbox, clearButton],
      }),
      { minWidth: CONTROL_WIDTH + 24 },
    );

    const rightColumn = new VBox({
      spacing: 10,
      align: "right",
      children: [positronPanel, photonsPanel, scannerPanel],
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
      ring,
      ringTitle,
      countText,
      readouts,
      equations,
      rightColumn,
      resetAllButton,
      new Node({
        pdomOrder: [
          kineticControl,
          angleControl,
          onePhotonCheckbox,
          ring.tracer,
          recordCheckbox,
          tracerCheckbox,
          clearButton,
          resetAllButton,
        ],
      }),
    ];
  }
}
