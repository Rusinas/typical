import { TypicalText, TypicalTextNode, type ITypicalTextNode, TypicalTextNodeSchema } from '~typical/text/TypicalText'

interface IDataset {
    title: string
    data: ITypicalTextNode[]
    expect: ITypicalTextNode[]
}

type Dataset = {
    title: string
    data: TypicalText
    expect: TypicalText
}

function createDataset({ title, data, expect }: IDataset): Dataset {
    const BoldSchema = new TypicalTextNodeSchema({
        type: 'bold',
        name: 'bold'
    })

    const ItalicSchema = new TypicalTextNodeSchema({
        name: 'italic',
        type: 'italic'
    })

    const schemas = [
        BoldSchema,
        ItalicSchema
    ]

    const data_text = new TypicalText({
        data,
        schemas
    })

    const expect_text = new TypicalText({
        data: expect,
        schemas
    })

    return {
        title,
        data: data_text,
        expect: expect_text
    }
}

const datasets: Dataset[] = []

const dataset_1 = createDataset({
    title: 'Test two empty arrays', 
    data: [],
    expect: [],
})


const dataset_2 = createDataset({
    title: 'Test removing empty string', 
    data: [
        {
            data: '',
            type: 'text',
        },
        {
            data: [
                {
                    data: '',
                    type: 'text',
                },
                {
                    type: 'text',
                    data: [
                        {
                            data: '',
                            type: 'text',
                        }
                    ]
                }
            ],
            type: 'text',
        },
        {
            data: [
                {
                    type: 'text',
                    data: '',
                },
                {
                    type: 'text',
                    data: '',
                },
                {
                    type: 'text',
                    data: 'Test text'
                },
                {
                    type: 'text',
                    data: [
                        {
                            type: 'text',
                            data: [
                                {
                                    type: 'text',
                                    data: '',
                                },
                                {
                                    type: 'text',
                                    data: '',
                                },
                                {
                                    type: 'text',
                                    data: '',
                                }
                            ]
                        }
                    ]
                }
            ],
            type: 'text',
        },
        {
            data: '',
            type: 'text',
        },
    ], 
    expect: [
        {
            data: 'Test text',
            type: 'text'
        },
    ]
})

const dataset_3 = createDataset({
    title: 'Test flattening', 
    data: [
        {
            type: 'text',
            data: [
                {
                    type: 'text',
                    data: [
                        {
                            type: 'text',
                            data: [
                                {
                                    type: 'text',
                                    data: [
                                        {
                                            type: 'text',
                                            data: [
                                                {
                                                    type: 'text',
                                                    data: [
                                                        {
                                                            type: 'text',
                                                            data: [
                                                                {
                                                                    type: 'text',
                                                                    data: 'Test',
                                                                },
                                                            ], 
                                                        },
                                                    ], 
                                                },
                                            ], 
                                        },
                                    ], 
                                },
                            ], 
                        },
                    ], 
                },
            ], 
        },
        {
            type: 'text',
            data: [
                {
                    type: 'text',
                    data: [
                        {
                            type: 'text',
                            data: [
                                {
                                    type: 'text',
                                    data: [
                                        {
                                            type: 'text',
                                            data: [
                                                {
                                                    type: 'text',
                                                    data: [
                                                        {
                                                            type: 'text',
                                                            data: [
                                                                {
                                                                    type: 'text',
                                                                    data: ' flattening',
                                                                },
                                                            ], 
                                                        },
                                                    ], 
                                                },
                                            ], 
                                        },
                                    ], 
                                },
                            ], 
                        },
                    ], 
                },
            ], 
        },
    ], 
    expect: [
        {
            data: 'Test flattening',
            type: 'text'
        },
    ]
})

const dataset_4 = createDataset({
    title: 'Test merging similar lines [0 deep, plain text]', 
    data: [
        {
            data: 'Test',
            type: 'text',
        },
        {
            data: ' merge',
            type: 'text',
        },
    ], 
    expect: [
        {
            data: 'Test merge',
            type: 'text'
        },
    ]
})

const dataset_5 = createDataset({
    title: 'Test merging similar lines [1 deep]', 
    data: [
        {
            type: 'text',
            data: [
                {
                    data: 'Test',
                    type: 'text',
                },
                {
                    data: ' merge',
                    type: 'text',
                },
            ]
        }
    ], 
    expect: [
        {
            data: 'Test merge',
            type: 'text'
        },
    ]
})


const dataset_6 = createDataset({
    title: 'Test merging different schemas',
    data: [
        {
            id: 'level-1-text-node',
            type: 'text',
            data: [
                {
                    id: 'level-2-bold-node',
                    type: 'bold',
                    data: 'bold ',
                },
                {
                    id: 'level-2-bold-node-2',
                    type: 'bold',
                    data: 'text'
                },
                {
                    id: 'level-2-italic-node',
                    type: 'italic',
                    data: [
                        {
                            id: 'level-3-italic-node',
                            type: 'italic',
                            data: 'italic text'
                        }
                    ]
                },
                {
                    id: 'level-2-italic-node-2',
                    type: 'italic',
                    data: [
                        {   
                            id: 'level-3-italic-node-2',
                            type: 'italic',
                            data: ' italic text'
                        }
                    ]
                },
            ]
        }
    ],
    expect: [
        {
            type: 'bold',
            data: 'bold text'
        },
        {
            type: 'italic',
            data: 'italic text italic text'
        }
    ]
})

const dataset_7 = createDataset({
    title: 'Test merging default schema into custom',
    data: [
        {
            type: 'text',
            data: 'Привет, это '
        },
        {
            type: 'bold',
            data: [
                {
                    type: 'text',
                    data: 'жирный'
                }
            ]
        },
        {
            type: 'text',
            data: ' текст'
        }
    ],
    expect: [
        {
            type: 'text',
            data: 'Привет, это '
        },
        {
            type: 'bold',
            data: 'жирный'
        },
        {
            type: 'text',
            data: ' текст'
        }
    ]
})


// 'Hardcode' case. Need to rethink algorithm - done
const dataset_8 = createDataset({
    title: 'Test merging different types [hardcore]', 
    data: [
        {
            type: 'bold',
            data: [
                {
                    data: 'Italic in',
                    type: 'italic',
                },
                {
                    data: ' bold. ',
                    type: 'italic',
                },
            ]
        },
        {
            type: 'italic',
            data: [
                {
                    data: 'Bold in',
                    type: 'bold',
                },
                {
                    data: ' italic.',
                    type: 'bold',
                },
            ]
        },
    ], 
    expect: [
        {
            type: 'bold',
            data: [
                {
                    type: 'italic',
                    data: 'Italic in bold. Bold in italic.'
                }
            ],
        },
    ]
})

datasets.push(
    dataset_1,
    dataset_2,
    dataset_3,
    dataset_4,
    dataset_5,
    dataset_6,
    dataset_7,
    dataset_8
)

export {
    datasets
}