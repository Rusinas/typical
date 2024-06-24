import { TypicalTextNode, TypicalText, DEFAULT_NODE_SCHEMA } from '~typical/text/TypicalText'

// This function will run over and over until previous and currents results are the same
// This is the only way to gurantee that everything is normalized completely
function normalize(text: TypicalText) {
    let old_hash: string = JSON.stringify(text.toJSON())
    let new_hash: string | null = null

    const killswitch = 99
    let iterations = 0

    while (old_hash !== new_hash) {
        iterations++
        if (iterations > killswitch) {
            break
        }

        normalizeNodes(text)

        old_hash = new_hash
        new_hash = JSON.stringify(text.toJSON())
    }
}

function normalizeNodes(text: TypicalText) {
    deleteEmptyNodes(text.data)
    mergeNodes(text)
    flattenNodes(text.data)
    mergeRootNodes(text.data)
}

function deleteEmptyNodes(data: TypicalTextNode[]) {
    for (let index = data.length - 1; index >= 0; index--) {
        const node = data[index]

        if (node.is_empty) {
            if (index > 0 || (index === 0 && data.length > 1)) {
                node.delete()
                continue
            }
        }

        const leaf = node.first_leaf
        let current = leaf.parent

        while (current) {
            for (let i = current.data.length - 1; i >= 0; i--) {
                const current_node = current.data[i] as TypicalTextNode

                if (current_node.is_empty) {
                    if (index > 0 || (index === 0 && current.data.length > 1)) {
                        current_node.delete()
                    }
                }
            }

            current = current.parent
        }
    }
}

function mergeNodes(text: TypicalText) {
    for (let index = text.data.length - 1; index >= 0; index--) {
        const node = text.data[index]

        const leaf = node.first_leaf

        let current = leaf?.parent

        while_loop: while (!!current) {
            for (let i = current.data.length - 1; i >= 0; i--) {
                const current_node = current.data[i] as TypicalTextNode

                if (i !== 0) {
                    const prev_node = current.data[i - 1] as TypicalTextNode

                    merge(current_node, prev_node)
                }
                else {
                    current = current_node.parent?.parent

                    if (!current) {
                        break while_loop
                    }
                }
            }
        }
    }
}

function mergeRootNodes(data: TypicalTextNode[]) {
    for (let index = data.length - 1; index >= 0; index--) {
        const node = data[index]

        if (index !== 0) {
            const prev = data[index - 1]

            merge(node, prev)
        }
    }
}

function merge(current: TypicalTextNode, prev: TypicalTextNode) {
    const is_mergeable = current.mergeable && prev.mergeable
    const same_type = current.type === prev.type

    if (is_mergeable && same_type) {
        if (typeof current.data === 'string') {
            prev.appendData(current.data)
        }
        else {
            prev.appendData([
                current.toJSON()
            ])
        }

        current.delete()
    }
}

function flattenNodes(data: TypicalTextNode[]) {
    for (let index = data.length - 1; index >= 0; index--) {
        const node = data[index]
        const is_default = node.type === DEFAULT_NODE_SCHEMA.type

        if (Array.isArray(node.data)) {
            if (is_default)  {
                node.data.forEach(item => item.parent = node.parent)
                node.parent_array.splice(node.index, 1, ...node.data)
            }

            flattenNodes(node.data)
        }
        else {
            const only_child = node.parent?.data.length === 1
            const same_type = node.type === node.parent?.type

            if (only_child && (same_type || is_default)) {
                node.parent.data = node.data
            }
        }
    }
}

export {
    normalize
}