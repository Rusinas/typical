import { TypicalTextNode } from '~typical/text/TypicalText'
import { TypicalSelection } from '~typical/core/TypicalSelection'
import { TypicalEvents } from '~typical/core/TypicalEvents'

interface TypicalTextControllerParams {
    wrapper: HTMLElement
    getHeadNode: () => TypicalTextNode
} 

export class TypicalTextController {
    wrapper: HTMLElement
    getHeadNode: () => TypicalTextNode
    is_listeners_attached: boolean = false

    nodes_cache: Map<string, TypicalTextNode> = new Map()

    constructor(params: TypicalTextControllerParams) {
        this.wrapper = params.wrapper
        this.getHeadNode = params.getHeadNode
    }

    // Must be called inside of the onMounted hook
    public init() {
        this.attachListeners()
    }

    // Must be called inside of the onBeforeUnmount hook
    public destroy() {
        this.detachListeners()
    }

    public getNode(node_id: string): TypicalTextNode {
        let node

        if (this.nodes_cache.has(node_id)) {
            return this.nodes_cache.get(node_id)
        }

        let next = this.getHeadNode()

        while (!!next) {
            if (next.id === node_id) {
                node = next
                break
            } else {
                next = next.next
            }
        }
    
        // console.timeEnd('Searching for node')
        return node
    }
    
    private onMousedownHandler(event: MouseEvent) {
        let keep_selection = false

        if (event.target instanceof HTMLElement) {
            keep_selection = !!event.target.closest('[data-keep-selection]')
        }

        if (!event.shiftKey && !keep_selection) {
            TypicalSelection.clearSelection()
        }
    }

    // private onPasteHandler(event: ClipboardEvent) {
    //     TypicalEvents.onPaste(this, event)
    // }

    private onMousedown = this.onMousedownHandler.bind(this)
    // private onPaste = this.onPasteHandler.bind(this)

    inputHandler(event: InputEvent) {
        TypicalEvents.onInput(this, event)
    }

    preventEventDefault(event) {
        event.preventDefault()
    }

    onCompositionStartHandler(event) {
        event.preventDefault()
        event.stopPropagation()
        TypicalEvents.onCompositionInputStart()
    }

    onCompositionEndHandler(event) {
        event.preventDefault()
        event.stopPropagation()
        TypicalEvents.onCompositionInputEnd(this, event)
    }

    onCompositionStart = this.onCompositionStartHandler.bind(this)
    onCompositionEnd = this.onCompositionEndHandler.bind(this)
    onInput = this.inputHandler.bind(this)

    // Put these handlers to your wrapper element
    public get listeners(): Record<string, (event: Event) => void> {
        return {
            'mousedown': this.onMousedown,
            'compositionstart': this.onCompositionStart,
            'compositionend': this.onCompositionEnd,
            'beforeinput': this.onInput,
            'textInput': this.preventEventDefault,
        }
    }

    public attachListeners() {
        for (let [event, listener] of Object.entries(this.listeners)) {
            this.wrapper.addEventListener(event, listener)
        }
    }

    public detachListeners() {
        for (let [event, listener] of Object.entries(this.listeners)) {
            this.wrapper.removeEventListener(event, listener)
        }
    }
}