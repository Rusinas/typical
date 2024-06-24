import { TypicalText, type ITypicalTextNode } from '~typical/text/TypicalText'

type SplitTextDataset = {
    title: string
    params: {
        start_node_id: string
        start_index: number
        end_node_id?: string
        end_index?: number
    }
    text: TypicalText
    expect: {
        before: ITypicalTextNode[]
        range: ITypicalTextNode[]
        after: ITypicalTextNode[]
    }
}

interface ISplitTextDataset {
    title: string
    params: {
        start_node_id: string
        start_index: number
        end_node_id?: string
        end_index?: number
    }
    data: ITypicalTextNode[]
    expect: {
        before: ITypicalTextNode[]
        range: ITypicalTextNode[]
        after: ITypicalTextNode[]
    }
}

function createDataset(params: ISplitTextDataset): SplitTextDataset {
    return {
        title: params.title,
        params: params.params,
        text: new TypicalText({
            data: params.data
        }),
        expect: params.expect
    }
}


const split_text_dataset_1: SplitTextDataset = createDataset({
    title: 'SplitText: Test single node',
    params: {
        start_node_id: 'node-1',
        start_index: 5
    },
    data: [
        {
            id: 'node-1',
            type: 'text',
            data: 'Hello, world'
        }
    ],
    expect: {
        before: [
            {
                id: 'node-1',
                type: 'text',
                data: 'Hello'
            }
        ],
        range: [],
        after: [
            {
                id: 'node-1',
                type: 'text',
                data: ', world'
            }
        ]
    }
})

const split_text_dataset_2: SplitTextDataset = createDataset({
    title: 'SplitText: Test split range in single node',
    params: {
        start_node_id: 'node-1',
        start_index: 3,
        end_index: 5,
    },
    data: [
        {
            id: 'node-1',
            type: 'text',
            data: 'Hello, world'
        }
    ],
    expect: {
        before: [
            {
                id: 'node-1',
                type: 'text',
                data: 'Hel'
            }
        ],
        range: [
            {
                id: 'node-1',
                type: 'text',
                data: 'lo'
            }
        ],
        after: [
            {
                id: 'node-1',
                type: 'text',
                data: ', world'
            }
        ]
    }
})

const split_text_dataset_3: SplitTextDataset = createDataset({
    title: 'SplitText: Multiple nodes, no nesting, no range',
    params: {
        start_node_id: 'node-1',
        start_index: 10,
    },
    data: [
        {
            id: 'node-1',
            type: 'text',
            data: 'Hello, world. '
        },
        {
            id: 'node-2',
            type: 'text',
            data: 'I am Stu Pedasso'
        },
    ],
    expect: {
        before: [
            {
                id: 'node-1',
                type: 'text',
                data: 'Hello, wor'
            }
        ],
        range: [],
        after: [
            {
                id: 'node-1',
                type: 'text',
                data: 'ld. '
            },
            {
                id: 'node-2',
                type: 'text',
                data: 'I am Stu Pedasso'
            },
        ]
    }
})

const split_text_dataset_4: SplitTextDataset = createDataset({
    title: 'SplitText: Multiple nodes, no nesting, range',
    params: {
        start_node_id: 'node-1',
        start_index: 10,
        end_node_id: 'node-2',
        end_index: 4
    },
    data: [
        {
            id: 'node-1',
            type: 'text',
            data: 'Hello, world. '
        },
        {
            id: 'node-2',
            type: 'text',
            data: 'I am Stu Pedasso'
        },
    ],
    expect: {
        before: [
            {
                id: 'node-1',
                type: 'text',
                data: 'Hello, wor'
            }
        ],
        range: [
            {
                id: 'node-1',
                type: 'text',
                data: 'ld. '
            },
            {
                id: 'node-2',
                type: 'text',
                data: 'I am'
            },
        ],
        after: [
            {
                id: 'node-2',
                type: 'text',
                data: ' Stu Pedasso'
            },
        ]
    }
})

const split_text_dataset_5: SplitTextDataset = createDataset({
    title: 'SplitText: Multiple nodes, nesting, range',
    params: {
        start_node_id: 'node-3',
        start_index: 6,
        end_node_id: 'node-8',
        end_index: 3
    },
    data: [
        {
            id: 'node-1',
            type: 'text',
            data: [
                {
                    id: 'node-2',
                    type: 'text',
                    data: [
                        {
                            id: 'node-3',
                            type: 'text',
                            data: 'Hello, world. '
                        }
                    ]
                }
            ]
        },
        {
            id: 'node-4',
            type: 'text',
            data: 'I am Stu Pedasso. '
        },
        {
            id: 'node-5',
            type: 'text',
            data: [
                {
                    id: 'node-6',
                    type: 'text',
                    data: [
                        {
                            id: 'node-7',
                            type: 'text',
                            data: [
                                {
                                    id: 'node-8',
                                    type: 'text',
                                    data: 'I love '
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            id: 'node-9',
            type: 'text',
            data: 'memes.'
        }
    ],
    expect: {
        before: [
            {
                id: 'node-1',
                type: 'text',
                data: [
                    {
                        id: 'node-2',
                        type: 'text',
                        data: [
                            {
                                id: 'node-3',
                                type: 'text',
                                data: 'Hello,'
                            }
                        ]
                    }
                ]
            },
        ],
        range: [
            {
                id: 'node-1',
                type: 'text',
                data: [
                    {
                        id: 'node-2',
                        type: 'text',
                        data: [
                            {
                                id: 'node-3',
                                type: 'text',
                                data: ' world. '
                            }
                        ]
                    }
                ]
            },
            {
                id: 'node-4',
                type: 'text',
                data: 'I am Stu Pedasso. '
            },
            {
                id: 'node-5',
                type: 'text',
                data: [
                    {
                        id: 'node-6',
                        type: 'text',
                        data: [
                            {
                                id: 'node-7',
                                type: 'text',
                                data: [
                                    {
                                        id: 'node-8',
                                        type: 'text',
                                        data: 'I l'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
        ],
        after: [
            {
                id: 'node-5',
                type: 'text',
                data: [
                    {
                        id: 'node-6',
                        type: 'text',
                        data: [
                            {
                                id: 'node-7',
                                type: 'text',
                                data: [
                                    {
                                        id: 'node-8',
                                        type: 'text',
                                        data: 'ove '
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: 'node-9',
                type: 'text',
                data: 'memes.'
            }
        ]
    }
})

const split_text_dataset_6: SplitTextDataset = createDataset({
    title: 'SplitText: Multiple nodes, nesting, no range',
    params: {
        start_node_id: 'node-8',
        start_index: 4
    },
    data: [
        {
            id: 'node-1',
            type: 'text',
            data: [
                {
                    id: 'node-2',
                    type: 'text',
                    data: [
                        {
                            id: 'node-3',
                            type: 'text',
                            data: 'Hello, world. '
                        }
                    ]
                }
            ]
        },
        {
            id: 'node-4',
            type: 'text',
            data: 'I am Stu Pedasso. '
        },
        {
            id: 'node-5',
            type: 'text',
            data: [
                {
                    id: 'node-6',
                    type: 'text',
                    data: [
                        {
                            id: 'node-7',
                            type: 'text',
                            data: [
                                {
                                    id: 'node-8',
                                    type: 'text',
                                    data: 'I love '
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            id: 'node-9',
            type: 'text',
            data: 'memes.'
        }
    ],
    expect: {
        before: [
            {
                id: 'node-1',
                type: 'text',
                data: [
                    {
                        id: 'node-2',
                        type: 'text',
                        data: [
                            {
                                id: 'node-3',
                                type: 'text',
                                data: 'Hello, world. '
                            }
                        ]
                    }
                ]
            },
            {
                id: 'node-4',
                type: 'text',
                data: 'I am Stu Pedasso. '
            },
            {
                id: 'node-5',
                type: 'text',
                data: [
                    {
                        id: 'node-6',
                        type: 'text',
                        data: [
                            {
                                id: 'node-7',
                                type: 'text',
                                data: [
                                    {
                                        id: 'node-8',
                                        type: 'text',
                                        data: 'I lo'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
        ],
        range: [],
        after: [
            {
                id: 'node-5',
                type: 'text',
                data: [
                    {
                        id: 'node-6',
                        type: 'text',
                        data: [
                            {
                                id: 'node-7',
                                type: 'text',
                                data: [
                                    {
                                        id: 'node-8',
                                        type: 'text',
                                        data: 've '
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: 'node-9',
                type: 'text',
                data: 'memes.'
            }
        ]
    }
})


export const datasets = [
    split_text_dataset_1,
    split_text_dataset_2,
    split_text_dataset_3,
    split_text_dataset_4,
    split_text_dataset_5,
    split_text_dataset_6,
] as const 
