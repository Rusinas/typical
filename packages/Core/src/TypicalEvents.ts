import { TypicalTextController } from '~typical/core/TypicalTextController'

import { InputHandler } from '~typical/core/EventHandlers/InputHandler'
import { TypicalSelection } from './TypicalSelection'


// function onPaste(controller: TypicalTextController, event: ClipboardEvent) {
//     event.preventDefault()
//     event.stopPropagation()
//     PasteHandler(lines, event)
// }

function onInput(controller: TypicalTextController, event: InputEvent) {
    event.stopPropagation()
    event.preventDefault()
    InputHandler(controller, event)
}

let previous_selection

function onCompositionInputStart() {
    previous_selection = TypicalSelection.getSelection()
}

function onCompositionInputEnd(controller: TypicalTextController, event: InputEvent) {
    InputHandler(controller, event, previous_selection)
}

// function onTextInput(controller: TypicalTextController, event: InputEvent) {
//     event.preventDefault()
//     // const data = event.data
//     InputHandler(controller, event)
// }

export const TypicalEvents = {
    onInput,
    // onPaste,
    // onTextInput,
    onCompositionInputStart,
    onCompositionInputEnd,
}