/**
 * MoseleyChartNode.ts
 *
 * Moseley's plot: the square root of the Kα frequency against atomic number, for
 * the five anodes. The points fall on a straight line through Z = 1,
 * √f ∝ (Z − 1), which is what told Moseley that Z, not atomic weight, orders the
 * elements. Tungsten sits a little above the line: its inner electrons are
 * relativistic. The current anode's point is highlighted.
 */

import { LinePlot } from "scenerystack/bamboo";
import { Range, Vector2 } from "scenerystack/dot";
import { Circle, Node, Text, VBox } from "scenerystack/scenery";
import { ChartFrameNode } from "../../common/view/ChartFrameNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import PhotonInteractionsColors from "../../PhotonInteractionsColors.js";
import { FONTS, XRAY_VIEW } from "../../PhotonInteractionsConstants.js";
import type { XRayTubeModel } from "../model/XRayTubeModel.js";
import { moseleyKAlphaEnergy, moseleyOrdinate } from "../model/xraySpectrum.js";
import { XRAY_TARGETS } from "../model/xrayTargets.js";

const WIDTH: number = XRAY_VIEW.MOSELEY_WIDTH;
const HEIGHT: number = XRAY_VIEW.MOSELEY_HEIGHT;
const Z_MAX: number = XRAY_VIEW.Z_MAX;
const ORDINATE_MAX: number = XRAY_VIEW.ORDINATE_MAX;

export class MoseleyChartNode extends Node {
  public constructor(model: XRayTubeModel) {
    super();
    const strings = StringManager.getInstance().getXRayTubeStrings();

    const chart = new ChartFrameNode({
      viewWidth: WIDTH,
      viewHeight: HEIGHT,
      xRange: new Range(0, Z_MAX),
      yRange: new Range(0, ORDINATE_MAX),
      xAxisLabelProperty: strings.moseleyXStringProperty,
      yAxisLabelProperty: strings.moseleyYStringProperty,
      targetDivisions: 4,
    });
    const transform = chart.chartTransform;
    const law = new LinePlot(
      transform,
      [new Vector2(1, 0), new Vector2(Z_MAX, moseleyOrdinate(moseleyKAlphaEnergy(Z_MAX)))],
      {
        stroke: PhotonInteractionsColors.secondaryTextColorProperty,
        lineWidth: XRAY_VIEW.MOSELEY_LAW_LINE_WIDTH,
        lineDash: [XRAY_VIEW.MOSELEY_LAW_DASH, XRAY_VIEW.MOSELEY_LAW_GAP],
      },
    );
    chart.plotLayer.children = [law];

    const lawLabel = new Text(strings.moseleyLawStringProperty, {
      font: FONTS.TICK_LABEL,
      fill: PhotonInteractionsColors.secondaryTextColorProperty,
      maxWidth: XRAY_VIEW.MOSELEY_LAW_LABEL_MAX_WIDTH,
    });
    const placeLawLabel = (): void => {
      lawLabel.left = XRAY_VIEW.MOSELEY_LEFT_INSET;
      lawLabel.top = XRAY_VIEW.MOSELEY_TOP_INSET;
    };
    lawLabel.localBoundsProperty.lazyLink(placeLawLabel);
    placeLawLabel();

    const points = XRAY_TARGETS.map((target) => {
      const position = new Vector2(
        transform.modelToViewX(target.atomicNumber),
        transform.modelToViewY(moseleyOrdinate(target.kAlphaKeV)),
      );
      const dot = new Circle(XRAY_VIEW.MOSELEY_DOT_RADIUS, { center: position });
      const symbol = new Text(target.symbol, { font: FONTS.TICK_LABEL });
      symbol.centerX = position.x + 2;
      symbol.top = position.y + XRAY_VIEW.MOSELEY_POINT_TOP_GAP;
      return { target, dot, symbol };
    });
    model.targetProperty.link((current) => {
      for (const point of points) {
        const selected = point.target === current;
        const paint = selected
          ? PhotonInteractionsColors.photonColorProperty
          : PhotonInteractionsColors.secondaryTextColorProperty;
        point.dot.fill = paint;
        point.dot.radius = selected ? XRAY_VIEW.MOSELEY_SELECTED_RADIUS : 4;
        point.symbol.fill = paint;
      }
    });
    chart.overlayLayer.children = [lawLabel, ...points.flatMap((point) => [point.dot, point.symbol])];

    this.children = [
      new VBox({
        align: "left",
        spacing: XRAY_VIEW.MOSELEY_CHILDREN_SPACING,
        children: [
          new Text(strings.moseleyTitleStringProperty, {
            font: FONTS.CHART_TITLE,
            fill: PhotonInteractionsColors.textColorProperty,
            maxWidth: WIDTH + XRAY_VIEW.MOSELEY_TITLE_WIDTH_PAD,
          }),
          chart,
        ],
      }),
    ];
    this.visibleProperty = model.showMoseleyProperty;
  }
}
