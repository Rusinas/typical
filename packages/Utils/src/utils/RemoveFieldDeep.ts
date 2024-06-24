export function removeFieldDeep(input: any, fields: string[]): any
export function removeFieldDeep(input: any[], fields: string[]): any[]
export function removeFieldDeep(input: any | any[], fields: string[]) {
    if (Array.isArray(input)) {
        const result = []

        for (const item of input) {
            result.push(removeFieldDeep(item, fields))
        }

        return result
    } else {
        const result = {}

        for (const key of Object.keys(input)) {
            if (!fields.includes(key)) {
                if (Array.isArray(input[key])) {
                    const nested_result = []
    
                    for (const nested_key of Object.keys(input[key])) {
                        nested_result[nested_key] = removeFieldDeep(input[key][nested_key], fields)
                    }
    
                    result[key] = nested_result
                }
                else if (typeof input[key] === 'object') {
                    result[key] = removeFieldDeep(input[key], fields)
                }
                else  {
                    result[key] = input[key]
                }
            }
        }

        return result
    }
}