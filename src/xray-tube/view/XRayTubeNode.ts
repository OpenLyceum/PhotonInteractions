/**
 * XRayTubeNode.ts
 *
 * A schematic Coolidge tube: a heated cathode on the left, an angled anode on
 * the right, electrons falling through the voltage between them, and X-ray
 * photons leaving the focal spot.
 *
 * Three photons stand for the spectrum: the shortest wavelength the tube can
 * make (λ_min), and two longer ones. Their wiggles shorten as the voltage rises.
 * The electrons are decoration: their number follows the current and they
 * accelerate uniformly across the gap.
 */

import { Multilink } from "scenerystack/axon";
import { roundSymmetric, Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { StringUtils } from "scenerystack/phetcommon";
import { Circle, Node, Path, Rectangle, Text } from "scenerystack/scenery";
import { formatTickValue } from "../../common/view/chartUtils.js";
import { PhotonArrowNode } from "../../common/view/PhotonArrowNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import PhotonInteractionsColors from "../../PhotonInteractionsColors.js";
import { FONTS, XRAY, XRAY_VIEW } from "../../PhotonInteractionsConstants.js";
import type { XRayTubeModel } from "../model/XRayTubeModel.js";

const TUBE_WIDTH: number = XRAY_VIEW.TUBE_WIDTH;
const TUBE_HEIGHT: number = XRAY_VIEW.TUBE_HEIGHT;

const AXIS_Y: number = XRAY_VIEW.AXIS_Y;
const CATHODE_X: number = XRAY_VIEW.CATHODE_X;
const ANODE_X: number = XRAY_VIEW.ANODE_X;
const FOCAL_SPOT = new Vector2(ANODE_X, AXIS_Y);
const ELECTRONS_PER_MA: number = XRAY_VIEW.ELECTRONS_PER_MA;
const PHOTON_LENGTH: number = XRAY_VIEW.PHOTON_LENGTH;
/** Wavelength multiples of λ_min of the three representative photons, and their directions (radians below −x). */
const PHOTONS = [
  { factor: 1, angle: 1.95 },
  { factor: 1.5, angle: 1.55 },
  { factor: 3, angle: 1.15 },
] as const;

export class XRayTubeNode extends Node {
  private readonly electrons: Circle[] = [];
  private readonly model: XRayTubeModel;
  private phase = 0;

  public constructor(model: XRayTubeModel) {
    super();
    this.model = model;
    const sm = StringManager.getInstance();
    const strings = sm.getXRayTubeStrings();
    const common = sm.getCommonStrings();

    const frame = new Rectangle(0, 0, TUBE_WIDTH, TUBE_HEIGHT, {
      fill: PhotonInteractionsColors.chartBackgroundColorProperty,
      stroke: PhotonInteractionsColors.panelBorderColorProperty,
      cornerRadius: XRAY_VIEW.TUBE_FRAME_CORNER_RADIUS,
    });
    const glass = new Rectangle(XRAY_VIEW.GLASS_X, XRAY_VIEW.GLASS_Y, XRAY_VIEW.GLASS_WIDTH, XRAY_VIEW.GLASS_HEIGHT, {
      stroke: PhotonInteractionsColors.apparatusColorProperty,
      lineWidth: XRAY_VIEW.GLASS_LINE_WIDTH,
      cornerRadius: XRAY_VIEW.GLASS_CORNER_RADIUS,
    });

    // Cathode: a focusing cup with a filament inside it.
    const cup = new Path(
      new Shape()
        .moveTo(CATHODE_X, AXIS_Y - 20)
        .lineTo(CATHODE_X - 18, AXIS_Y - 20)
        .lineTo(CATHODE_X - 18, AXIS_Y + 20)
        .lineTo(CATHODE_X, AXIS_Y + 20),
      { stroke: PhotonInteractionsColors.apparatusColorProperty, lineWidth: XRAY_VIEW.CUP_LINE_WIDTH },
    );
    const filament = new Path(
      new Shape()
        .moveTo(CATHODE_X - 10, AXIS_Y - 12)
        .lineTo(CATHODE_X - 4, AXIS_Y - 8)
        .lineTo(CATHODE_X - 10, AXIS_Y - 4)
        .lineTo(CATHODE_X - 4, AXIS_Y)
        .lineTo(CATHODE_X - 10, AXIS_Y + 4)
        .lineTo(CATHODE_X - 4, AXIS_Y + 8)
        .lineTo(CATHODE_X - 10, AXIS_Y + 12),
      {
        stroke: PhotonInteractionsColors.scatteredPhotonColorProperty,
        lineWidth: XRAY_VIEW.FILAMENT_LINE_WIDTH,
      },
    );
    const cathodeLead = new Rectangle(
      XRAY_VIEW.CATHODE_LEAD_X,
      AXIS_Y - 3,
      CATHODE_X - 26,
      XRAY_VIEW.CATHODE_LEAD_HEIGHT,
      {
        fill: PhotonInteractionsColors.apparatusColorProperty,
      },
    );

    // Anode: a block whose face is angled so the X-rays leave sideways.
    const anode = new Path(
      new Shape()
        .moveTo(ANODE_X - 12, AXIS_Y + 26)
        .lineTo(ANODE_X + 12, AXIS_Y - 26)
        .lineTo(ANODE_X + 44, AXIS_Y - 26)
        .lineTo(ANODE_X + 44, AXIS_Y + 26)
        .close(),
      {
        fill: PhotonInteractionsColors.apparatusFillColorProperty,
        stroke: PhotonInteractionsColors.apparatusColorProperty,
        lineWidth: XRAY_VIEW.ANODE_LINE_WIDTH,
      },
    );
    const anodeLead = new Rectangle(
      ANODE_X + 44,
      AXIS_Y - 3,
      TUBE_WIDTH - 8 - ANODE_X - 44,
      XRAY_VIEW.ANODE_LEAD_HEIGHT,
      {
        fill: PhotonInteractionsColors.apparatusColorProperty,
      },
    );
    const anodeSymbol = new Text("", {
      font: FONTS.PARTICLE_LABEL,
      fill: PhotonInteractionsColors.textColorProperty,
    });
    model.targetProperty.link((target) => {
      anodeSymbol.string = target.symbol;
      anodeSymbol.center = new Vector2(ANODE_X + 26, AXIS_Y);
    });

    const label = (textProperty: typeof strings.cathodeStringProperty, centerX: number, sign: string): Node => {
      const text = new Text(textProperty, {
        font: FONTS.TICK_LABEL,
        fill: PhotonInteractionsColors.secondaryTextColorProperty,
        maxWidth: XRAY_VIEW.TUBE_LABEL_MAX_WIDTH,
      });
      const signText = new Text(sign, { font: FONTS.BIG_LABEL, fill: PhotonInteractionsColors.textColorProperty });
      const place = (): void => {
        text.centerX = centerX;
        text.top = XRAY_VIEW.TUBE_LABEL_TOP;
        signText.right = text.left - XRAY_VIEW.TUBE_LABEL_RIGHT_GAP;
        signText.centerY = text.centerY;
      };
      text.localBoundsProperty.lazyLink(place);
      place();
      return new Node({ children: [text, signText] });
    };
    const voltageText = new Text("", { font: FONTS.BIG_LABEL, fill: PhotonInteractionsColors.textColorProperty });
    Multilink.multilink([common.kilovoltsPatternStringProperty, model.voltageProperty], (pattern, voltage) => {
      voltageText.string = StringUtils.fillIn(pattern, { value: formatTickValue(voltage, 0) });
      voltageText.centerX = (CATHODE_X + ANODE_X) / 2;
      voltageText.top = XRAY_VIEW.TUBE_LABEL_TOP;
    });

    for (let i = 0; i < ELECTRONS_PER_MA * XRAY.CURRENT_MAX_MA; i++) {
      this.electrons.push(
        new Circle(XRAY_VIEW.ELECTRON_DOT_RADIUS, {
          fill: PhotonInteractionsColors.electronColorProperty,
        }),
      );
    }

    const photons = PHOTONS.map(
      (_, i) =>
        new PhotonArrowNode(
          i === 0 ? PhotonInteractionsColors.limitColorProperty : PhotonInteractionsColors.photonColorProperty,
          i === 0 ? 2 : 1.5,
        ),
    );
    model.minimumWavelengthProperty.link((minimum) => {
      PHOTONS.forEach((photon, i) => {
        const direction = new Vector2(-Math.cos(photon.angle), Math.sin(photon.angle));
        // Log scale: 150 kV (8 pm) to 5 kV (250 pm), times three, has to fit between 5 and 30 px.
        const wiggle = 5 + 10 * Math.log10((photon.factor * minimum) / 8);
        photons[i]?.setArrow(
          FOCAL_SPOT.plus(direction.timesScalar(8)),
          FOCAL_SPOT.plus(direction.timesScalar(8 + PHOTON_LENGTH)),
          wiggle,
        );
      });
    });
    const minimumLabel = new Text("λₘᵢₙ", {
      font: FONTS.PARTICLE_LABEL,
      fill: PhotonInteractionsColors.limitColorProperty,
    });
    minimumLabel.center = FOCAL_SPOT.plus(
      new Vector2(-Math.cos(PHOTONS[0].angle), Math.sin(PHOTONS[0].angle)).timesScalar(PHOTON_LENGTH + 24),
    );

    this.children = [
      frame,
      cathodeLead,
      anodeLead,
      glass,
      cup,
      filament,
      ...photons,
      minimumLabel,
      ...this.electrons,
      anode,
      anodeSymbol,
      label(strings.cathodeStringProperty, CATHODE_X - 4, "−"),
      label(strings.anodeStringProperty, ANODE_X + 30, "+"),
      voltageText,
    ];
    this.clipArea = Shape.roundRect(
      0,
      0,
      TUBE_WIDTH,
      TUBE_HEIGHT,
      XRAY_VIEW.TUBE_CLIP_CORNER_X,
      XRAY_VIEW.TUBE_CLIP_CORNER_Y,
    );
    this.step(0);
  }

  /** Advances the electrons. Called every frame by the screen view. */
  public step(dt: number): void {
    // Transit rate follows the electrons' final speed, with a floor so slow ones still move.
    this.phase = (this.phase + dt * (0.35 + 1.2 * this.model.electronBetaProperty.value)) % 1;
    const count = roundSymmetric(ELECTRONS_PER_MA * this.model.currentProperty.value);
    const gap = ANODE_X - CATHODE_X - 6;
    this.electrons.forEach((electron, i) => {
      electron.visible = i < count;
      if (i < count) {
        const u = (this.phase + i / count) % 1;
        // Uniform acceleration from rest: distance grows as time squared.
        electron.centerX = CATHODE_X + gap * u * u;
        // A deterministic scatter across the beam, so the electrons are not on one line.
        electron.centerY = AXIS_Y + XRAY_VIEW.ELECTRON_STEP_Y_DIVISOR * Math.sin(i * 2.4);
      }
    });
  }
}
