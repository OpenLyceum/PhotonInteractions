/**
 * ComptonKeyboardHelpContent.ts
 *
 * Content for the keyboard-help dialog (the "?" button in the navigation bar):
 * the sliders that set this screen's quantities, and the basic actions.
 */

import {
  BasicActionsKeyboardHelpSection,
  KeyboardHelpIconFactory,
  KeyboardHelpSection,
  KeyboardHelpSectionRow,
  SliderControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";
import { StringManager } from "../../i18n/StringManager.js";

export class ComptonKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    const strings = StringManager.getInstance().getComptonStrings();
    super(
      [
        new SliderControlsKeyboardHelpSection(),
        new KeyboardHelpSection(strings.detectorDragTitleStringProperty, [
          KeyboardHelpSectionRow.labelWithIconList(
            strings.detectorDragHelpStringProperty,
            [
              KeyboardHelpIconFactory.leftRightOrADKeysRowIcon(),
              KeyboardHelpIconFactory.shiftPlusIcon(KeyboardHelpIconFactory.leftRightOrADKeysRowIcon()),
            ],
            { labelInnerContent: strings.detectorDragHelpStringProperty, labelOptions: { lineWrap: 220 } },
          ),
        ]),
      ],
      [new BasicActionsKeyboardHelpSection({ withCheckboxContent: true })],
    );
  }
}
