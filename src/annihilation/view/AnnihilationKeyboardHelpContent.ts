/**
 * AnnihilationKeyboardHelpContent.ts
 *
 * Content for the keyboard-help dialog (the "?" button in the navigation bar):
 * the sliders that set this screen's quantities, the keyboard-draggable PET
 * tracer (PetRingNode), and the basic actions. The tracer's RichDragListener
 * uses the default "both" direction — arrows or WASD move it in 2D, Shift in
 * quarter steps — which is exactly what MoveDraggableItemsKeyboardHelpSection
 * documents.
 */

import {
  BasicActionsKeyboardHelpSection,
  MoveDraggableItemsKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";

export class AnnihilationKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super(
      [new MoveDraggableItemsKeyboardHelpSection(), new SliderControlsKeyboardHelpSection()],
      [new BasicActionsKeyboardHelpSection({ withCheckboxContent: true })],
    );
  }
}
