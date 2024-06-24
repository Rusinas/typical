import { type Ref, ref, isRef, nextTick } from 'vue'
import { ITypicalElement, TypicalElement, TypicalElementMenuItem, TypicalElementSchema } from '~typical/editor/TypicalElement'
import { TextSchema } from '@typical/elements'

import { generateId as id } from '@typical/utils'

import {
    TypicalEditorStyleProvider,
    TypicalElementStyleProvider,
} from './TypicalEditorStyleProvider'

import {
    TypicalTextStyleProvider,
    TypicalTextStyle
} from '~typical/text/TypicalTextStyleProvider'

import type {
    TypicalEditorStyle,
    TypicalElementStyle,
} from './TypicalEditorStyleProvider'

import { TypicalTextController } from '~typical/core/TypicalTextController'
import { ITypicalTextNode, TypicalTextNode, TypicalTextNodeSchema } from '~typical/text/TypicalText'
import { TypicalTextProcessor } from '~typical/core/TypicalTextProcessor'
import { TypicalElementText } from './TypicalElementText'
import { TypicalHelpers } from '~typical/core/TypicalHelpers'
import { TypicalSelection } from '~typical/core/TypicalSelection'

type SplitResult = {
    before: ITypicalElement
    range: ITypicalElement | ITypicalElement[]
    after: ITypicalElement
}
interface TypicalParams {
    data?: ITypicalElement[]
    schemas?: {
        elements?: TypicalElementSchema[]
        text?: TypicalTextNodeSchema[]
    }
    style?: {
        editor?: Partial<TypicalEditorStyle>
        element?: Partial<TypicalElementStyle>
        text?: Partial<TypicalTextStyle>
    }
}

interface SplitParams {
    start_el_id: string
    end_el_id: string
    start_node_id: string
    start_index: number
    end_node_id?: string
    end_index?: number
}

export const DEFAULT_ELEMENT_SCHEMA = TextSchema

DEFAULT_ELEMENT_SCHEMA.setAsDefault()

export class Typical {
    id: string
    _data: Ref<TypicalElement[]> | TypicalElement[]
    schemas: Map<string, TypicalElementSchema>
    text_schemas: TypicalTextNodeSchema[] = []

    ref?: HTMLElement

    text_controller: TypicalTextController

    #editor_style_provider: TypicalEditorStyleProvider
    #element_style_provider: TypicalElementStyleProvider
    #text_style_provider: TypicalTextStyleProvider

    constructor(params: TypicalParams = {}) {
        this.id = id()
        this.schemas = this.initSchemas(params.schemas?.elements)
        this.text_schemas = params.schemas?.text || []

        this.#editor_style_provider = new TypicalEditorStyleProvider(params.style?.editor)
        this.#element_style_provider = new TypicalElementStyleProvider(params.style?.element)
        this.#text_style_provider = new TypicalTextStyleProvider(params.style?.text)

        this._data = ref([])
        this._data.value = this.initData(params.data)
        this.normalize()
    }

    public get data(): TypicalElement[] {
        if (isRef(this._data)) {
            return this._data.value;
        } else {
            return this._data
        }
    }

    public set data(value: TypicalElement[]) {
        if (isRef(this._data)) {
            this._data.value = value
        } else {
            this._data = value
        }
    } 

    public setRef(ref: HTMLElement): void {
        this.ref = ref
    }
    
    public get actions(): Array<TypicalElementMenuItem> {
        return [
            {
                type: 'title',
                name: 'Add'
            },
            ...this.generateAddElementActions(),
            {
                type: 'divider'
            },
            {
                type: 'action',
                name: 'Delete',
                isShown: (index: number, is_static: boolean): boolean => {
                    if (this.data.length <= 1 || is_static) {
                        return false
                    } else {
                        return true
                    }
                },
                action: (index: number) => this.deleteElementByIndex(index)
            }
        ]
    }

    private generateAddElementActions(): TypicalElementMenuItem[] {
        const actions = []

        for (const [key, schema] of this.schemas) {
            actions.push({
                name: schema.name,
                type: 'action',
                action: (index: number) => {
                    const new_el = this.createElement({
                        type: schema.type
                    })

                    this.addElement(new_el, index + 1)

                    nextTick(() => {
                        new_el.focus()
                    })
                }
            })
        }

        return actions
    }

    public init() {
        if (!this.ref) {
            throw new Error('Editor ref must be set')
        }

        this.text_controller = new TypicalTextController({
            wrapper: this.ref,
            getHeadNode: this.getHeadNode.bind(this)
        })

        this.text_controller.init()
    }

    public destroy() {
        this.text_controller?.destroy()
    }

    public getHeadNode() {
        const head_node = this.data?.[0]?.text?.first_leaf as TypicalTextNode<TypicalElementText>
        return head_node
    }

    public focus() {
        this.data.at(-1).focus()
    }

    public get style() {
        return {
            editor: this.#editor_style_provider.style,
            element: this.#element_style_provider.style,
            text: this.#text_style_provider.style,
        }
    }

    initSchemas(schemas?: TypicalElementSchema[]): Map<string, TypicalElementSchema> {
        const schema_map = new Map<string, TypicalElementSchema>()

        let has_default = false

        if (schemas?.length) {
            for (const schema of schemas) {
                if (schema.is_default) {
                    if (has_default) {
                        throw new Error('Schemas has multiple default elements. Plz chk')
                    } else {
                        has_default = true
                    }
                }

                schema_map.set(schema.type, schema)
            }
        }

        if (!schemas || !schemas?.length || !has_default) {
            schema_map.set(
                DEFAULT_ELEMENT_SCHEMA.type,
                DEFAULT_ELEMENT_SCHEMA
            )
        }

        return schema_map
    }

    public getSchemasForRange(start_el_id: string, end_el_id: string) {
        const elements = this.getElementsInRange(start_el_id, end_el_id)
        
        const schemas: TypicalTextNodeSchema[][] = []

        for (const element of elements) {
            let current_schemas = [...element.text.schemas.values()].filter(schema => !schema.is_default)

            if (start_el_id !== end_el_id) {
                current_schemas = current_schemas.filter(schema => schema.interselect)
            }
            
            schemas.push(current_schemas)
        }

        const common_schemas = schemas[0]?.filter(
            schema => schemas.every(
                schema_arr => schema_arr.includes(schema)
            )
        )

        return common_schemas
    }

    public getAppliedSchemasForRange(params: SplitParams): string[] {
        const {
            start_el_id,
            end_el_id,
            start_index,
            start_node_id,
            end_node_id = start_node_id,
            end_index = start_index
        } = params

        const { range } = this.split({
            start_el_id,
            end_el_id,
            start_index,
            start_node_id,
            end_node_id,
            end_index
        })

        let length = 0
        let schemas_lengths: Record<string, number> = {}

        let result: string[] = []

        if (Array.isArray(range)) {
            for (const element of range) {
                length += TypicalHelpers.getTextLength(element.data)
                const lengths = TypicalHelpers.getFormattingLengths(element.data)

                for (const [type, value] of Object.entries(lengths)) {
                    if (schemas_lengths[type]) {
                        schemas_lengths[type] += value
                    } else {
                        schemas_lengths[type] = value
                    }
                }
            }
        }
        else {
            length = TypicalHelpers.getTextLength(range.data)
            schemas_lengths = TypicalHelpers.getFormattingLengths(range.data)
        }

        for (const [key, value] of Object.entries(schemas_lengths)) {
            if (value === length) {
                result.push(key)
            }
        }

        return result
    }

    private initData(data: ITypicalElement[] = []): TypicalElement[] {
        const result: TypicalElement[] = []

        if (data && data.length) {
            for (let element of data) {
                result.push(
                    this.createElement(element)
                )
            }
        } else {
            result.push(
                this.createElement()
            )
        }

        return result
    }

    public updateData(data: ITypicalElement[]): void {
        this.data = this.initData(data)

        this.normalize()

        nextTick(() => {
            this.focus()
        })
    }

    deleteElementByIndex(index: number): void {
        if (index > -1) {
            this.data[index]?.delete()
        }
    }

    getElementById(id: string): TypicalElement | null {
        return this.data.find(item => item.id === id) || null
    }

    deleteElementById(id: string): void {
        const el = this.getElementById(id)
        const prev = el.prev ? el.prev : el.next

        if (el) {
            el.delete()

            if (prev) {
                prev.focus()
            }
        }
    }

    getNodeById(id: string): TypicalTextNode<TypicalElementText> | null {
        let result: TypicalTextNode<TypicalElementText> | null = null
        let current = this.getHeadNode()

        while (current) {
            if (current.id === id) {
                result = current
                break
            }
            else {
                current = current.next as TypicalTextNode<TypicalElementText>
            }
        }

        return result
    }

    changeElementOrder(element_index: number, target_index: number) {
        const [el] = this.data.splice(element_index, 1)

        if (el) {
            this.data.splice(target_index, 0, el)
        }
    }

    addElement(element: TypicalElement, index?: number) {
        if (Number.isInteger(index) && index > -1) {
            this.data.splice(index, 0, element)
        }
        else {
            this.data.push(element)
        }
    }

    addElementAfter(element: TypicalElement, prev_id: string) {
        const prev_index = this.data.findIndex(item => item.id === prev_id)

        if (prev_index > -1) {
            this.addElement(element, prev_index)
        }
    }

    createElement(element?: Partial<ITypicalElement>): TypicalElement {
        let new_element

        let schema
        
        if (element) {
            schema = this.schemas.get(element.type)

            if (element.type && !schema) {
                console.warn(`Can't find schema for ${element.type}`)
            }
        }

        if (!element || !schema) {
            schema = this.default_element_schema
        }

        new_element = new TypicalElement({
            schema,
            data: element?.data || [],
            editor: this,
            additional_data: element?.additional_data,
        })

        return new_element
    }

    get default_element_schema(): TypicalElementSchema {
        return [...this.schemas.values()]
            .find(schema => schema.is_default)
            || DEFAULT_ELEMENT_SCHEMA
    }

    // Text processing
    public split(params: SplitParams): SplitResult {
        const {
            start_el_id,
            end_el_id,
            start_index,
            start_node_id,
            end_node_id = start_node_id,
            end_index = start_index
        } = params

        let result: SplitResult

        const elements_in_range = this.getElementsInRange(start_el_id, end_el_id)

        // Means that selection started and ended in the same text element
        if (elements_in_range.length === 1) {
            elements_in_range[0].text.split({
                start_node_id,
                start_index,
                end_node_id,
                end_index
            })

            const split_result = elements_in_range[0].text.split({
                start_node_id,
                start_index,
                end_node_id,
                end_index
            })

            const json = elements_in_range[0].toJSON()

            result = {
                before: {
                    ...json,
                    data: split_result.before
                },
    
                range: {
                    ...json,
                    data: split_result.range
                },
                after: {
                    ...json,
                    data: split_result.after
                },
            }
        }
        else {
            let before
            let after

            const range = []

            for (const [index, element] of elements_in_range.entries()) {
                if (index === 0) {
                    const split = element.text.split({
                        start_node_id,
                        start_index,
                        end_node_id: element.text.last_leaf.id,
                        end_index: element.text.last_leaf.length
                    })

                    // and the name is primeagen
                    const jismo = element.toJSON()

                    before = {
                        ...jismo,
                        data: split.before
                    }

                    range.push({
                        ...jismo,
                        data: split.range
                    })
                }
                else if (index === elements_in_range.length - 1) {
                    const split = element.text.split({
                        start_node_id: element.text.first_leaf.id,
                        start_index: 0,
                        end_node_id,
                        end_index
                    })

                    const jismo = element.toJSON()

                    after = {
                        ...jismo,
                        data: split.after
                    }

                    range.push({
                        ...jismo,
                        data: split.range
                    })
                }
                else {
                    range.push(element.toJSON())
                }
            }

            result = {
                before,
                range,
                after
            }
        }

        return result
    }

    public applyTextSchema(type: string, start_node_id: string, start_index: number, end_node_id: string, end_index: number) {
        const start_node = this.getNodeById(start_node_id)
        const end_node = this.getNodeById(end_node_id)

        const start_el_id = start_node.text.parent_element.id
        const end_el_id = end_node.text.parent_element.id

        const elements = this.getElementsInRange(start_el_id, end_el_id)

        let selection = {
            start_node_id: null,
            start_index: null,
            end_node_id: null,
            end_index: null
        }

        for (const [index, element] of elements.entries()) {
            const is_first = index === 0
            const is_last = index === elements.length - 1

            let schema_params: Parameters<typeof element.text.applySchema>[0] = {
                type
            }

            if (is_first) {
                schema_params.start_node_id = start_node_id
                schema_params.start_index = start_index
            }

            if (is_last) {
                schema_params.end_node_id = end_node_id
                schema_params.end_index = end_index
            }

            const result = element.text.applySchema(schema_params)

            if (is_first) {
                selection.start_index = result.start_index
                selection.start_node_id = result.start_node_id
            }

            if (is_last) {
                selection.end_node_id = result.end_node_id
                selection.end_index = result.end_index
            }
        }

        // Restore selection
        nextTick(() => {
            TypicalSelection.setSelection(selection)
        })
    }

    public removeTextSchema(type: string, start_node_id: string, start_index: number, end_node_id: string, end_index: number) {
        const start_node = this.getNodeById(start_node_id)
        const end_node = this.getNodeById(end_node_id)

        const start_el_id = start_node.text.parent_element.id
        const end_el_id = end_node.text.parent_element.id

        const elements = this.getElementsInRange(start_el_id, end_el_id)

        let selection = {
            start_node_id: null,
            start_index: null,
            end_node_id: null,
            end_index: null
        }

        for (const [index, element] of elements.entries()) {
            const is_first = index === 0
            const is_last = index === elements.length - 1

            let schema_params: Parameters<typeof element.text.removeSchema>[0] = {
                type
            }

            if (is_first) {
                schema_params.start_node_id = start_node_id
                schema_params.start_index = start_index
            }

            if (is_last) {
                schema_params.end_node_id = end_node_id
                schema_params.end_index = end_index
            }

            const result = element.text.removeSchema(schema_params)

            if (is_first) {
                selection.start_index = result.start_index
                selection.start_node_id = result.start_node_id
            }

            if (is_last) {
                selection.end_node_id = result.end_node_id
                selection.end_index = result.end_index
            }
        }

        // Restore selection
        nextTick(() => {
            TypicalSelection.setSelection(selection)
        })
    }

    private getElementsInRange(start_el_id: string, end_el_id = start_el_id): TypicalElement[] {
        const elements_in_range: TypicalElement[] = [] 

        let current_el = this.getElementById(start_el_id)

        while (current_el) {
            elements_in_range.push(current_el)

            if (current_el.id === end_el_id) {
                break
            }

            current_el = current_el.next
        }

        return elements_in_range
    }

    public normalize() {
        this.data.forEach(el => el.text?.normalize?.())
    }

    public toJSON() {
        return this.data.map(element => element.toJSON())
    }
}