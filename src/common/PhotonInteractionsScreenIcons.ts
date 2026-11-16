/**
 * PhotonInteractionsScreenIcons.ts
 *
 * Programmatic home-screen / navigation-bar icons for each screen, drawn in the
 * sim's own colour language (yellow photon, orange scattered photon, cyan
 * electron, pink positron, violet nucleus).
 *
 * Each motif is drawn in a small 137 × 93 space, the size at which the wavy
 * photon arrows look right, and scaled up fourfold to the standard 548 × 373
 * icon canvas.
 */
import { Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Circle, Line, Node, Path, Rectangle, type TPaint } from "scenerystack/scenery";
import { ArrowNode } from "scenerystack/scenery-phet";
import { ScreenIcon } from "scenerystack/sim";
import PhotonInteractionsColors from "../PhotonInteractionsColors.js";
import { PHOTON_INTERACTIONS_SCREEN_ICONS_SETTINGS } from "../PhotonInteractionsConstants.js";
import { PhotonArrowNode } from "./view/PhotonArrowNode.js";

const SCALE: number = PHOTON_INTERACTIONS_SCREEN_ICONS_SETTINGS.SCALE;
const W = 548 / SCALE;
const H = 373 / SCALE;

function iconFrom(...content: Node[]): ScreenIcon {
  return new ScreenIcon(
    new Node({
      children: [
        new Rectangle(
          0,
          0,
          PHOTON_INTERACTIONS_SCREEN_ICONS_SETTINGS.ICON_FROM_WIDTH,
          PHOTON_INTERACTIONS_SCREEN_ICONS_SETTINGS.ICON_FROM_HEIGHT,
          { fill: PhotonInteractionsColors.backgroundColorProperty },
        ),
        new Node({ children: content, scale: SCALE }),
      ],
    }),
    {
      maxIconWidthProportion: 1,
      maxIconHeightProportion: 1,
      fill: PhotonInteractionsColors.backgroundColorProperty,
    },
  );
}

const photon = (x1: number, y1: number, x2: number, y2: number, paint: TPaint, wiggle: number): PhotonArrowNode => {
  const node = new PhotonArrowNode(paint, 2.5);
  node.setArrow(new Vector2(x1, y1), new Vector2(x2, y2), wiggle);
  return node;
};

const arrow = (x1: number, y1: number, x2: number, y2: number, fill: TPaint): ArrowNode =>
  new ArrowNode(x1, y1, x2, y2, {
    fill,
    stroke: null,
    headWidth: PHOTON_INTERACTIONS_SCREEN_ICONS_SETTINGS.ARROW_HEAD_WIDTH,
    headHeight: PHOTON_INTERACTIONS_SCREEN_ICONS_SETTINGS.ARROW_HEAD_HEIGHT,
    tailWidth: PHOTON_INTERACTIONS_SCREEN_ICONS_SETTINGS.ARROW_TAIL_WIDTH,
  });

/** A photon comes in, scatters upward with a longer wavelength, and the electron recoils downward. */
export function createComptonIcon(): ScreenIcon {
  const cx = 62;
  const cy = 52;
  return iconFrom(
    photon(8, cy, cx - 8, cy, PhotonInteractionsColors.photonColorProperty, 9),
    photon(cx + 5, cy - 6, cx + 48, cy - 40, PhotonInteractionsColors.scatteredPhotonColorProperty, 16),
    arrow(cx + 6, cy + 4, cx + 44, cy + 26, PhotonInteractionsColors.electronColorProperty),
    new Circle(PHOTON_INTERACTIONS_SCREEN_ICONS_SETTINGS.CREATE_COMPTON_ICON_RADIUS, {
      x: cx,
      y: cy,
      fill: PhotonInteractionsColors.electronColorProperty,
    }),
  );
}

/** A spectrum: nothing below the cutoff, a hump, and two characteristic lines. */
export function createXRayTubeIcon(): ScreenIcon {
  const left: number = PHOTON_INTERACTIONS_SCREEN_ICONS_SETTINGS.LEFT;
  const base = H - 14;
  const cutoff = 34;
  const curve = new Shape().moveTo(left, base).lineTo(cutoff, base);
  // Kramers' hump, (x − 1)/x³ in units of the cutoff, with spikes for Kα and Kβ.
  for (let i = 0; i <= 80; i++) {
    const x = 1 + (3.4 * i) / 80;
    const hump = (60 * (x - 1)) / x ** 3 / 0.148;
    const spike = 30 * Math.exp(-(((x - 2.25) / 0.035) ** 2)) + 14 * Math.exp(-(((x - 1.95) / 0.035) ** 2));
    curve.lineTo(cutoff + (x - 1) * 26, base - hump - spike);
  }
  return iconFrom(
    new Line(left, base, W - 10, base, {
      stroke: PhotonInteractionsColors.chartAxisColorProperty,
      lineWidth: PHOTON_INTERACTIONS_SCREEN_ICONS_SETTINGS.CREATE_X_RAY_TUBE_ICON_LINE_WIDTH,
    }),
    new Line(left, base, left, PHOTON_INTERACTIONS_SCREEN_ICONS_SETTINGS.CREATE_X_RAY_TUBE_ICON_END_Y, {
      stroke: PhotonInteractionsColors.chartAxisColorProperty,
      lineWidth: PHOTON_INTERACTIONS_SCREEN_ICONS_SETTINGS.CREATE_X_RAY_TUBE_ICON_LINE_WIDTH,
    }),
    new Line(cutoff, base, cutoff, PHOTON_INTERACTIONS_SCREEN_ICONS_SETTINGS.CREATE_X_RAY_TUBE_ICON_END_Y_SEGMENT_2, {
      stroke: PhotonInteractionsColors.limitColorProperty,
      lineWidth: PHOTON_INTERACTIONS_SCREEN_ICONS_SETTINGS.CREATE_X_RAY_TUBE_ICON_LINE_WIDTH,
      lineDash: [PHOTON_INTERACTIONS_SCREEN_ICONS_SETTINGS.CREATE_X_RAY_TUBE_ICON_LINE_DASH_DASH, 3],
    }),
    new Path(curve, {
      stroke: PhotonInteractionsColors.photonColorProperty,
      lineWidth: PHOTON_INTERACTIONS_SCREEN_ICONS_SETTINGS.CREATE_X_RAY_TUBE_ICON_LINE_WIDTH_VARIANT_2,
      lineJoin: "round",
    }),
  );
}

/** A photon meets a nucleus; an electron and a positron curl away in opposite senses. */
export function createPairProductionIcon(): ScreenIcon {
  const cx = 60;
  const cy = H / 2;
  const curl = (sense: number): Shape => {
    const shape = new Shape().moveTo(cx, cy);
    let x = cx;
    let y = cy;
    let heading = sense * 0.35;
    for (let s = 0; s < 150; s += 1) {
      x += Math.cos(heading);
      y += Math.sin(heading);
      shape.lineTo(x, y);
      heading += sense / (20 * Math.max(0.12, 1 - s / 190));
    }
    return shape;
  };
  return iconFrom(
    photon(6, cy, cx - 9, cy, PhotonInteractionsColors.photonColorProperty, 9),
    new Path(curl(-1), {
      stroke: PhotonInteractionsColors.electronColorProperty,
      lineWidth: PHOTON_INTERACTIONS_SCREEN_ICONS_SETTINGS.CREATE_PAIR_PRODUCTION_ICON_LINE_WIDTH,
    }),
    new Path(curl(1), {
      stroke: PhotonInteractionsColors.positronColorProperty,
      lineWidth: PHOTON_INTERACTIONS_SCREEN_ICONS_SETTINGS.CREATE_PAIR_PRODUCTION_ICON_LINE_WIDTH,
    }),
    new Circle(PHOTON_INTERACTIONS_SCREEN_ICONS_SETTINGS.CREATE_PAIR_PRODUCTION_ICON_RADIUS, {
      x: cx,
      y: cy,
      fill: PhotonInteractionsColors.nucleusColorProperty,
    }),
  );
}

/** A positron and an electron side by side, and two photons leaving back to back. */
export function createAnnihilationIcon(): ScreenIcon {
  const cx = W / 2;
  const cy = H / 2;
  return iconFrom(
    photon(cx - 14, cy - 5, 10, cy - 30, PhotonInteractionsColors.photonColorProperty, 11),
    photon(cx + 14, cy + 5, W - 10, cy + 30, PhotonInteractionsColors.scatteredPhotonColorProperty, 11),
    new Circle(PHOTON_INTERACTIONS_SCREEN_ICONS_SETTINGS.CREATE_ANNIHILATION_ICON_RADIUS, {
      x: cx - PHOTON_INTERACTIONS_SCREEN_ICONS_SETTINGS.CREATE_ANNIHILATION_ICON_X_OFFSET,
      y: cy,
      fill: PhotonInteractionsColors.positronColorProperty,
    }),
    new Circle(PHOTON_INTERACTIONS_SCREEN_ICONS_SETTINGS.CREATE_ANNIHILATION_ICON_RADIUS, {
      x: cx + PHOTON_INTERACTIONS_SCREEN_ICONS_SETTINGS.CREATE_ANNIHILATION_ICON_X_OFFSET,
      y: cy,
      fill: PhotonInteractionsColors.electronColorProperty,
    }),
  );
}
