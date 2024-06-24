import { ITypicalTextNode, TypicalText, TypicalTextNode } from '~typical/text/TypicalText'
import { type Selection } from './TypicalSelection'
import { createIntlSegmenterPolyfill } from 'intl-segmenter-polyfill/dist/bundled'

export const IS_FIREFOX: boolean = /^(?!.*Seamonkey)(?=.*Firefox).*/i.test(globalThis?.navigator?.userAgent);

let Segmenter

if (IS_FIREFOX || !Intl.Segmenter) {
    Segmenter = await createIntlSegmenterPolyfill()
} else {
    Segmenter = Intl.Segmenter
}

type TextTransformResult = {
    finish_node_id: string
    finish_index: number
}

type SplitTextParams = {
    data: ITypicalTextNode[]
    start_node_id: string
    start_index: number
    end_node_id?: string
    end_index?: number
}

export type SplitResult = {
    before: ITypicalTextNode[]
    range: ITypicalTextNode[]
    after: ITypicalTextNode[]
}

const SPACE = ' '

export class TypicalTextProcessor {
    public static insertText(start_node: TypicalTextNode, text: string, index: number) {
        if (typeof start_node?.data === 'string') {
            const data = start_node?.data.split('')
            data?.splice(index, 0, text)
    
            start_node.updateData(data?.join(''))
        } else {
            throw new Error(`Given node is not a string`)
        }
    }

    // Returns the number of removed characters
    public static removeCharacter(node: TypicalTextNode, index: number): number {
        if (typeof node?.data === 'string') {
            const segments = [...new Segmenter().segment(node.data)]
                .map(s => ({ segment: s.segment, length: s.segment.length, index: s.index }))

            const segment_index = segments.findIndex(s => {
                if (index === s.index || (index > s.index && index < s.index + s.length)) {
                    return true
                }
            })

            const removed_length = segments[segment_index]?.length || 0

            segments.splice(segment_index, 1)
            node.data = segments.map(s => s.segment).join('')

            return removed_length
        }
    }

    public static removeRange(start_node: TypicalTextNode, selection: Selection, merge = true): void {
        let current_node = start_node
        let start_index = selection.start_index
        let end_index = selection.end_index

        const is_same_text = selection.start_text_id === selection.end_text_id

        let done = false

        while (!done) {
            let next

            // Remove interjacent text instances
            if (current_node.text.id !== selection.start_text_id && current_node.text.id !== selection.end_text_id) {
                next = current_node.next

                current_node.text.delete()
            }

            else if (current_node.id === selection.start_node_id) {
                if (selection.start_node_id !== selection.end_node_id) {
                    end_index = start_node.length
                }

                current_node.data = this.removeRangeFromNode(current_node, start_index, end_index)

                next = current_node.next
            }

            else if (current_node.id !== selection.start_node_id && current_node.id !== selection.end_node_id) {
                if (!current_node) {
                    break
                }
                
                next = current_node.next
                current_node.delete()
            }

            else if (current_node.id === selection.end_node_id) {
                if (!current_node) {
                    break
                }

                current_node.data = this.removeRangeFromNode(current_node, start_index, selection.end_index)

                if (!current_node.data.length) {
                    next = current_node.next

                    current_node.delete()
                }
            }

            // Perform merge of the first and the last texts if range was between two texts
            if (!is_same_text && current_node.text.id === selection.end_text_id) {
                if (merge) {
                    const last_node_json = current_node.text.toJSON()
                    start_node.text.appendData(last_node_json)
    
                    current_node.text.delete()
                }
                else {
                    if (current_node.text.is_empty) {
                        current_node.text.appendData()
                    }
                }
            }

            // Extra safety I believe
            if (current_node.id === selection.end_node_id) {
                done = true
                break
            } 
            
            // if not first iteration, start from 0
            start_index = 0
            current_node = next
        }
    }

    private static removeRangeFromNode(node: TypicalTextNode, start: number, end: number) {
        if (typeof node.data !== 'string') {
            throw new Error(`Given node is not a leaf`)
        }

        const split = node.data.split('')

        split.splice(start, end - start)

        const result = split.join('')

        return result
    }

    public static removeWord(node: TypicalTextNode, start_index: number, direction: 'backward' | 'forward' = 'backward'): TextTransformResult {
        let result: TextTransformResult

        if (direction === 'backward') {
            const { finish_node_id, finish_index } = this.removeWordBackward(node, start_index)
            
            result = { finish_index, finish_node_id }
        } else if (direction === 'forward') {
            const { finish_node_id, finish_index } = this.removeWordForward(node, start_index)

            result = { finish_index, finish_node_id }
        }

        const has_finish_index = result.finish_index >= 0

        if (!result || !has_finish_index || !result.finish_node_id) {
            throw new Error(`removeWord() should return finish index and finish line! 😭`)
        }

        return result
    }

    // For ctrl + backspace
    // Cases:
    // this is the w|ord => this is the |ord
    // this is the word| => this is the |
    // this is the |word => this is |word
    // this |is the word => |is th word
    private static removeWordBackward(node: TypicalTextNode, start_index: number) {
        let done = false

        let data
        
        if (typeof node?.data === 'string') {
            data = node.data.split('')
        } else {
            throw new Error(`Given line doesn't contain data string!`)
        }

        let current_line = node
        let current_index = start_index - 1

        let is_first_char_space = data[current_index] === SPACE
        let found_non_space = false

        let finish_index: number = 0
        let finish_node: TypicalTextNode

        while (!done) {
            if (current_index === -1) {
                if (current_line.prev) {
                    if (current_line.text.id !== current_line.prev.text.id) {
                        finish_index = current_index + 1
                        finish_node = current_line
                        done = true

                        break
                    }
                    // Save data in previous line
                    current_line.data = data?.join('') 
                    // Change the line to previous 
                    current_line = current_line.prev
                    current_index = current_line.length

                    if (typeof current_line.data === 'string') {
                        data = current_line.data.split('')
                    }
                } else {
                    finish_index = current_index + 1
                    finish_node = current_line
                    done = true
    
                    break
                }
            }

            const char = data[current_index]

            if (
                (is_first_char_space && found_non_space && char === SPACE) ||
                (!is_first_char_space && char === SPACE)
            ) {
                finish_index = current_index + 1
                finish_node = current_line
                done = true

                break
            } 
            else {
                data.splice(current_index, 1)
            }

            if (is_first_char_space && char !== SPACE) {
                found_non_space = true
            }

            current_index--
        }

        current_line.data = data?.join('') 

        if (!finish_node) {
            throw new Error(`Word remove error: can't get finish line :(`)
        }

        return { finish_index, finish_node_id: finish_node.id }
    }

    // For ctrl + delete
    // Cases:
    // this is the w|ord => this is the w
    // this is the word| => this is the word
    // this is the |word => this is the 
    // this |is the word => this the word
    private static removeWordForward(node: TypicalTextNode, start_index: number) {
        let done = false

        let data
        
        if (typeof node?.data === 'string') {
            data = node.data.split('')
        } else {
            throw new Error(`Given line doesn't contain data string!`)
        }

        let current_line = node
        let current_index = start_index

        let is_first_char_space = data[current_index] === SPACE
        let found_non_space = false

        let finish_index: number = 0
        let finish_node: TypicalTextNode

        while (!done) {
            if (current_index === data.length) {
                if (current_line.next) {
                    if (current_line.text.id !== current_line.next.text.id) {
                        finish_index = current_index
                        finish_node = current_line

                        done = true
                        break
                    }

                    // Save data in previous line
                    current_line.data = data?.join('') 
                    // Change the line to previous 
                    current_line = current_line.next
                    current_index = 0

                    if (typeof current_line.data === 'string') {
                        data = current_line.data.split('')
                    }
                } else {
                    finish_index = current_index
                    finish_node = current_line
                    done = true

                    break
                }
            }

            const char = data[current_index]

            if (
                (is_first_char_space && found_non_space && char === SPACE) ||
                (!is_first_char_space && char === SPACE)
            ) {
                finish_index = current_index
                finish_node = current_line
                done = true

                break
            } 
            else {
                data.splice(current_index, 1)
            }

            if (is_first_char_space && char !== SPACE) {
                found_non_space = true
            }
        }

        current_line.data = data?.join('') 

        if (!finish_node) {
            throw new Error(`Word remove error: can't get finish node :(`)
        }

        return { finish_index, finish_node_id: finish_node.id }
    }

    static splitText(params: SplitTextParams) {
        
    }
}