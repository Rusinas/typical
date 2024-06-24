import { nextTick } from 'vue'

import { Selection, TypicalSelection } from '~typical/core/TypicalSelection'
// import Helpers from '../../helpers/Helpers'
import { TypicalTextProcessor } from '~typical/core/TypicalTextProcessor'

function PasteHandler(lines: Lines, event: ClipboardEvent) {
    const is_empty = lines.is_empty
    const selection = TypicalSelection.getSelection(lines)

    const is_cursor_at_the_start = Helpers.isCursorAtTheStart(lines, selection)
    const is_cursor_at_the_end = Helpers.isCursorAtTheEnd(lines, selection)

    const line = lines.findLine(Typicalselection.start_line.id)

    if (!line) {
        throw new Error('Line with given ID was not found in lines')
    }

    const clipboard_data = event.clipboardData
    const pasted = clipboard_data.getData('Text')

    if (!Typicalselection.collapsed) {
        removeRange(lines, selection)
    }

    pastePlainText(lines, pasted, selection)
}

function pastePlainText(lines: Lines, text: string, selection: TextSelection): void {
    const line = Typicalselection.start_line

    if (!line) {
        throw new Error('Line with given ID was not found in block')
    }
    
    const sanitized_text = sanitizeText(text)
    TypicalTextProcessor.insertText(line, sanitized_text, Typicalselection.start)
    
    lines.update()

    nextTick(() => {
        TypicalSelection.setSelection({ start: Typicalselection.start + sanitized_text.length, start_line: line })
    })
}

function removeRange(lines: Lines, selection: TextSelection) {
    TypicalTextProcessor.removeRange(lines, selection)

    lines.update()
    
    nextTick(() => {
        TypicalSelection.setSelection({
            start: Typicalselection.start, 
            start_line: Typicalselection.start_line
        })
    })
}

function sanitizeText(text: string): string {
    let result: string

    result = text.replace(/(\r\n|\n|\r)/gm, '')
    // result = result.replace(/(\u0016)/gm, '')
    
    // will be more

    return result
}

export {
    PasteHandler
}