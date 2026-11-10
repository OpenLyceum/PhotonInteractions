/**
 * ComptonChartsNode.ts
 *
 * The three graphs of the Compton screen, one shown at a time:
 *
 *   shift          λ′ − λ against θ: one universal curve, whatever the source.
 *                  A second trace, E′/E, does depend on the source.
 *   spectrometer   what Compton measured at one angle: an unshifted line and a
 *                  shifted one that walks away as θ grows.
 *   detector       the energy a gamma-ray detector records: a Klein–Nishina
 *                  continuum ending at the Compton edge, and the photopeak.
 */

import { DerivedProperty, Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { LinePlot } from "scenerystack/bamboo";
import { Range, Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { StringUtils } from "scenerystack/phetcommon";
import { Circle, Line, Node, Path, Text, VBox } from "scenerystack/scenery";
import { ChartFrameNode } from "../../common/view/ChartFrameNode.js";
import { formatEnergyParts } from "../../common/view/chartUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import PhotonInteractionsColors from "../../PhotonInteractionsColors.js";
import { COMPTON, FONTS } from "../../PhotonInteractionsConstants.js";
import type { ComptonModel } from "../model/ComptonModel.js";
import { comptonShift, scatteredEnergy, spectrometerIntensity } from "../model/compton.js";

const WIDTH = 330;
const HEIGHT = 168;
const SAMPLES = 180;

/** Top of the shift chart, pm: just above the 180° shift of 2h/mc = 4.85 pm. */
const SHIFT_AXIS_MAX_PM = 5;

type Paint = typeof PhotonInteractionsColors.textColorProperty;

const chartLabel = (content: TReadOnlyProperty<string> | string, fill: Paint): Text =>
  new Text(content, { font: FONTS.TICK_LABEL, fill, maxWidth: 110 });

const titled = (titleProperty: TReadOnlyProperty<string>, chart: Node): Node =>
  new VBox({
    align: "left",
    spacing: 6,
    children: [
      new Text(titleProperty, {
        font: FONTS.CHART_TITLE,
        fill: PhotonInteractionsColors.textColorProperty,
        maxWidth: WIDTH + 40,
      }),
      chart,
    ],
  });

export class ComptonChartsNode extends Node {
  public constructor(model: ComptonModel) {
    super();
    const strings = StringManager.getInstance().getComptonStrings();

    // ── Shift against angle ─────────────────────────────────────────────────────
    const shiftChart = new ChartFrameNode({
      viewWidth: WIDTH,
      viewHeight: HEIGHT,
      xRange: new Range(0, 180),
      yRange: new Range(0, SHIFT_AXIS_MAX_PM),
      xAxisLabelProperty: strings.shiftChartXStringProperty,
      yAxisLabelProperty: strings.shiftChartYStringProperty,
      targetDivisions: 6,
    });
    const shiftTransform = shiftChart.chartTransform;
    const shiftPoints: Vector2[] = [];
    for (let i = 0; i <= SAMPLES; i++) {
      const degrees = (180 * i) / SAMPLES;
      shiftPoints.push(new Vector2(degrees, comptonShift((degrees * Math.PI) / 180)));
    }
    const shiftCurve = new LinePlot(shiftTransform, shiftPoints, {
      stroke: PhotonInteractionsColors.scatteredPhotonColorProperty,
      lineWidth: 2.5,
    });
    // E′/E shares the plot, scaled so that 1 is the top of the frame; its own axis is on the right.
    const ratioCurve = new LinePlot(shiftTransform, [], {
      stroke: PhotonInteractionsColors.electronColorProperty,
      lineWidth: 2,
      lineDash: [6, 4],
    });
    shiftChart.plotLayer.children = [ratioCurve, shiftCurve];
    const shiftMarker = new Circle(5, { fill: PhotonInteractionsColors.scatteredPhotonColorProperty });
    const ratioMarker = new Circle(4, { fill: PhotonInteractionsColors.electronColorProperty });
    const ratioTicks = [0, 0.5, 1].map((value) => {
      const tick = chartLabel(String(value), PhotonInteractionsColors.electronColorProperty);
      tick.left = WIDTH + 5;
      tick.centerY = shiftTransform.modelToViewY(value * SHIFT_AXIS_MAX_PM);
      return tick;
    });
    const ratioAxisLabel = chartLabel(
      strings.energyRatioStringProperty,
      PhotonInteractionsColors.electronColorProperty,
    );
    ratioAxisLabel.rotation = -Math.PI / 2;
    const placeRatioAxisLabel = (): void => {
      ratioAxisLabel.left = WIDTH + 24;
      ratioAxisLabel.centerY = HEIGHT / 2;
    };
    ratioAxisLabel.localBoundsProperty.lazyLink(placeRatioAxisLabel);
    placeRatioAxisLabel();
    shiftChart.overlayLayer.children = [...ratioTicks, ratioAxisLabel, ratioMarker, shiftMarker];

    model.energyProperty.link((energy) => {
      const points: Vector2[] = [];
      for (let i = 0; i <= SAMPLES; i++) {
        const degrees = (180 * i) / SAMPLES;
        points.push(
          new Vector2(degrees, (SHIFT_AXIS_MAX_PM * scatteredEnergy(energy, (degrees * Math.PI) / 180)) / energy),
        );
      }
      ratioCurve.setDataSet(points);
    });
    Multilink.multilink(
      [model.angleDegreesProperty, model.shiftProperty, model.energyProperty, model.scatteredEnergyProperty],
      (degrees, shift, energy, scattered) => {
        const x = shiftTransform.modelToViewX(degrees);
        shiftMarker.center = new Vector2(x, shiftTransform.modelToViewY(shift));
        ratioMarker.center = new Vector2(x, shiftTransform.modelToViewY((SHIFT_AXIS_MAX_PM * scattered) / energy));
      },
    );

    // ── Spectrometer ────────────────────────────────────────────────────────────
    const spectrometerChart = new ChartFrameNode({
      viewWidth: WIDTH,
      viewHeight: HEIGHT,
      xRange: new Range(COMPTON.SPECTROMETER_SHIFT_MIN_PM, COMPTON.SPECTROMETER_SHIFT_MAX_PM),
      yRange: new Range(0, 1.15),
      xAxisLabelProperty: strings.spectrometerXStringProperty,
      yAxisLabelProperty: strings.spectrometerYStringProperty,
      targetDivisions: 6,
    });
    const spectrometerTransform = spectrometerChart.chartTransform;
    const spectrometerCurve = new LinePlot(spectrometerTransform, [], {
      stroke: PhotonInteractionsColors.textColorProperty,
      lineWidth: 2,
    });
    const verticalLine = (stroke: Paint): Line => new Line(0, 0, 0, HEIGHT, { stroke, lineDash: [4, 4] });
    const unshiftedLine = verticalLine(PhotonInteractionsColors.photonColorProperty);
    unshiftedLine.x = spectrometerTransform.modelToViewX(0);
    const shiftedLine = verticalLine(PhotonInteractionsColors.scatteredPhotonColorProperty);
    spectrometerChart.plotLayer.children = [unshiftedLine, shiftedLine, spectrometerCurve];
    const unshiftedLabel = chartLabel(strings.unshiftedStringProperty, PhotonInteractionsColors.photonColorProperty);
    const shiftedLabel = chartLabel(
      strings.shiftedStringProperty,
      PhotonInteractionsColors.scatteredPhotonColorProperty,
    );
    spectrometerChart.overlayLayer.children = [unshiftedLabel, shiftedLabel];

    Multilink.multilink(
      [
        model.wavelengthProperty,
        model.thetaProperty,
        model.includeBoundProperty,
        unshiftedLabel.localBoundsProperty,
        shiftedLabel.localBoundsProperty,
      ],
      (wavelength, theta, includeBound) => {
        const points: Vector2[] = [];
        const span = COMPTON.SPECTROMETER_SHIFT_MAX_PM - COMPTON.SPECTROMETER_SHIFT_MIN_PM;
        const count = 2 * SAMPLES;
        for (let i = 0; i <= count; i++) {
          const shift = COMPTON.SPECTROMETER_SHIFT_MIN_PM + (span * i) / count;
          points.push(new Vector2(shift, spectrometerIntensity(shift, wavelength, theta, includeBound)));
        }
        spectrometerCurve.setDataSet(points);
        const shiftedX = spectrometerTransform.modelToViewX(comptonShift(theta));
        shiftedLine.x = shiftedX;
        unshiftedLine.visible = includeBound;
        unshiftedLabel.visible = includeBound;
        // Labels along the top of the frame, the shifted one a row lower when the two would collide.
        unshiftedLabel.centerX = unshiftedLine.x;
        unshiftedLabel.top = 3;
        shiftedLabel.centerX = Math.min(WIDTH - shiftedLabel.width / 2 - 3, shiftedX);
        const collide = includeBound && shiftedLabel.left < unshiftedLabel.right + 6;
        shiftedLabel.top = collide ? 16 : 3;
      },
    );

    // ── Detector spectrum ───────────────────────────────────────────────────────
    // The axis is in whichever unit suits the photon: eV, keV or MeV.
    const axisUnitProperty = new DerivedProperty([model.energyProperty], (energy) => formatEnergyParts(energy).unit);
    const detectorXLabelProperty = new DerivedProperty(
      [strings.detectorXPatternStringProperty, axisUnitProperty],
      (pattern, unit) => StringUtils.fillIn(pattern, { unit }),
    );
    const detectorChart = new ChartFrameNode({
      viewWidth: WIDTH,
      viewHeight: HEIGHT,
      xRange: new Range(0, 1),
      yRange: new Range(0, 1),
      xAxisLabelProperty: detectorXLabelProperty,
      yAxisLabelProperty: strings.detectorYStringProperty,
      targetDivisions: 6,
    });
    const detectorTransform = detectorChart.chartTransform;
    const bars = new Path(null, { fill: PhotonInteractionsColors.histogramColorProperty });
    const expectedCurve = new LinePlot(detectorTransform, [], {
      stroke: PhotonInteractionsColors.textColorProperty,
      lineWidth: 1.5,
    });
    const edgeLine = verticalLine(PhotonInteractionsColors.limitColorProperty);
    const peakLine = verticalLine(PhotonInteractionsColors.photonColorProperty);
    detectorChart.plotLayer.children = [bars, edgeLine, peakLine, expectedCurve];
    const edgeLabel = chartLabel(strings.comptonEdgeStringProperty, PhotonInteractionsColors.limitColorProperty);
    const peakLabel = chartLabel(strings.photopeakStringProperty, PhotonInteractionsColors.photonColorProperty);
    detectorChart.overlayLayer.children = [edgeLabel, peakLabel];

    const updateDetector = (): void => {
      const energy = model.energyProperty.value;
      const unitScale = energy / Number(formatEnergyParts(energy, 12).value);
      const xMax = (COMPTON.DETECTOR_RANGE_FACTOR * energy) / unitScale;
      const binWidth = xMax / COMPTON.DETECTOR_BINS;
      const fractions = model.expectedFractionsProperty.value;
      const events = model.eventCountProperty.value;
      // Before any photon is fired the expected shape is drawn as if 1000 had been.
      const scale = events > 0 ? events : 1000;
      const yMax = Math.max(5, 1.25 * scale * Math.max(...fractions), 1.1 * Math.max(...model.histogram));
      detectorChart.setRanges(new Range(0, xMax), new Range(0, yMax));

      expectedCurve.setDataSet(fractions.map((fraction, i) => new Vector2((i + 0.5) * binWidth, fraction * scale)));

      const shape = new Shape();
      const baseline = detectorTransform.modelToViewY(0);
      model.histogram.forEach((count, i) => {
        if (count > 0) {
          const left = detectorTransform.modelToViewX(i * binWidth);
          const right = detectorTransform.modelToViewX((i + 1) * binWidth);
          const top = detectorTransform.modelToViewY(count);
          shape.rect(left, top, right - left, baseline - top);
        }
      });
      bars.shape = shape;

      edgeLine.x = detectorTransform.modelToViewX(model.comptonEdgeProperty.value / unitScale);
      peakLine.x = detectorTransform.modelToViewX(energy / unitScale);
      peakLabel.right = Math.min(WIDTH - 3, peakLine.x + peakLabel.width / 2);
      peakLabel.top = 3;
      edgeLabel.right = Math.min(peakLabel.left - 6, edgeLine.x + edgeLabel.width / 2);
      edgeLabel.top = 3;
    };
    model.histogramChangedEmitter.addListener(updateDetector);
    model.expectedFractionsProperty.link(updateDetector);
    edgeLabel.localBoundsProperty.lazyLink(updateDetector);
    peakLabel.localBoundsProperty.lazyLink(updateDetector);

    const shiftNode = titled(strings.shiftChartTitleStringProperty, shiftChart);
    const spectrometerNode = titled(strings.spectrometerTitleStringProperty, spectrometerChart);
    const detectorNode = titled(strings.detectorTitleStringProperty, detectorChart);
    model.graphProperty.link((graph) => {
      shiftNode.visible = graph === "shift";
      spectrometerNode.visible = graph === "spectrometer";
      detectorNode.visible = graph === "detector";
    });
    this.children = [shiftNode, spectrometerNode, detectorNode];
  }
}
