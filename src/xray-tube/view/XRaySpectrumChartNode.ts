/**
 * XRaySpectrumChartNode.ts
 *
 * The tube's spectrum against wavelength or against photon energy: the Kramers
 * continuum, cut off sharply at the Duane–Hunt limit, with the anode's
 * characteristic lines standing on it.
 *
 * The horizontal axis depends only on the anode, never on the voltage, so that
 * raising the voltage visibly moves the cutoff while the lines stay put. The
 * vertical axis is rescaled to the tallest feature at full current; the current
 * slider then scales the curve inside a fixed frame.
 */

import { DerivedProperty, Multilink } from "scenerystack/axon";
import { LinePlot } from "scenerystack/bamboo";
import { Range, Vector2 } from "scenerystack/dot";
import { Line, Node, RichText, Text, VBox } from "scenerystack/scenery";
import { wavelengthOfEnergy } from "../../common/model/fourMomentum.js";
import { ChartFrameNode } from "../../common/view/ChartFrameNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import PhotonInteractionsColors from "../../PhotonInteractionsColors.js";
import { FONTS, XRAY, XRAY_VIEW } from "../../PhotonInteractionsConstants.js";
import type { XRayTubeModel } from "../model/XRayTubeModel.js";
import { spectrumPerEnergy, spectrumPerWavelength } from "../model/xraySpectrum.js";

const WIDTH: number = XRAY_VIEW.SPECTRUM_WIDTH;
const HEIGHT: number = XRAY_VIEW.SPECTRUM_HEIGHT;
/** Most line labels any anode needs (tungsten: three K, three L). */
const MAX_LINE_LABELS: number = XRAY_VIEW.MAX_LINE_LABELS;
/** Extra sample points laid across each line, in units of its width, so no peak is missed. */
const LINE_SAMPLE_OFFSETS = [-4, -3, -2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3, 4];

export class XRaySpectrumChartNode extends Node {
  public constructor(model: XRayTubeModel) {
    super();
    const strings = StringManager.getInstance().getXRayTubeStrings();

    const xAxisLabelProperty = new DerivedProperty(
      [model.axisProperty, strings.wavelengthAxisStringProperty, strings.energyAxisStringProperty],
      (axis, wavelength, energy) => (axis === "energy" ? energy : wavelength),
    );

    const chart = new ChartFrameNode({
      viewWidth: WIDTH,
      viewHeight: HEIGHT,
      xRange: new Range(0, 1),
      yRange: new Range(0, XRAY_VIEW.SPECTRUM_Y_RANGE_MAX),
      xAxisLabelProperty,
      yAxisLabelProperty: strings.intensityAxisStringProperty,
      targetDivisions: 6,
    });
    const transform = chart.chartTransform;
    const curve = new LinePlot(transform, [], {
      stroke: PhotonInteractionsColors.photonColorProperty,
      lineWidth: XRAY_VIEW.SPECTRUM_CURVE_LINE_WIDTH,
    });
    const limitLine = new Line(0, 0, 0, HEIGHT, {
      stroke: PhotonInteractionsColors.limitColorProperty,
      lineWidth: XRAY_VIEW.LIMIT_LINE_WIDTH,
      lineDash: [XRAY_VIEW.LIMIT_LINE_DASH, XRAY_VIEW.LIMIT_LINE_GAP],
    });
    chart.plotLayer.children = [limitLine, curve];
    const limitLabel = new RichText("", {
      font: FONTS.TICK_LABEL,
      fill: PhotonInteractionsColors.limitColorProperty,
      maxWidth: XRAY_VIEW.LIMIT_LABEL_MAX_WIDTH,
    });
    const lineLabels: Text[] = [];
    for (let i = 0; i < MAX_LINE_LABELS; i++) {
      lineLabels.push(new Text("", { font: FONTS.TICK_LABEL, fill: PhotonInteractionsColors.textColorProperty }));
    }
    chart.overlayLayer.children = [limitLabel, ...lineLabels];

    Multilink.multilink(
      [
        model.voltageProperty,
        model.currentProperty,
        model.targetProperty,
        model.axisProperty,
        strings.duaneHuntWavelengthStringProperty,
        strings.duaneHuntEnergyStringProperty,
      ],
      (voltage, current, target, axis, wavelengthLimitLabel, energyLimitLabel) => {
        const againstEnergy = axis === "energy";
        const xMax = againstEnergy ? Math.max(target.energyMaxKeV, 1.08 * voltage) : target.wavelengthMaxPm;
        const intensityAt = (x: number): number =>
          againstEnergy ? spectrumPerEnergy(x, voltage, target) : spectrumPerWavelength(x, voltage, target);

        // Uniform samples, plus a cluster across each excited line.
        const xs: number[] = [];
        // Against energy the continuum is finite as E → 0 but the conversion is not defined at
        // E = 0 itself, so the first sample sits just inside the frame.
        for (let i = 0; i <= XRAY.SPECTRUM_SAMPLES; i++) {
          xs.push((xMax * Math.max(i, 1e-3)) / XRAY.SPECTRUM_SAMPLES);
        }
        const excited = model.excitedLinesProperty.value;
        const lineX = (energyKeV: number): number => (againstEnergy ? energyKeV : wavelengthOfEnergy(energyKeV));
        for (const line of excited) {
          const centre = lineX(line.energyKeV);
          for (const offset of LINE_SAMPLE_OFFSETS) {
            const x = centre * (1 + offset * XRAY.LINE_RELATIVE_SIGMA);
            if (x > 0 && x < xMax) {
              xs.push(x);
            }
          }
        }
        // The cutoff itself, so the curve drops to zero exactly there.
        const limitX = againstEnergy ? voltage : wavelengthOfEnergy(voltage);
        xs.push(limitX);
        xs.sort((a, b) => a - b);

        const raw = xs.map((x) => intensityAt(x));
        const peak = Math.max(...raw, 1e-30);
        const scale = current / XRAY.CURRENT_MAX_MA / peak;
        chart.setRanges(new Range(0, xMax), new Range(0, XRAY_VIEW.SPECTRUM_Y_RANGE_MAX_RESET));
        curve.setDataSet(xs.map((x, i) => new Vector2(x, (raw[i] ?? 0) * scale)));

        limitLine.x = transform.modelToViewX(limitX);
        limitLine.visible = limitX <= xMax;
        limitLabel.string = againstEnergy ? energyLimitLabel : wavelengthLimitLabel;
        limitLabel.visible = limitLine.visible;
        // Beside the cutoff, on the empty side: left of it against wavelength if there is room.
        if (againstEnergy) {
          limitLabel.right = Math.min(WIDTH - XRAY_VIEW.LIMIT_LINE_RIGHT_INSET, limitLine.x + limitLabel.width + 6);
        } else {
          limitLabel.left = limitLine.x + XRAY_VIEW.LIMIT_LABEL_LEFT_GAP;
        }
        limitLabel.bottom = HEIGHT - XRAY_VIEW.LIMIT_LABEL_BOTTOM_GAP;

        // Each label sits just above its peak, and is raised until it clears the labels already placed
        // (tungsten's Kα₁ and Kα₂ are a few pixels apart).
        const placed: Text[] = [];
        lineLabels.forEach((label, i) => {
          const line = excited[i];
          const x = line ? lineX(line.energyKeV) : 0;
          label.visible = line !== undefined && x < xMax;
          if (line && label.visible) {
            label.string = line.label;
            label.centerX = Math.max(
              label.width / 2 + 2,
              Math.min(WIDTH - label.width / 2 - 2, transform.modelToViewX(x)),
            );
            label.bottom = Math.max(XRAY_VIEW.LINE_LABEL_BOTTOM, transform.modelToViewY(intensityAt(x) * scale) - 3);
            while (label.top > 0 && placed.some((other) => other.bounds.dilated(1).intersectsBounds(label.bounds))) {
              label.bottom -= XRAY_VIEW.SPECTRUM_BOTTOM_INSET;
            }
            placed.push(label);
          }
        });
      },
    );

    this.children = [
      new VBox({
        align: "left",
        spacing: XRAY_VIEW.SPECTRUM_CHILDREN_SPACING,
        children: [
          new Text(strings.spectrumTitleStringProperty, {
            font: FONTS.CHART_TITLE,
            fill: PhotonInteractionsColors.textColorProperty,
            maxWidth: WIDTH + XRAY_VIEW.SPECTRUM_TITLE_WIDTH_PAD,
          }),
          chart,
        ],
      }),
    ];
  }
}
