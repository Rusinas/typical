import { type ITypicalElement } from '~typical/editor/TypicalElement' 

type SplitDataset = {
    title: string
    params: {
        start_node_id: string
        start_index: number
        end_node_id?: string
        end_index?: number
    }
    data: ITypicalElement[]
    expect: {
        before: ITypicalElement[]
        range: ITypicalElement | ITypicalElement[]
        after: ITypicalElement[]
    }
}

const split_dataset_1: SplitDataset = {
    title: 'Split: split single element',
    params: {
        start_index: 0,
        start_node_id: 'node-1',
        end_index: 6,
        end_node_id: 'node-2'
    },
    data: [
        {
            id: 'element-1',
            type: 'text',
            data: [
                {
                    id: 'node-1',
                    type: 'text',
                    data: 'Hello '
                },
                {
                    id: 'node-2',
                    type: 'text',
                    data: ' world'
                }
            ]
        }
    ],
    expect: {
        before: [],
        range: [
            {
                id: 'element-1',
                type: 'text',
                data: [
                    {
                        id: 'node-1',
                        type: 'text',
                        data: 'Hello '
                    },
                    {
                        id: 'node-2',
                        type: 'text',
                        data: ' world'
                    }
                ]
            }
        ],
        after: []
    }
}

export const datasets = [
    split_dataset_1
]