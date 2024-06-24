import { describe, it, expect } from 'vitest'

import { datasets as NormalizationDatasets } from './data/TypicalTextNormalization.test.dataset'
import { datasets as SplittingDatasets } from './data/TypicalTextSplitting.test.dataset'

import { removeFieldDeep } from '@typical/utils'
import { saveResults } from './utils/SaveResults'

describe('TypicalText: Normalization', () => {
    NormalizationDatasets.forEach((dataset, index) => {
        it(`dataset ${index + 1}: ${dataset.title}`, () => {
            dataset.data.normalize()

            const result = removeFieldDeep(dataset.data.toJSON(), ['id']) 
            const expectation = removeFieldDeep(dataset.expect.toJSON(), ['id'])

            saveResults('Normalization', result, expectation)

            expect(result).toStrictEqual(expectation)
        })
    })
})

describe('TypicalText: Splitting', () => {
    SplittingDatasets.forEach((dataset, index) => {
        it(`dataset ${index + 1}: ${dataset.title}`, () => {
            const split_result = dataset.text.split({
                start_node_id: dataset.params.start_node_id,
                start_index: dataset.params.start_index,
                end_node_id: dataset.params.end_node_id,
                end_index: dataset.params.end_index,
            })

            const result = {
                before: removeFieldDeep(split_result.before, ['id']),
                range: removeFieldDeep(split_result.range || [], ['id']),
                after: removeFieldDeep(split_result.after, ['id']),
            }

            const expectation = {
                before: removeFieldDeep(dataset.expect.before, ['id']),
                range: removeFieldDeep(dataset.expect.range || [], ['id']),
                after: removeFieldDeep(dataset.expect.after, ['id']),
            }

            // saveResults('Splitting', result, expectation)

            expect(result).toStrictEqual(expectation)
        })
    })
})
