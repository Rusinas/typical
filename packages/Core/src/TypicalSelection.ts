import { TypicalText } from '~typical/text/TypicalText'

export type Selection = {
    start_element_id: string | null
    end_element_id: string | null
    start_text_id: string | null
    end_text_id: string | null
    start_node_id: string | null
    end_node_id: string | null
    start_editor_id: string | null
    end_editor_id: string | null
    start_index: number
    end_index: number
    collapsed: boolean
}

type SetSelectionParams = {
    start_node_id: string
    end_node_id?: string
    start_index: number
    end_index?: number
}

export class TypicalSelection {
    public static getSelection(): Selection {
        const native_selection = window.getSelection()

        if (!native_selection?.rangeCount) {
            return
        }

        const range = native_selection.getRangeAt(0)

        // TODO: Need to refactor this to use previos calculations in next calls
        // For example, we don't need to lookup entire document if we already got .typical (editor element)
        // We can proceed to quering inside of it, etc
        const start_editor_id = this.getEditorId(range.startContainer)
        const end_editor_id = this.getEditorId(range.endContainer)

        const start_element_id = this.getElementId(range.startContainer)
        const end_element_id = this.getElementId(range.endContainer)      

        const start_text_id = this.getTextId(range.startContainer)
        const end_text_id = this.getTextId(range.endContainer)

        const start_node_id = this.getTextNodeId(range.startContainer)
        const end_node_id = this.getTextNodeId(range.endContainer)

        const start_index = range.startOffset
        const end_index = range.endOffset

        const collapsed = range.collapsed

        const selection: Selection = {
            collapsed,
            start_element_id,
            end_element_id,
            start_text_id,
            end_text_id,
            start_node_id,
            end_node_id,
            start_editor_id,
            end_editor_id,
            start_index,
            end_index,
        }

        return selection
    }

    private static getElementId(container: Node | Element): string | null {
        let parent: Element

        let element

        if (container.nodeType === 3) {
            parent = container.parentElement
        } else {
            parent = container as Element
        }

        if (parent.classList.contains('typical-element')) {
            element = parent
        }

        if (!element) {
            element = parent.closest('.typical-element')
        }

        return element?.id || null
    }

    private static getEditorId(container: Node): string | null {
        let editor: Element

        const parent = container.parentElement

        if (parent?.classList.contains('typical')) {
            editor = parent
        }

        if (!editor) {
            editor = parent.closest('.typical')
        }

        if (!editor) {
            editor = parent.querySelector('.typical')
        }

        return editor?.id || null
    }

    private static getTextId(container: Node): string | null {
        let text: Element

        const parent = container.parentElement

        if (parent?.classList.contains('typical-text')) {
            text = parent
        }

        if (!text) {
            text = parent.closest('.typical-text')
        }

        if (!text) {
            text = parent.querySelector('.typical-text')
        }

        return text?.id || null
    }

    private static getTextNodeId(container: Node): string | null {
        let node: Element

        const parent = container.parentElement

        // Check if current element is a text node
        if (parent.classList?.contains('.node')) {
            node = parent
        }

        // Check if one of parents is a text node
        if (!node) {
            node = parent.closest('.node')
        }

        // Check if one children is a text node
        if (!node) {
            node = parent.querySelector('.node')
        }

        return node?.id || null
    }

    public static setSelection(params: SetSelectionParams) {
        const { start_node_id, end_node_id, start_index, end_index } = params

        const selection = window.getSelection()!
        const range = document.createRange()

        const start_node = this.getElementTextNode(
            document.getElementById(start_node_id)
        )

        let end_node

        if (end_node_id) {
            end_node = this.getElementTextNode(
                document.getElementById(end_node_id)
            )
        } else {
            end_node = start_node
        }

        const end = end_index ?? start_index

        this.clearSelection()
    
        range.setStart(start_node, start_index)
        range.setEnd(end_node, end) 

        selection.addRange(range)
    }

    private static getElementTextNode(element: Element): Node {
        if (!element) return

        if (element.firstChild?.nodeType === 3) {
            return element.firstChild
        }

        return element
    }

    public static clearSelection() {
        if (window.getSelection) {
            if (window.getSelection()?.empty) {
                window.getSelection()?.empty()
            } else if (window.getSelection()?.removeAllRanges) { 
                window.getSelection()?.removeAllRanges()
            }
        }
    }

    public static isCursorAtTheStartOfText(text: TypicalText): boolean {
        const selection = this.getSelection()

        if (!selection.collapsed) {
            return false
        }

        else if (text.first_leaf.id === selection.start_node_id && selection.start_index === 0) {
            return true
        }

        return false
    }

    public static isCursorAtTheEndOfText(text: TypicalText): boolean {
        const selection = this.getSelection()

        if (!selection.collapsed) {
            return false
        }

        else if (text.last_leaf.id === selection.end_node_id && selection.end_index === text.last_leaf.length) {
            return true
        }

        return false
    }
}