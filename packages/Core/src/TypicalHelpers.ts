import { ITypicalTextNode, TypicalText, TypicalTextNode } from '~typical/text/TypicalText'

// Returns the lengths for each applied formatting
export type FormattingLengths = Record<string, number>

class TypicalTree {
    data: TreeNode[]

    constructor(data: string | ITypicalTextNode[]) {
        this.data = this.initData(data)
    }

    private initData(data: string | ITypicalTextNode[]): TreeNode[] {
        const result = []

        if (typeof data === 'string') {
            result.push(
                this.createNode({ data })
            )
        }
        else if (Array.isArray(data)) {
            for (const node of data) {
                result.push(
                    this.createNode(node)
                )
            } 
        }

        return result
    }

    public createNode(node: Partial<ITypicalTextNode>, parent?: TreeNode): TreeNode {
        const result = new TreeNode({
            id: node.id,
            tree: this,
            data: node.data,
            type: node.type,
            parent
        })

        return result
    }

    public get first_leaf(): TreeNode | null {
        return this.data[0]?.first_leaf
    }
}

interface TreeNodeParams {
    id: string
    type: string
    data: string | ITypicalTextNode[]
    tree: TypicalTree
    parent?: TreeNode
}

class TreeNode {
    id: string
    type: string
    data: string | TreeNode[]
    parent: TreeNode
    tree: TypicalTree

    constructor(params: TreeNodeParams) {
        this.id = params.id
        this.type = params.type
        this.tree = params.tree
        this.data = this.initData(params.data)
        this.parent = params.parent
    }

    private initData(data: string | ITypicalTextNode[]): string | TreeNode[] {
        let result: string | TreeNode[] = []

        if (typeof data === 'string') {
            result = data
        }
        else if (Array.isArray(data)) {
            for (const node of data) {
                result.push(
                    this.tree.createNode(node, this)
                )
            }
        }
        else {
            result = ''
        }

        return result
    }

    public get parent_array(): TreeNode[] {
        let parent

        if (this.parent) {
            parent = this.parent.data
        } else {
            parent = this.tree.data
        }

        return parent
    }

    public get index(): number {
        return this.parent_array.findIndex(node => node.id === this.id) ?? -1
    }

    public get is_leaf(): boolean {
        return typeof this.data === 'string'
    }

    public get first_leaf(): TreeNode {
        if (Array.isArray(this.data)) {
            return this.data[0].first_leaf
        } else {
            return this
        }
    }

    public get next(): TreeNode | null {
        let next: TreeNode | null = null

        if (this.parent && typeof this.parent.data !== 'string') {
            next = this.parent.data[this.index + 1] || this.parent?.next || null
        } else {
            next = this.tree.data[this.index + 1] || null
        }

        if (next && !next.is_leaf) {
            next = next.first_leaf
        }

        return next
    }
}

class TypicalLinkedList {
    head: ListNode

    constructor(head?: ListNode) {
        this.head = head
    }

    private getLast(): ListNode {
        let last = this.head

        if (last) {
            while (last.next) {
                last = last.next
            }
        }

        return last
    }

    private addHead(head: ListNode) {
        this.head = head
    }

    public addNode(node: ListNode) {
        if (!this.head) {
            this.addHead(node)
        } else {
            const last = this.getLast()
    
            last.next = node
            node.prev = last
        }
    }

    public getNode(id: string): ListNode | null {
        let result: ListNode | null = null

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

    public removeNode(id: string) {
        const node = this.getNode(id)

        if (node) {
            node.prev.next = node.next
            node.next.prev = node.prev
        }
    }
}

type ListNodeParams = {
    id: string
    types: Set<string>
    data: string
}

class ListNode {
    id: string
    types: Set<string>
    data: string
    next: ListNode | null
    prev: ListNode | null

    constructor(params: ListNodeParams) {
        this.id = params.id
        this.types = params.types
        this.data = params.data
    }
}

export class TypicalHelpers {
    public static getTextLength(data: string | ITypicalTextNode[]) {
        let result = 0

        if (Array.isArray(data)) {
            for (const node of data) {
                result += this.getTextLength(node.data)
            }
        } else {
            result += data?.length || 0
        }

        return result
    }

    public static getFormattingLengths(data: string | ITypicalTextNode[]): FormattingLengths {
        let result: FormattingLengths = {}

        if (Array.isArray(data)) {
            const linked_list = this.convertTreeToList(data)

            let current_node = linked_list.head

            while (current_node) {
                for (const type of current_node.types) {
                    if (!result[type]) result[type] = 0

                    result[type] += current_node.data.length
                }

                current_node = current_node.next
            }
        }

        return result
    }

    private static convertTreeToList(data: ITypicalTextNode[]): TypicalLinkedList {
        const tree = new TypicalTree(data)

        let current = tree.first_leaf

        let linked_list = new TypicalLinkedList()

        while (current) {
            const types: Set<string> = new Set()

            let parent = current

            while (parent) {
                types.add(parent.type)
                parent = parent.parent
            }

            const node = new  ListNode({
                id: current.id,
                types,
                data: current.data as string // this will always be string 
            })

            linked_list.addNode(node)

            current = current.next
        }

        return linked_list
    }

    convertListToTree(list: TypicalLinkedList): TypicalTree {
        
    }

    normalizeList(list: TypicalLinkedList): TypicalLinkedList {

    }
}