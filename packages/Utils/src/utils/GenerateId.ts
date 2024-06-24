const ids_map = new Map()

export function generateId(prefix = 'id'): string {
    const random_string = (Math.random() + 1).toString(36).substring(2)
    const id = `${prefix}-${random_string}`

    if (ids_map.has(id)) {
        return generateId()
    } else {
        ids_map.set(id, null)
    }

    return id
}