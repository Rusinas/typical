import { TypicalTextNode } from '~typical/text/TypicalText'
import { TypicalSelection, type Selection } from '../TypicalSelection'
import { TypicalTextController } from '../TypicalTextController'
import { InputType } from './InputHandler'
import { TypicalTextProcessor } from '../TypicalTextProcessor'
import { nextTick } from 'vue'

export function DeleteContentHandler(controller: TypicalTextController, type: InputType) {
    const selection = TypicalSelection.getSelection()
    const start_node = controller.getNode(selection.start_node_id)
    const text = start_node.text

    if (!selection.collapsed) {
        removeRange(start_node, selection)
    }
    else if (isDeletingBackward(type)) {
        const is_cursor_at_the_start = TypicalSelection.isCursorAtTheStartOfText(text)

        if (is_cursor_at_the_start) {
            dispatchBackspaceStartEvent()
        }
        else if (type === 'deleteWordBackward') {
            removeWord(start_node, selection, 'backward')
        }
        else {
            removeCharacterBackward(start_node, selection)
        }
    }
    else if (isDeletingForward(type)) {
        const is_cursor_at_the_end = TypicalSelection.isCursorAtTheEndOfText(text)

        if (is_cursor_at_the_end) {
            dispatchDeleteEndEvent()
        }
        else if (type === 'deleteWordForward') {
            removeWord(start_node, selection, 'forward')
        }
        else {
            removeCharacterForward(start_node, selection)
        }
    }
}

const isDeletingBackward = (type: InputType): boolean => {
    return type === 'deleteContentBackward'
        || type === 'deleteWordBackward'
}

const isDeletingForward = (type: InputType): boolean => {
    return type === 'deleteContentForward'
        || type === 'deleteWordForward'
}

function removeCharacterForward(node: TypicalTextNode, selection: Selection) {
    let start_node: TypicalTextNode
    let start_index: number

    if (selection.start_index === node.length) {
        if (node.next) {
            start_node = node.next
            start_index = 0
        } else {
            return
        }
    } else {
        start_node = node
        start_index = selection.start_index
    }
    
    let current_length = start_node.length

    const prev = node.prev

    const removed_length = TypicalTextProcessor.removeCharacter(start_node, start_index)

    const remainder = current_length - removed_length
    
    nextTick(() => {
        let start = start_index
        let start_node_id = start_node.id

        if (remainder === 0) {
            start = prev.length
            start_node_id = prev.id
        }

        TypicalSelection.setSelection({
            start_index: start, 
            start_node_id: start_node_id
        })
    })
}

function removeCharacterBackward(node: TypicalTextNode, selection: Selection) {
    let start_node: TypicalTextNode
    let start_index: number

    if (selection.start_index === 0) {
        if (node.prev) {
            start_node = node.prev
            start_index = start_node.length
        } else {
            return
        }
    } else {
        start_node = node
        start_index = selection.start_index
    }
    
    // Save before removing
    const prev = start_node.prev

    const removed_length = TypicalTextProcessor.removeCharacter(start_node, start_index - 1)

    nextTick(() => {
        let start = start_index - removed_length
        let start_node_id = start_node.id

        if (prev?.text?.id === node.text.id) {
            if (start === 0) {
                start_node_id = prev?.id
                start = prev?.length
            }
        }

        TypicalSelection.setSelection({
            start_index: start, 
            start_node_id: start_node_id
        })
    })
}

function removeWord(node: TypicalTextNode, selection: Selection, direction: 'forward' | 'backward') {
    const { finish_index, finish_node_id } = TypicalTextProcessor.removeWord(node, selection.start_index, direction)

    nextTick(() => {
        TypicalSelection.setSelection({
            start_index: finish_index,
            start_node_id: finish_node_id
        })
    })
}

function removeRange(node: TypicalTextNode, selection: Selection) {
    TypicalTextProcessor.removeRange(node, selection)

    nextTick(() => {
        TypicalSelection.setSelection({
            start_index: selection.start_index, 
            start_node_id: node.id
        })
    })
}

function dispatchBackspaceStartEvent() {
    const backspace_start_event = new CustomEvent('backspace:start')
    
    const selection = TypicalSelection.getSelection()
    const current_text_el = document.getElementById(selection.start_node_id)?.closest('.typical-text')

    current_text_el?.dispatchEvent(backspace_start_event)
}

function dispatchDeleteEndEvent() {
    const delete_end = new CustomEvent('delete:end')
    
    const selection = TypicalSelection.getSelection()
    const current_text_el = document.getElementById(selection.start_node_id)?.closest('.typical-text')

    current_text_el?.dispatchEvent(delete_end)
}