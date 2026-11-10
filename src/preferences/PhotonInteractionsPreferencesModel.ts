/**
 * PhotonInteractionsPreferencesModel.ts
 *
 * Model for the simulation-specific preferences shown in Preferences →
 * Simulation. Each preference Property takes its initial value from the
 * corresponding query parameter in photonInteractionsQueryParameters.
 *
 * Remove the example preference (and its query parameter / UI control) if the
 * sim has no sim-specific preferences.
 */

import { BooleanProperty } from "scenerystack/axon";
import type { Tandem } from "scenerystack/tandem";
import PhotonInteractionsNamespace from "../PhotonInteractionsNamespace.js";
import photonInteractionsQueryParameters from "./photonInteractionsQueryParameters.js";

export class PhotonInteractionsPreferencesModel {
  /** Whether each screen shows its governing equation; initial value from the `showEquations` query parameter. */
  public readonly showEquationsProperty: BooleanProperty;

  public constructor(tandem?: Tandem) {
    this.showEquationsProperty = new BooleanProperty(
      photonInteractionsQueryParameters.showEquations,
      tandem ? { tandem: tandem.createTandem("showEquationsProperty") } : undefined,
    );
  }

  public reset(): void {
    this.showEquationsProperty.reset();
  }
}

PhotonInteractionsNamespace.register("PhotonInteractionsPreferencesModel", PhotonInteractionsPreferencesModel);
