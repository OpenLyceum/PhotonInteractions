/**
 * ShellDiagramNode.ts
 *
 * Where a characteristic line comes from: an incident electron knocks an
 * electron out of the K shell of an anode atom, and an electron from the L or M
 * shell drops into the hole, emitting a photon whose energy is the difference
 * of the two levels (Kα from L, Kβ from M). Nothing happens until the incident
 * electron has more energy than the K shell's binding energy.
 */

import { Multilink } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { Circle, Node, Rectangle, RichText, Text } from "scenerystack/scenery";
import { ArrowNode } from "scenerystack/scenery-phet";
import { StringManager } from "../../i18n/StringManager.js";
import PhotonInteractionsColors from "../../PhotonInteractionsColors.js";
import { FONTS, XRAY_VIEW } from "../../PhotonInteractionsConstants.js";
import type { XRayTubeModel } from "../model/XRayTubeModel.js";

export const SHELL_WIDTH: number = XRAY_VIEW.SHELL_WIDTH;
const SHELL_HEIGHT: number = XRAY_VIEW.SHELL_HEIGHT;

const CENTER = new Vector2(XRAY_VIEW.CENTER_X, XRAY_VIEW.CENTER_Y);
const SHELLS = [
  { name: "K", radius: XRAY_VIEW.K_SHELL_RADIUS, electrons: 2 },
  { name: "L", radius: XRAY_VIEW.L_SHELL_RADIUS, electrons: 8 },
  { name: "M", radius: XRAY_VIEW.M_SHELL_RADIUS, electrons: 12 },
] as const;

export class ShellDiagramNode extends Node {
  public constructor(model: XRayTubeModel) {
    super();
    const strings = StringManager.getInstance().getXRayTubeStrings();

    const frame = new Rectangle(0, 0, SHELL_WIDTH, SHELL_HEIGHT, {
      fill: PhotonInteractionsColors.chartBackgroundColorProperty,
      stroke: PhotonInteractionsColors.panelBorderColorProperty,
      cornerRadius: XRAY_VIEW.SHELL_FRAME_CORNER_RADIUS,
    });
    const title = new Text(strings.shellTitleStringProperty, {
      font: FONTS.CHART_TITLE,
      fill: PhotonInteractionsColors.textColorProperty,
      maxWidth: SHELL_WIDTH - XRAY_VIEW.SHELL_TITLE_WIDTH_INSET,
      left: XRAY_VIEW.SHELL_TITLE_LEFT,
      top: XRAY_VIEW.SHELL_TITLE_TOP,
    });

    const nucleus = new Circle(XRAY_VIEW.NUCLEUS_RADIUS, {
      fill: PhotonInteractionsColors.nucleusColorProperty,
      center: CENTER,
    });
    const rings: Node[] = [];
    const electrons: Node[] = [];
    let vacancy: Circle | null = null;
    for (const shell of SHELLS) {
      rings.push(
        new Circle(shell.radius, {
          stroke: PhotonInteractionsColors.apparatusColorProperty,
          lineWidth: 1,
          center: CENTER,
        }),
      );
      const shellLabel = new Text(shell.name, {
        font: FONTS.TICK_LABEL,
        fill: PhotonInteractionsColors.secondaryTextColorProperty,
      });
      shellLabel.center = CENTER.plusXY(0, -shell.radius - 7);
      rings.push(shellLabel);
      for (let i = 0; i < shell.electrons; i++) {
        // Start on the right so the K electron that gets knocked out faces the transition arrows.
        const position = CENTER.plus(Vector2.createPolar(shell.radius, (2 * Math.PI * i) / shell.electrons));
        const dot = new Circle(XRAY_VIEW.SHELL_ELECTRON_DOT_RADIUS, {
          fill: PhotonInteractionsColors.electronColorProperty,
          center: position,
        });
        electrons.push(dot);
        if (shell.name === "K" && i === 0) {
          // The same spot, drawn hollow once the electron has been knocked out.
          vacancy = new Circle(XRAY_VIEW.VACANCY_RADIUS, {
            stroke: PhotonInteractionsColors.limitColorProperty,
            lineWidth: XRAY_VIEW.VACANCY_LINE_WIDTH,
            center: position,
          });
          model.kShellIonizedProperty.link((ionized) => {
            dot.visible = !ionized;
          });
        }
      }
    }

    // Transitions into the K-shell hole, from the L and M electrons on the same radius.
    const hole = CENTER.plusXY(SHELLS[0].radius, 0);
    const transition = (fromRadius: number, offsetY: number, label: string): Node => {
      const arrow = new ArrowNode(CENTER.x + fromRadius - 4, CENTER.y + offsetY, hole.x + 5, hole.y + offsetY, {
        fill: PhotonInteractionsColors.photonColorProperty,
        stroke: null,
        tailWidth: XRAY_VIEW.TRANSITION_ARROW_TAIL_WIDTH,
        headWidth: XRAY_VIEW.TRANSITION_ARROW_HEAD_WIDTH,
        headHeight: XRAY_VIEW.TRANSITION_ARROW_HEAD_HEIGHT,
      });
      const text = new Text(label, { font: FONTS.PARTICLE_LABEL, fill: PhotonInteractionsColors.photonColorProperty });
      text.left = CENTER.x + SHELLS[2].radius + XRAY_VIEW.TRANSITION_LABEL_LEFT_GAP;
      text.centerY = CENTER.y - XRAY_VIEW.TRANSITION_BASE_Y_OFFSET + (offsetY > 0 ? XRAY_VIEW.TRANSITION_EXTRA_Y : 0);
      return new Node({ children: [arrow, text] });
    };
    const transitions = new Node({
      children: [
        transition(SHELLS[1].radius, XRAY_VIEW.KA_TRANSITION_Y_OFFSET, "Kα:  L → K"),
        transition(SHELLS[2].radius, XRAY_VIEW.KB_TRANSITION_Y_OFFSET, "Kβ:  M → K"),
      ],
    });

    const caption = new RichText("", {
      font: FONTS.TICK_LABEL,
      fill: PhotonInteractionsColors.textColorProperty,
      lineWrap: XRAY_VIEW.CAPTION_LINE_WRAP,
    });
    Multilink.multilink(
      [model.kShellIonizedProperty, strings.belowEdgeStringProperty, strings.aboveEdgeStringProperty],
      (ionized, below, above) => {
        transitions.visible = ionized;
        if (vacancy) {
          vacancy.visible = ionized;
        }
        caption.string = ionized ? above : below;
        caption.fill = ionized
          ? PhotonInteractionsColors.textColorProperty
          : PhotonInteractionsColors.limitColorProperty;
        caption.left = CENTER.x + SHELLS[2].radius + XRAY_VIEW.SHELL_CAPTION_LEFT_GAP;
        caption.top = ionized ? CENTER.y + XRAY_VIEW.SHELL_CAPTION_TOP_GAP : CENTER.y - 30;
      },
    );

    this.children = [
      frame,
      title,
      ...rings,
      nucleus,
      ...electrons,
      ...(vacancy ? [vacancy] : []),
      transitions,
      caption,
    ];
  }
}
