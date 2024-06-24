import fs from 'fs'
import dayjs from 'dayjs'

export async function saveResults(name: string, result: any, expect: any) {
    const date = dayjs(Date.now()).format('YYYY-MM-DD HH-mm-ss') 
    const folder_name = `${name} ${date}`

    const test_results_dir = '../../../test-results'
    const current_test_dir = `${test_results_dir}/${folder_name}`

    createFolder(test_results_dir)
    createFolder(current_test_dir)


    fs.writeFileSync(`${current_test_dir}/result.json`, formatJSON(result))
    fs.writeFileSync(`${current_test_dir}/expect.json`, formatJSON(expect))
}

function formatJSON(input: any): string {
    return JSON.stringify(input, null, 4)
}

function createFolder(path: string) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path)
    }
}