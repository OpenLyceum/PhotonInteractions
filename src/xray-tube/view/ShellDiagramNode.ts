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
import { FONTS } from "../../PhotonInteractionsConstants.js";
import type { XRayTubeModel } from "../model/XRayTubeModel.js";

export const SHELL_WIDTH = 290;
export const SHELL_HEIGHT = 150;

const CENTER = new Vector2(74, 92);
const SHELLS = [
  { name: "K", radius: 16, electrons: 2 },
  { name: "L", radius: 34, electrons: 8 },
  { name: "M", radius: 52, electrons: 12 },
] as const;

export class ShellDiagramNode extends Node {
  public constructor(model: XRayTubeModel) {
    super();
    const strings = StringManager.getInstance().getXRayTubeStrings();

    const frame = new Rectangle(0, 0, SHELL_WIDTH, SHELL_HEIGHT, {
      fill: PhotonInteractionsColors.chartBackgroundColorProperty,
      stroke: PhotonInteractionsColors.panelBorderColorProperty,
      cornerRadius: 6,
    });
    const title = new Text(strings.shellTitleStringProperty, {
      font: FONTS.CHART_TITLE,
      fill: PhotonInteractionsColors.textColorProperty,
      maxWidth: SHELL_WIDTH - 20,
      left: 10,
      top: 8,
    });

    const nucleus = new Circle(6, { fill: PhotonInteractionsColors.nucleusColorProperty, center: CENTER });
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
        const dot = new Circle(3, { fill: PhotonInteractionsColors.electronColorProperty, center: position });
        electrons.push(dot);
        if (shell.name === "K" && i === 0) {
          // The same spot, drawn hollow once the electron has been knocked out.
          vacancy = new Circle(3, {
            stroke: PhotonInteractionsColors.limitColorProperty,
            lineWidth: 1.5,
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
        tailWidth: 2,
        headWidth: 7,
        headHeight: 7,
      });
      const text = new Text(label, { font: FONTS.PARTICLE_LABEL, fill: PhotonInteractionsColors.photonColorProperty });
      text.left = CENTER.x + SHELLS[2].radius + 8;
      text.centerY = CENTER.y - 34 + (offsetY > 0 ? 18 : 0);
      return new Node({ children: [arrow, text] });
    };
    const transitions = new Node({
      children: [transition(SHELLS[1].radius, -5, "Kα:  L → K"), transition(SHELLS[2].radius, 5, "Kβ:  M → K")],
    });

    const caption = new RichText("", {
      font: FONTS.TICK_LABEL,
      fill: PhotonInteractionsColors.textColorProperty,
      lineWrap: 130,
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
        caption.left = CENTER.x + SHELLS[2].radius + 8;
        caption.top = ionized ? CENTER.y + 4 : CENTER.y - 30;
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
