import { markRaw, type Ref, ref, isRef, defineAsyncComponent } from 'vue'
import { generateId as id, removeFieldDeep } from '@typical/utils'

import { TypicalTextStyleProvider } from '~typical/text/TypicalTextStyleProvider'

import type {
    TypicalTextStyle,
} from './TypicalTextStyleProvider'
import { TypicalSelection } from '~typical/core/TypicalSelection'

export interface ITypicalTextNodeSchema {
    name: string
    type: string
    description?: string
    tag?: string
    menu_item_component?: ReturnType<typeof defineAsyncComponent>
    component?: ReturnType<typeof defineAsyncComponent>
    mergeable?: boolean
    // If schema could be applied when selection is between to texts
    // The name for this property was provided by ChatGPT
    interselect?: boolean
    is_default?: boolean
}

export class TypicalTextNodeSchema {
    name: string
    type: string
    component?: ReturnType<typeof defineAsyncComponent>
    mergeable?: boolean
    interselect?: boolean
    tag?: string
    menu_item_component?: ReturnType<typeof defineAsyncComponent>
    is_default?: boolean

    constructor(params: ITypicalTextNodeSchema) {
        this.type = params.type
        this.mergeable = params.mergeable ?? true
        this.interselect = params.interselect ?? true

        if (params.menu_item_component) {
            this.menu_item_component = markRaw(params.menu_item_component)
        }

        if (params.component) {
            this.component = markRaw(params.component)
        }

        this.tag = params.tag
        this.is_default = params.is_default
    }
}

export interface ITypicalTextNode {
    id?: string
    type: string
    data: string | ITypicalTextNode[]
}

interface TypicalTextNodeParams<T extends TypicalText = TypicalText> {
    id?: string
    text: T
    schema: TypicalTextNodeSchema
    data: string | ITypicalTextNode[]
    parent?: TypicalTextNode<T>
}

export class TypicalTextNode<T extends TypicalText = TypicalText> {
    id: string
    text: T
    _data: Ref<string | TypicalTextNode<T>[]> | string | TypicalTextNode<T>[] = ref();
    schema: TypicalTextNodeSchema
    parent: TypicalTextNode<T> | null

    constructor(params: TypicalTextNodeParams<T>) {
        this.id = params.id || id('node')
        this.text = params.text
        this.schema = params.schema

        // Bringing fokin reactivity! 😎
        this._data = ref()
        this._data.value = this.initData(params.data)

        this.parent = params.parent || null
    }

    public get type(): string {
        return this.schema.type
    }

    public set type(type: string) {
        const schema = this.text.schemas.get(type)

        if (schema) {
            this.schema = schema
        }
    }

    public get mergeable(): boolean {
        return this.schema.mergeable
    }

    public get data(): string | TypicalTextNode<T>[] {
        if (isRef(this._data)) {
            return this._data.value;
        } else {
            return this._data
        }
    }

    public get is_empty(): boolean {
        return this.length === 0;
    }

    public set data(value: string | TypicalTextNode<T>[]) {
        if (isRef(this._data)) {
            this._data.value = value
        } else {
            this._data = value
        }
    } 

    public get parent_array(): TypicalTextNode[] {
        let parent

        if (this.parent) {
            parent = this.parent.data
        } else {
            parent = this.text.data
        }

        return parent
    }

    public get index(): number {
        return this.parent_array.findIndex(node => node.id === this.id) ?? -1
    }

    public get length(): number {
        if (typeof this.data === 'string') {
            return this.data.length
        } else {
            return this.data.reduce((acc, current) => acc + current.length, 0)
        }
    }

    public get component() {
        return this.schema.component || this.schema.tag || 'strong'
    }

    public get is_leaf(): boolean {
        return typeof this.data === 'string'
    }

    public get first_leaf(): TypicalTextNode {
        if (Array.isArray(this.data)) {
            return this.data[0].first_leaf
        } else {
            return this
        }
    }

    public get last_leaf(): TypicalTextNode {
        if (Array.isArray(this.data)) {
            return this.data.at(-1)?.last_leaf
        } else {
            return this
        }
    }

    public get next(): TypicalTextNode | null {
        let next: TypicalTextNode | null = null

        if (this.parent && typeof this.parent.data !== 'string') {
            next = this.parent.data[this.index + 1] || this.parent?.next || null
        } else {
            next = this.text.data[this.index + 1] || this.text.next?.first_leaf || null
        }

        if (next && !next.is_leaf) {
            next = next.first_leaf
        }

        return next
    }

    public get prev(): TypicalTextNode | null {
        let prev: TypicalTextNode | null = null

        if (this.parent && typeof this.parent.data !== 'string') {
            prev = this.parent.data[this.index - 1] || this.parent?.prev || null
        } else {
            prev = this.text.data[this.index - 1] || this.text.prev?.last_leaf || null
        }

        if (prev && !prev.is_leaf) {
            prev = prev.last_leaf
        }

        return prev
    }

    public delete() {
        this.parent_array.splice(this.index, 1)
    }

    public focus() {
        TypicalSelection.setSelection({
            start_node_id: this.id,
            start_index: this.length
        })
    }

    initData(data?: string): string
    initData(data?: ITypicalTextNode[]): TypicalTextNode<T>[]
    initData(data: string | ITypicalTextNode[]): string | TypicalTextNode<T>[]

    initData(data: string | ITypicalTextNode[] = ''): string | TypicalTextNode<T>[] {
        let result: string | TypicalTextNode<T>[] = []

        if (data && typeof data === 'string') {
            result = data
        }
        else if (data && Array.isArray(data)) {
            for (let node of data) {
                result.push(
                    this.text.createNode(node, this)
                )
            }
        }
        else {
            result = ''
        }

        return result
    }

    public updateData(data: string): void {
        if (typeof this.data === 'string') {
            this.data = data
        }
    }

    // Simple method to append new nodes into current one
    public appendData(data: string | ITypicalTextNode[]): void {
        if (typeof data === 'string') {
            if (typeof this.data === 'string') {
                this.data += data
            }
            else {
                const old_data = this.text.createNode({
                    type: this.type,
                    data: this.data
                })

                const new_data = this.text.createNode({
                    type: this.type,
                    data
                })

                this.data = [
                    old_data,
                    new_data
                ]
            }
        }
        else if (Array.isArray(data)) {
            if (Array.isArray(this.data)) {
                const new_data = this.initData(data)

                this.data.push(...new_data)
            }
            else {
                const old_data = this.text.createNode({
                    type: this.type,
                    data: this.data
                })

                const new_data = this.text.initData(data)

                this.data = [
                    old_data,
                    ...new_data
                ]
            }
        }
    }

    public toJSON(): ITypicalTextNode {
        const data = typeof this.data === 'string' 
            ? this.data 
            : this.data.map(node => node.toJSON());
        
        const result: ITypicalTextNode = {
            id: this.id,
            type: this.type,
            data,
        }

        return result
    }
}

interface TypicalTextParams {
    id?: string
    data?: string | ITypicalTextNode[]
    schemas?: TypicalTextNodeSchema[]
    tag?: string
    style?: Partial<TypicalTextStyle>
    placeholder?: string
    standalone?: boolean
    // Must be functions because we need the actual value every time
    next?: (() => TypicalText) | null
    prev?: (() => TypicalText) | null
}

interface SplitTextParams {
    start_node_id: string
    start_index: number
    end_node_id?: string
    end_index?: number
}

type SplitTextResult = {
    before: ITypicalTextNode[]
    range: ITypicalTextNode[] | null
    after: ITypicalTextNode[]
}

type SplitTextResultLinkedList = {
    before: TypicalTextLinkedList
    range: TypicalTextLinkedList | null
    after: TypicalTextLinkedList
}

interface ApplySchemaParams {
    type: string
    start_node_id?: string
    start_index?: number
    end_node_id?: string
    end_index?: number
}

interface ApplySchemaResult {
    start_node_id?: string
    start_index?: number
    end_node_id?: string
    end_index?: number
}

export const DEFAULT_NODE_SCHEMA = new TypicalTextNodeSchema({
    name: 'Text',
    type: 'text',
    is_default: true,
    tag: 'span'
})

export class TypicalText {
    id: string
    _data: Ref<TypicalTextNode<this>[]> | TypicalTextNode<this>[]

    schemas: Map<string, TypicalTextNodeSchema>
    tag: string

    placeholder: string

    style_provider: TypicalTextStyleProvider
    standalone: boolean = false

    _next: (() => TypicalText) | null
    _prev: (() => TypicalText) | null

    constructor(params: TypicalTextParams = {}) {
        this.id = params.id || id('text')
        this.tag = params.tag || 'div'
        this.schemas = this.initSchemas(params.schemas)
        this.style_provider = new TypicalTextStyleProvider(params.style)
        
        this.placeholder = params.placeholder ?? 'Type something'
        this._data = ref()
        this._data.value = this.initData(params.data)

        this.standalone = params.standalone

        this._next = params.next
        this._prev = params.prev
    }

    public get prev(): TypicalText | null {
        const prev = this._prev?.()

        return prev
    }

    public get next(): TypicalText | null {
        const next = this._next?.()

        return next
    }

    public get length(): number {
        return this.data.reduce((acc, curr) => acc + curr.length, 0);
    }

    public get data(): TypicalTextNode[] {
        if (isRef(this._data)) {
            return this._data.value;
        }
        else {
            return this._data
        }
    }

    public set data(value: TypicalTextNode<this>[]) {
        if (isRef(this._data)) {
            this._data.value = value
        }
        else {
            this._data = value
        }
    } 

    get style() {
        return this.style_provider.style
    }

    get default_schema(): TypicalTextNodeSchema {
        return [...this.schemas.values()]
            .find(schema => schema.is_default)
            || DEFAULT_NODE_SCHEMA
    }

    public get first_leaf(): TypicalTextNode | null {
        return this.data[0]?.first_leaf
    }

    public get last_leaf(): TypicalTextNode | null {
        return this.data.at(-1)?.last_leaf
    }

    public get is_empty(): boolean {
        return this.length === 0
    }

    initSchemas(schemas?: TypicalTextNodeSchema[]): Map<string, TypicalTextNodeSchema> {
        const schema_map = new Map<string, TypicalTextNodeSchema>()

        if (schemas && schemas.length) {
            let has_default = false
            
            for (const schema of schemas) {
                if (schema.is_default) {
                    if (has_default) {
                        throw new Error('Schemas has multiple default nodes. Plz chk')
                    }
                    else {
                        has_default = true
                    }
                }

                schema_map.set(schema.type, schema)
            }

            if (!has_default) {
                schema_map.set(DEFAULT_NODE_SCHEMA.type, DEFAULT_NODE_SCHEMA)
            }
        }
        else {
            schema_map.set(
                DEFAULT_NODE_SCHEMA.type,
                DEFAULT_NODE_SCHEMA
            )
        }

        return schema_map
    }

    private getSortedSchemas(schemas: TypicalTextNodeSchema[]): TypicalTextNodeSchema[] {
        return schemas.toSorted((schema_a, schema_b) => {
            if (schema_a.mergeable && !schema_b.mergeable) {
                return -1
            }
            if (!schema_a.mergeable && schema_b.mergeable) {
                return 1
            }

            if (!schema_a.is_default && schema_b.is_default) {
                return -1
            }
            if (schema_a.is_default && !schema_b.is_default) {
                return 1
            }

            return schema_a.type.localeCompare(schema_b.type)
        })
    }

    initData(data?: string | ITypicalTextNode[]): TypicalTextNode<this>[] {
        const result: TypicalTextNode<this>[] = []

        if (typeof data === 'string') {
            result.push(
                this.createNode({
                    data
                })
            )
        }
        else if (Array.isArray(data) && data.length) {
            for (const node of data) {
                result.push(
                    this.createNode(node)
                )
            }
        }
        else {
            result.push(
                this.createNode()
            )
        }

        return result
    }

    public appendData(data: string | ITypicalTextNode[] = ''): void {
        const initialized_data = this.initData(data)

        this.data.push(...initialized_data)
    }

    public replaceData(data: string | ITypicalTextNode[] = ''): void {
        const initialized_data = this.initData(data)

        this.data = initialized_data
    }

    createNode(node?: Partial<ITypicalTextNode>, parent?: TypicalTextNode<this>): TypicalTextNode<this> {
        let schema = node?.type
            ? this.schemas.get(node.type)
            : this.default_schema

        if (!schema) {
            console.warn(`Couldn't find schema for node with type ${node.type}. Defaulted to ${this.default_schema.type}`)
            schema = this.default_schema
        }

        const data = node?.data

        return new TypicalTextNode<this>({
            id: node?.id,
            text: this,
            schema,
            data,
            parent
        })
    }

    public getNodeByCumulativeIndex(index: number): [TypicalTextNode, number] {
        let result: TypicalTextNode

        if (index > this.length) {
            console.info(`Can't find the node: index is higher than the length of the text`)
            return
        }

        let done = false
        let current = this.first_leaf
        let index_acc = 0

        while (!done) {
            // Target index is in range of current node
            if (index >= index_acc && index <= index_acc + current.length) {
                result = current
                done = true
                break
            }

            index_acc += current.length
            current = current.next
        }

        const index_in_node = index - index_acc

        return [result, index_in_node]
    }

    public getCumulativeIndex(node_id: string, index: number): number {
        let result = 0

        let index_acc = 0
        let current = this.first_leaf
        let done = false

        while (!done) {
            if (current.id === node_id) {
                result = index_acc + index
                done = true
                break
            }

            index_acc += current.length
            current = current.next
        }

        return result
    }

    public split(params: SplitTextParams, convert_to_tree?: true): SplitTextResult
    public split(params: SplitTextParams, convert_to_tree?: false): SplitTextResultLinkedList
    public split(params: SplitTextParams, convert_to_tree = true) {
        const {
            start_node_id,
            start_index,
            end_node_id = start_node_id,
            end_index = start_index
        } = params

        const linked_list = this.convertToLinkedList()

        const split = linked_list.split({
            start_node_id,
            start_index,
            end_node_id,
            end_index
        })

        if (convert_to_tree) {
            return {
                before: split.before.convertToTree(),
                range: split.range?.convertToTree() || null, 
                after: split.after.convertToTree(),
            }
        } else {
            return {
                before: split.before,
                range: split.range,
                after: split.after,
            }
        }
    }

    public applySchema(params: ApplySchemaParams): ApplySchemaResult {
        const {
            type,
            start_node_id,
            start_index,
            end_node_id,
            end_index
        } = params

        const has_no_start = !start_node_id && start_index === undefined
        const has_no_end = !end_node_id && end_index === undefined

        const is_whole_text = (has_no_start && has_no_end)
            || (
                start_index === 0 
                && start_node_id === this.first_leaf.id
                && end_node_id === this.last_leaf.id
                && end_index === this.last_leaf.length
            ) 

        let start_node_cumulative_index
        let end_node_cumulative_index
        
        if (!has_no_start) {
            start_node_cumulative_index = this.getCumulativeIndex(start_node_id, start_index)
        }

        if (!has_no_end) {
            end_node_cumulative_index = this.getCumulativeIndex(end_node_id, end_index)
        }

        if (is_whole_text) {
            const new_node = this.createNode({
                type,
                data: this.toJSON()
            })

            this.replaceData([new_node.toJSON()])
        }
        else {
            const split_params = {
                start_node_id: start_node_id ?? this.first_leaf.id,
                start_index: start_index ?? 0,
                end_node_id: end_node_id ?? this.last_leaf.id,
                end_index:  end_index ?? this.last_leaf.length
            }

            let { before, range, after } = this.split(split_params)

            const new_node = this.createNode({
                type,
                data: range
            })

            const data_result = [
                ...removeFieldDeep(before, ['id']),
                removeFieldDeep(new_node.toJSON(), ['id']),
                ...removeFieldDeep(after, ['id'])
            ]

            this.replaceData(data_result)
        }

        this.normalize()
        
        const result: ApplySchemaResult = {}

        if (start_node_cumulative_index !== undefined) {
            const [{ id: start_id }, index] = this.getNodeByCumulativeIndex(start_node_cumulative_index)

            result.start_node_id = start_id
            result.start_index = index
        }

        if (end_node_cumulative_index) {
            const [{ id: end_id }, index] = this.getNodeByCumulativeIndex(end_node_cumulative_index)

            result.end_node_id = end_id
            result.end_index = index
        }

        return result
    }

    public removeSchema(params: ApplySchemaParams) {
        const {
            type,
            start_node_id,
            start_index,
            end_node_id,
            end_index
        } = params

        const has_no_start = !start_node_id && start_index === undefined
        const has_no_end = !end_node_id && end_index === undefined

        let start_node_cumulative_index
        let end_node_cumulative_index
        
        if (!has_no_start) {
            start_node_cumulative_index = this.getCumulativeIndex(start_node_id, start_index)
        }

        if (!has_no_end) {
            end_node_cumulative_index = this.getCumulativeIndex(end_node_id, end_index)
        }

        const split_params = {
            start_node_id: start_node_id ?? this.first_leaf.id,
            start_index: start_index ?? 0,
            end_node_id: end_node_id ?? this.last_leaf.id,
            end_index:  end_index ?? this.last_leaf.length
        }

        let { before, range, after } = this.split(split_params, false)

        let current = range.head

        while (current) {
            current.schemas = current.schemas.filter(schemas => schemas.type !== type)

            if (!current.schemas.length) {
                current.schemas.push(this.default_schema)
            }

            current = current.next
        }

        before.concat(range)
        before.concat(after)

        before.normalize()

        this.replaceData(
            before.convertToTree()
        )
        
        const result: ApplySchemaResult = {}

        if (start_node_cumulative_index !== undefined) {
            const [{ id: start_id }, index] = this.getNodeByCumulativeIndex(start_node_cumulative_index)

            result.start_node_id = start_id
            result.start_index = index
        }

        if (end_node_cumulative_index) {
            const [{ id: end_id }, index] = this.getNodeByCumulativeIndex(end_node_cumulative_index)

            result.end_node_id = end_id
            result.end_index = index
        }

        return result
    }

    public convertToLinkedList(): TypicalTextLinkedList {
        let linked_list = new TypicalTextLinkedList()

        let current = this.first_leaf

        while (current) {
            // const schemas: Set<TypicalTextNodeSchema> = new Set()
            const schemas: TypicalTextNodeSchema[] = [] 

            let parent = current

            while (parent) {
                schemas.push(parent.schema)
                parent = parent.parent
            }

            const node = new TypicalTextLinkedListNode({
                id: current.id,
                // Order is crucial
                schemas: this.getSortedSchemas(schemas),
                data: current.data as string // this will always be a string 
            })

            linked_list.addNode(node)

            if (current.next?.text?.id === this.id) {
                current = current.next
            } else {
                current = null
                break
            }
        }

        return linked_list
    }

    public delete() {
        const delete_event = new CustomEvent('delete')

        document.getElementById(this.id).dispatchEvent(delete_event)
    }

    public focus() {
        this.last_leaf.focus()
    }
    
    public normalize() {
        const linked_list = this.convertToLinkedList()

        linked_list.normalize()

        this.replaceData(linked_list.convertToTree())
    }

    toJSON(): ITypicalTextNode[] {
        return this.data.map(node => node.toJSON())
    }
}

interface LinkedListSplitParams {
    start_node_id: string
    start_index: number
    end_node_id?: string
    end_index?: number
}

interface LinkedListSplitResult {
    before: TypicalTextLinkedList
    range: TypicalTextLinkedList | null
    after: TypicalTextLinkedList
}

type LinkedListSplitResultTree = {
    before: ITypicalTextNode[]
    range: ITypicalTextNode[] | null
    after: ITypicalTextNode[]
}
export class TypicalTextLinkedList {
    head: TypicalTextLinkedListNode

    constructor(head?: TypicalTextLinkedListNode) {
        this.head = head
    }

    public getLast(): TypicalTextLinkedListNode {
        let last = this.head

        if (last) {
            let iterations = 0
            while (last.next) {
                iterations++ 

                if (iterations > 30) break

                last = last.next
            }
        }

        return last
    }

    private addHead(node: TypicalTextLinkedListNode) {
        this.head = node
    }

    public addNode(node: TypicalTextLinkedListNode) {
        // To remove linked nodes if any just in case
        const node_copy = new TypicalTextLinkedListNode({
            id: node.id,
            data: node.data,
            schemas: node.schemas
        })

        if (!this.head) {
            this.addHead(node_copy)
        } else {
            const last = this.getLast()
    
            last.next = node_copy
            node_copy.prev = last
        }
    }

    public getNode(id: string): TypicalTextLinkedListNode | null {
        let result: TypicalTextLinkedListNode | null = null

        let node = this.head

        while (node) {
            if (node.id === id) {
                result = node
                break
            }

            node = node.next
        }

        return result
    }

    public removeNode(id: string): TypicalTextLinkedListNode | null {
        const node = this.getNode(id)

        if (node) {
            if (node.id === this.head.id) {
                this.head = node.next
                this.head.prev = null
            }
            else {
                if (node.prev) {
                    node.prev.next = node.next
                }
    
                if (node.next) {
                    node.next.prev = node.prev
                }
            }

            node.next = null
            node.prev = null

            return node
        }

        return null
    }


    public concat(list: TypicalTextLinkedList) {
        const { head } = list
        
        const last = this.getLast()

        if (last) {
            last.next = head
            head.prev = last
        }
    }

    public get length(): number {        
        let length = 0
        let current = this.head

        while (current) {
            length++

            current = current.next
        }

        return length
    }

    private removeNodesDuplicatedSchemas(): void {
        let current = this.head

        while (current) {
            current.removeDuplicatedSchemas()

            current = current.next
        }
    }

    public normalize() {
        this.removeNodesDuplicatedSchemas()
        
        const hasSameTypes = (schemas: TypicalTextNodeSchema[], prev_schemas: TypicalTextNodeSchema[] = []): boolean => {
            return schemas.every((schema, index) => prev_schemas[index]?.type === schema.type)
        }

        const isMergeable = (schemas: TypicalTextNodeSchema[]): boolean => {
            return schemas.every(schema => schema.mergeable)
        }

        const canOmitDefaultSchema = (node: TypicalTextLinkedListNode): boolean => {
            let result = true

            const next = node.next

            if (next) {
                let has_same_schemas = false

                for (const [index, schema] of node.schemas.entries()) {
                    // Don't compare the last item
                    // If they are the same, they will be merged afterwards
                    // If they aren't, you can't omit the default schema anyway
                    if (index !== node.schemas.length - 1) {
                        has_same_schemas = next.schemas[index]?.type === schema.type
                    }
                }

                result = !has_same_schemas
            }

            return result
        }

        let current = this.head

        while (current) {
            const { id } = current

            // Remove empty nodes
            if (!current.data && this.length > 1) {
                current = current.next

                this.removeNode(id)

                continue
            }
            // Merge similar nodes
            else if (
                current.prev
                && isMergeable(current.schemas)
                && hasSameTypes(current.schemas, current.prev.schemas)
            ) {
                current.prev.data += current.data

                // After merge we should treat prev node as current
                current = current.prev

                this.removeNode(id)
            }

            // Remove default schema if possible
            if (
                current.schemas.length > 1
                && current.schemas.at(-1)?.is_default
                && canOmitDefaultSchema(current)
            ) {
                current.schemas.pop()
            }

            current = current.next
        }
    }

    public split(params: LinkedListSplitParams): LinkedListSplitResult {
        const {
            start_node_id,
            start_index,
            end_node_id = start_node_id,
            end_index = start_index
        } = params

        const is_same_node = start_node_id === end_node_id
        const is_collapsed = is_same_node && start_index === end_index 

        const result = {
            before: new TypicalTextLinkedList(),
            range: is_collapsed ? null : new TypicalTextLinkedList(),
            after: new TypicalTextLinkedList()
        }

        type Phase = keyof typeof result

        let current = this.head
        let phase: Phase = 'before' 

        let iterations = 0

        while (current) {
            iterations++

            if (iterations > 25) break

            const next = current.next

            if (is_same_node && current.id === start_node_id) {
                const [left, right] = current.split(start_index)
                
                result.before.addNode(left)

                if (!is_collapsed) {
                    const [left_2, right_2] = right.split(end_index - start_index)

                    result.range.addNode(
                        new TypicalTextLinkedListNode({
                            id: id('node'),
                            data: left_2.data,
                            schemas: left_2.schemas
                        })
                    )

                    result.after.addNode(right_2)
                }
                else {
                    result.after.addNode(right)
                }

                phase = 'after'
            }
            else if (current.id === start_node_id) {
                const [left, right] = current.split(start_index)

                result.before.addNode(left)
                result.range.addNode(right)

                phase = 'range'
            }
            else if (current.id === end_node_id) {
                const [left, right] = current.split(end_index)

                result.range.addNode(left)
                result.after.addNode(right)

                phase = 'after'
            }
            else {
                result[phase].addNode(current)
            }

            current = next
        }

        return result
    }

    public toString() {
        const result = []

        let current = this.head

        let iterations = 0

        while (current) {
            iterations++

            if (iterations > 25) break

            result.push(current.data)

            current = current.next
        }

        return result.join(' => ')
    }

    public convertToTree(): ITypicalTextNode[] {
        const result: ITypicalTextNode[] = []

        const lookupNode = (array: ITypicalTextNode[], type: string, target_level: number, current_level = 0) => {
            const last_node = array.at(-1)

            if (last_node && Array.isArray(last_node.data)) {
                if (last_node.type === type) {
                    return last_node
                }
                else if (target_level !== current_level) {
                    return lookupNode(last_node.data, type, target_level, current_level + 1)
                }
                else {
                    return null
                }
            }
            else {
                return null
            }
        }

        let current_node = this.head

        let iterations = 0

        while (current_node) {
            iterations++

            if (iterations > 35) break
            let target_array = result

            for (const [index, schema] of current_node.schemas.entries()) {
                // Handling the leaf
                if (index + 1 === current_node.schemas.length) {
                    target_array.push({
                        id: current_node.id,
                        data: current_node.data,
                        type: schema.type
                    })
                }
                else {
                    const node = lookupNode(target_array, schema.type, index)

                    if (node) {
                        target_array = node.data
                    }
                    else {
                        const new_node = {   
                            id: id('node'),
                            data: [],
                            type: schema.type
                        }

                        target_array.push(new_node)
                        target_array = new_node.data
                    }
                }
            }

            current_node = current_node.next
        }

        return result
    }
}

interface TypicalTextLinkedListNodeParams {
    id: string
    data: string
    schemas: TypicalTextNodeSchema[]
}

class TypicalTextLinkedListNode {
    id: string
    data: string
    schemas: TypicalTextNodeSchema[]

    next: TypicalTextLinkedListNode | null
    prev: TypicalTextLinkedListNode | null

    constructor(params: TypicalTextLinkedListNodeParams) {
        this.id = params.id
        this.data = params.data
        this.schemas = params.schemas
    }

    public removeDuplicatedSchemas(): void {
        const schemas_set = new Set()

        this.schemas = this.schemas.filter(schema => {
            if (schemas_set.has(schema.type)) {
                return false
            } else {
                schemas_set.add(schemas_set.add(schema.type))

                return true
            }
        })
    }

    public split(index: number): [TypicalTextLinkedListNode, TypicalTextLinkedListNode] {
        const data_split = this.data.split('')

        const left_data = data_split.slice(0, index).join('')
        const right_data = data_split.slice(index).join('')

        const left_node = new TypicalTextLinkedListNode({
            id: this.id,
            data: left_data,
            schemas: this.schemas
        })

        const right_node = new TypicalTextLinkedListNode({
            id: id('node'),
            data: right_data,
            schemas: this.schemas
        })

        return [left_node, right_node]
    }
}