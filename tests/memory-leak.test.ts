/**
 * Memory-leak regression suite (fleet standard).
 *
 * List every model/view object that links Properties, adds listeners, or owns child
 * nodes, with a factory that builds a fresh instance. The shared harness in
 * tests/helpers/memoryLeak.ts (template-owned) checks that each one is garbage
 * collected after dispose() and leaves no survivors across repeated cycles
 * (idempotentDispose: true also checks a second dispose()). Add sim-specific leak
 * tests below using forceGC().
 *
 * This sim creates nothing at runtime: every screen's nodes live as long as the
 * screen and are never disposed. The cases below are the two reusable nodes that
 * could be created dynamically. EquationNode is built against one long-lived
 * Property shared by every cycle, so a listener left on it would keep the node
 * reachable and fail the test.
 */

import { BooleanProperty } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { EquationNode } from "../src/common/view/EquationNode.js";
import { PhotonArrowNode } from "../src/common/view/PhotonArrowNode.js";
import { describeDisposalLeaks } from "./helpers/memoryLeak.js";

const sharedVisibleProperty = new BooleanProperty(true);

describeDisposalLeaks([
  {
    name: "PhotonArrowNode",
    create: () => {
      const node = new PhotonArrowNode("yellow");
      node.setArrow(Vector2.ZERO, new Vector2(100, 40), 12);
      return node;
    },
  },
  { name: "EquationNode", create: () => new EquationNode("E = hf", sharedVisibleProperty, 200) },
]);
