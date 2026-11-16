import { MOSELEY_CHART_NODE_SETTINGS } from "../../PhotonInteractionsConstants.js";
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
import { FONTS } from "../../PhotonInteractionsConstants.js";
import type { XRayTubeModel } from "../model/XRayTubeModel.js";
import { moseleyKAlphaEnergy, moseleyOrdinate } from "../model/xraySpectrum.js";
import { XRAY_TARGETS } from "../model/xrayTargets.js";

const WIDTH: number = MOSELEY_CHART_NODE_SETTINGS.WIDTH;
const HEIGHT: number = MOSELEY_CHART_NODE_SETTINGS.HEIGHT;
const Z_MAX: number = MOSELEY_CHART_NODE_SETTINGS.Z_MAX;
const ORDINATE_MAX: number = MOSELEY_CHART_NODE_SETTINGS.ORDINATE_MAX;

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
        lineWidth: MOSELEY_CHART_NODE_SETTINGS.LAW_LINE_WIDTH,
        lineDash: [
          MOSELEY_CHART_NODE_SETTINGS.LAW_LINE_DASH_DASH,
          MOSELEY_CHART_NODE_SETTINGS.CONSTRUCTOR_LAW_LINE_DASH_DASH,
        ],
      },
    );
    chart.plotLayer.children = [law];

    const lawLabel = new Text(strings.moseleyLawStringProperty, {
      font: FONTS.TICK_LABEL,
      fill: PhotonInteractionsColors.secondaryTextColorProperty,
      maxWidth: MOSELEY_CHART_NODE_SETTINGS.LAW_LABEL_MAX_WIDTH,
    });
    const placeLawLabel = (): void => {
      lawLabel.left = MOSELEY_CHART_NODE_SETTINGS.LEFT_LEFT;
      lawLabel.top = MOSELEY_CHART_NODE_SETTINGS.TOP_TOP;
    };
    lawLabel.localBoundsProperty.lazyLink(placeLawLabel);
    placeLawLabel();

    const points = XRAY_TARGETS.map((target) => {
      const position = new Vector2(
        transform.modelToViewX(target.atomicNumber),
        transform.modelToViewY(moseleyOrdinate(target.kAlphaKeV)),
      );
      const dot = new Circle(MOSELEY_CHART_NODE_SETTINGS.DOT_RADIUS, { center: position });
      const symbol = new Text(target.symbol, { font: FONTS.TICK_LABEL });
      symbol.centerX = position.x + 2;
      symbol.top = position.y + MOSELEY_CHART_NODE_SETTINGS.POINTS_TOP_OFFSET;
      return { target, dot, symbol };
    });
    model.targetProperty.link((current) => {
      for (const point of points) {
        const selected = point.target === current;
        const paint = selected
          ? PhotonInteractionsColors.photonColorProperty
          : PhotonInteractionsColors.secondaryTextColorProperty;
        point.dot.fill = paint;
        point.dot.radius = selected ? MOSELEY_CHART_NODE_SETTINGS.CONSTRUCTOR_RADIUS : 4;
        point.symbol.fill = paint;
      }
    });
    chart.overlayLayer.children = [lawLabel, ...points.flatMap((point) => [point.dot, point.symbol])];

    this.children = [
      new VBox({
        align: "left",
        spacing: MOSELEY_CHART_NODE_SETTINGS.CHILDREN_SPACING,
        children: [
          new Text(strings.moseleyTitleStringProperty, {
            font: FONTS.CHART_TITLE,
            fill: PhotonInteractionsColors.textColorProperty,
            maxWidth: WIDTH + MOSELEY_CHART_NODE_SETTINGS.CONSTRUCTOR_MAX_WIDTH_OFFSET,
          }),
          chart,
        ],
      }),
    ];
    this.visibleProperty = model.showMoseleyProperty;
  }
}
