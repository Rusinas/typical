import { nextTick } from 'vue'
import { TypicalTextProcessor as TextProcessor } from '~typical/core/TypicalTextProcessor'
import { TypicalTextNode } from '~typical/text/TypicalText'
import { TypicalSelection, type Selection } from '~typical/core/TypicalSelection'
import { TypicalTextController } from '~typical/core/TypicalTextController'
import { EnterHandler } from './EnterHandler'
import { DeleteContentHandler } from './DeleteContentHandler'

const InputTypes = {
    insertText: 'insertText',
    deleteContentBackward: 'deleteContentBackward',
    deleteContentForward: 'deleteContentForward',
    deleteWordBackward: 'deleteWordBackward',
    deleteWordForward: 'deleteWordForward',
    insertParagraph: 'insertParagraph',
    insertLineBreak: 'insertLineBreak',
    insertCompositionText: 'insertCompositionText',
    compositionend: 'compositionend'
} as const

export type InputType = typeof InputTypes[keyof typeof InputTypes]

function InputHandler(controller: TypicalTextController, event: InputEvent, selection = TypicalSelection.getSelection()): void {
    const type = (event.inputType || event.type) as InputType

    const start_node = controller.getNode(selection.start_node_id)

    const { data } = event
    const text = start_node.text

    if (isTextInsertion(type)) {
        onInsertText(start_node, data, selection)
    }
    // Enter
    else if (isParagraphInsertion(type)) {
        if (text.standalone) {
            EnterHandler(controller, true)
        }
        else {
            EnterHandler(controller)
        }
    }
    // Shift + Enter
    else if (isLinebreakInsertion(type)) {
        EnterHandler(controller, true)
    }
    else if (isContentDeletion(type)) {
        DeleteContentHandler(controller, type)
    }

    text.normalize()
}

const isTextInsertion = (type: InputType): boolean => {
    return type === 'insertText' || type === 'compositionend'
}

const isParagraphInsertion = (type: InputType): boolean => {
    return type === 'insertParagraph'
}

const isLinebreakInsertion = (type: InputType): boolean => {
    return type === 'insertLineBreak'
}

const isContentDeletion = (type: InputType): boolean => {
    return type === 'deleteContentBackward'
        || type === 'deleteContentForward'
        || type === 'deleteWordBackward'
        || type === 'deleteWordForward'
}

function onInsertText(node, data, selection) {
    if (selection.collapsed) {
        insertData(node, data, selection)
    } 
    else {
        replaceRangeWithData(node, data, selection)
    }
}

function insertData(node: TypicalTextNode, data: string, selection: Selection) {
    TextProcessor.insertText(node, data, selection.start_index)

    nextTick(() => {
        TypicalSelection.setSelection({ start_index: selection.start_index + data.length, start_node_id: node.id })
    })
}

// If range is selected
function replaceRangeWithData(node: TypicalTextNode, data: string, selection: Selection): void {
    TextProcessor.removeRange(node, selection)
    insertData(node, data, selection)
}

export {
    InputHandler
}