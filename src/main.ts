/**
 * main.ts
 *
 * Entry point for the simulation. Initializes SceneryStack, creates the
 * screens, and starts the main event loop.
 *
 * !! CRITICAL IMPORT ORDER !!
 * brand.js MUST be the first import. Each module imports the next, so the import nesting is
 *
 *   main → brand → splash → assert → init
 *
 * and therefore the actual EXECUTION order (deepest import runs first) is the reverse:
 *
 *   init → assert → splash → brand → main
 *
 * SceneryStack requires this exact load order. Never reorder these imports.
 */

// brand.js MUST be first; importing it runs the whole chain (init→assert→splash→brand) before main.
import "./brand.js";

import { onReadyToLaunch, PreferencesModel, Sim } from "scenerystack/sim";
import { Tandem } from "scenerystack/tandem";
import { AnnihilationScreen } from "./annihilation/AnnihilationScreen.js";
import { ComptonScreen } from "./compton/ComptonScreen.js";
import { StringManager } from "./i18n/StringManager.js";
import PhotonInteractionsColors from "./PhotonInteractionsColors.js";
import { PairProductionScreen } from "./pair-production/PairProductionScreen.js";
import { PhotonInteractionsPreferencesModel } from "./preferences/PhotonInteractionsPreferencesModel.js";
import { PhotonInteractionsPreferencesNode } from "./preferences/PhotonInteractionsPreferencesNode.js";
import { XRayTubeScreen } from "./xray-tube/XRayTubeScreen.js";

onReadyToLaunch(() => {
  const stringManager = StringManager.getInstance();

  // Simulation-specific preferences; initial values come from photonInteractionsQueryParameters.
  const simPreferences = new PhotonInteractionsPreferencesModel(Tandem.ROOT.createTandem("preferences"));

  const screens = [
    new ComptonScreen({
      name: stringManager.getScreenNames().comptonStringProperty,
      tandem: Tandem.ROOT.createTandem("comptonScreen"),
      backgroundColorProperty: PhotonInteractionsColors.backgroundColorProperty,
      showEquationsProperty: simPreferences.showEquationsProperty,
    }),
    new XRayTubeScreen({
      name: stringManager.getScreenNames().xrayTubeStringProperty,
      tandem: Tandem.ROOT.createTandem("xrayTubeScreen"),
      backgroundColorProperty: PhotonInteractionsColors.backgroundColorProperty,
      showEquationsProperty: simPreferences.showEquationsProperty,
    }),
    new PairProductionScreen({
      name: stringManager.getScreenNames().pairProductionStringProperty,
      tandem: Tandem.ROOT.createTandem("pairProductionScreen"),
      backgroundColorProperty: PhotonInteractionsColors.backgroundColorProperty,
      showEquationsProperty: simPreferences.showEquationsProperty,
    }),
    new AnnihilationScreen({
      name: stringManager.getScreenNames().annihilationStringProperty,
      tandem: Tandem.ROOT.createTandem("annihilationScreen"),
      backgroundColorProperty: PhotonInteractionsColors.backgroundColorProperty,
      showEquationsProperty: simPreferences.showEquationsProperty,
    }),
  ];

  const sim = new Sim(stringManager.getTitleStringProperty(), screens, {
    preferencesModel: new PreferencesModel({
      visualOptions: {
        // Adds a "Projector Mode" toggle in Preferences → Visual
        supportsProjectorMode: true,
        // Enables keyboard-navigation highlight outlines
        supportsInteractiveHighlights: true,
      },
      simulationOptions: {
        customPreferences: [
          {
            createContent: (tandem: Tandem) => new PhotonInteractionsPreferencesNode(simPreferences, tandem),
          },
        ],
      },
      localizationOptions: {
        // Adds a language picker in Preferences → Language
        supportsDynamicLocale: true,
      },
    }),

    // Optional: fill in credits shown in Help → About
    credits: {
      leadDesign: "",
      softwareDevelopment: "",
      team: "",
      qualityAssurance: "",
    },
  });

  sim.start();
});
