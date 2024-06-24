import { Raw, defineAsyncComponent, markRaw } from 'vue'
import { type ITypicalTextNode, TypicalTextNode, TypicalTextNodeSchema } from '~typical/text/TypicalText'
import { Typical } from '~typical/editor/Typical'

import { TypicalElementText } from '~typical/editor/TypicalElementText'

import { generateId as id } from '@typical/utils'

import {
    TypicalElementStyleProvider,
} from '~typical/editor/TypicalEditorStyleProvider'

import type {
    TypicalElementStyle,
} from '~typical/editor/TypicalEditorStyleProvider'

import {
    TypicalTextStyleProvider,
    type TypicalTextStyle
} from '~typical/text/TypicalTextStyleProvider'

export interface ITypicalElement<T = any> {
    id?: string,
    type: string
    data: string | ITypicalTextNode[]
    additional_data?: T
}
export interface ITypicalElementSchema {
    name: string
    type: string
    component: ReturnType<typeof defineAsyncComponent>
    inherit_schemas?: boolean
    schemas?: TypicalTextNodeSchema[]
    placeholder?: string
    text_tag?: string
    style?: {
        text?: Partial<TypicalTextStyle>,
        element?: Partial<TypicalElementStyle>
    }
}

export class TypicalElementSchema {
    name: string
    type: string
    component: Raw<ReturnType<typeof defineAsyncComponent>>
    placeholder?: string
    text_tag: string | null
    schemas: TypicalTextNodeSchema[]
    inherit_schemas: boolean
    
    style?: {
        text?: Partial<TypicalTextStyle>,
        element?: Partial<TypicalElementStyle>
    }

    #is_default: boolean

    constructor(params: ITypicalElementSchema) {
        this.name = params.name
        this.type = params.type
        this.schemas = params.schemas || []
        this.inherit_schemas = params.inherit_schemas ?? true

        this.component = markRaw(params.component)
        this.placeholder = params.placeholder || 'Type something...'
        this.style = params.style
        this.text_tag = params.text_tag || null
    }

    public get is_default() {
        return this.#is_default
    }

    public addSchema(schema: TypicalTextNodeSchema | TypicalTextNodeSchema[]) {
        if (Array.isArray(schema)) {
            this.schemas.push(...schema)
        } else {
            this.schemas.push(schema)
        }
    }

    public setAsDefault(): void {
        this.#is_default = true
    }
}

interface ITypicalElementParams {
    id?: string
    schema: TypicalElementSchema
    data: string | ITypicalTextNode[]
    editor: Typical
    static?: boolean
    use_text?: boolean
    additional_data?: any
    actions?: Array<TypicalElementMenuItem>
    inherit_actions?: boolean
}

export type TypicalElementMenuItem = {
    type: 'title'
    name: string
} | {
    name: string
    type: 'action',
    action: Function
    isShown?: Function
    icon?: string
} | {
    type: 'divider'
}
export class TypicalElement {
    id: string
    schema: TypicalElementSchema
    text: TypicalElementText
    editor: Typical
    additional_data?: any

    static: boolean
    use_text: boolean

    is_drop_target_before?: boolean
    is_drop_target_after?: boolean

    actions: Array<TypicalElementMenuItem>

    _element_style_provider: TypicalElementStyleProvider
    _text_style_provider: TypicalTextStyleProvider

    constructor(params: ITypicalElementParams) {
        this.id = params.id || id('element')
        this.schema = params.schema
        this.editor = params.editor
        this.additional_data = params.additional_data
        this.static = params.static ?? false
        this.use_text = params.use_text ?? true

        this.actions = this.getActions(params.actions, params.inherit_actions)

        this._element_style_provider = new TypicalElementStyleProvider({
            ...this.editor.style.element,
            ...this.schema.style?.element,
        })

        this._text_style_provider = new TypicalTextStyleProvider({
            ...this.editor.style.text,
            ...this.schema.style?.text,
        })

        if (this.use_text) {
            this.text = this.createText(params.data)
        }
        else {
            this.text = this.createText()
        }
    }

    private createText(data: string | ITypicalTextNode[] = ''): TypicalElementText {
        return new TypicalElementText({
            data,
            schemas: this.initSchemas(),
            tag: this.schema.text_tag,
            style: this.style.text,
            parent_element: this,
            prev: () => this.prev?.text,
            next: () => this.next?.text
        })
    }

    public get index(): number {
        return this.editor.data?.findIndex(element => element.id === this.id)
    }

    public get next(): TypicalElement | null {
        return this.editor.data?.[this.index + 1] || null
    }

    public get prev(): TypicalElement | null {
        return this.editor.data?.[this.index - 1] || null
    }

    public get style() {
        return {
            element: this._element_style_provider.style,
            text: this._text_style_provider.style
        }
    }

    public get type(): string {
        return this.schema.type
    }

    public get data(): TypicalTextNode[] {
        return this.text.data
    }

    public get component(): any {
        return this.schema.component
    }

    public get is_empty(): boolean {
        return this.text.is_empty
    }

    private getActions(actions = [], inherit_actions = true) {
        if (inherit_actions) {
            return [
                ...actions,
                ...this.editor.actions
            ]
        } else {
            return actions
        }
    }

    private initSchemas(): TypicalTextNodeSchema[] {
        let schemas = [
            ...this.schema.schemas
        ]

        const { inherit_schemas } = this.schema

        if (inherit_schemas) {
            schemas.push(
                ...this.editor.text_schemas
            )
        }

        return schemas
    }

    public focus() {
        this.text?.focus?.()
    }

    public delete() {
        this.editor.data.splice(this.index, 1)
    }

    public toJSON(): ITypicalElement {
        return {
            id: this.id,
            type: this.type,
            data: this.text?.toJSON?.() || '',
            additional_data: this.additional_data
        }
    }
}