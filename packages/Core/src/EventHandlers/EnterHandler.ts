import { TypicalTextController } from '~typical/core/TypicalTextController'
import { TypicalSelection, type Selection } from '~typical/core/TypicalSelection'
import { ITypicalTextNode, TypicalTextNode } from '~typical/text/TypicalText'
import { TypicalTextProcessor } from '~typical/core/TypicalTextProcessor'
import { nextTick } from 'vue'
import { removeFieldDeep } from '@typical/utils'


export function EnterHandler(controller: TypicalTextController, linebreak = false) {
    const selection = TypicalSelection.getSelection()
    
    const start_node = controller.getNode(selection.start_node_id)
    const end_node = controller.getNode(selection.end_node_id)

    const is_empty = start_node.is_empty

    const text = start_node.text
    const text_el = document.getElementById(selection.start_node_id)?.closest('.typical-text') as HTMLElement

    const is_cursor_at_the_start = TypicalSelection.isCursorAtTheStartOfText(text)

    if (linebreak) {
        if (!selection.collapsed) {
            TypicalTextProcessor.removeRange(start_node, selection, false)
        }

        insertLinebreak(start_node, selection.start_index)
    }
    else if (is_cursor_at_the_start) {
        emitEnterEvent(text_el, text.toJSON())
        text.replaceData()
    }
    else if (!selection.collapsed) {
        TypicalTextProcessor.removeRange(start_node, selection, false)

        const same_text = text.id === end_node.text.id 

        if (same_text) {
            const result = end_node.text.split({
                start_node_id: start_node.id,
                start_index: selection.start_index
            })

            text.replaceData(result.before)

            const after = removeFieldDeep(result.after, ['id']) as ITypicalTextNode[]

            emitEnterEvent(text_el, after)
        }
        else {
            nextTick(() => {
                TypicalSelection.setSelection({
                    start_node_id: end_node.id,
                    start_index: 0
                })
            })
        }
    }
    else {
        const result = text.split({
            start_node_id: start_node.id,
            start_index: selection.start_index
        })

        text.replaceData(result.before)

        const after = removeFieldDeep(result.after, ['id']) as ITypicalTextNode[]

        emitEnterEvent(text_el, after)
    }
}

// function removeRange(node: TypicalTextNode, selection: Selection) {
//     TypicalTextProcessor.removeRange(node, selection)

//     nextTick(() => {
//         TypicalSelection.setSelection({
//             start_index: selection.start_index, 
//             start_node_id: selection.start_node_id
//         })
//     })
// }

function insertLinebreak(node: TypicalTextNode, index: number) {
    TypicalTextProcessor.insertText(node, '\n', index)

    nextTick(() => {
        TypicalSelection.setSelection({ start_index: index + 1, start_node_id: node.id })
    })
}

function emitEnterEvent(text: HTMLElement, data?: ITypicalTextNode[]) {
    const enter_event = new CustomEvent('enter', {
        detail: {
            data
        }
    })

    text.dispatchEvent(enter_event)
}
