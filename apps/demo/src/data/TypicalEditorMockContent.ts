export const EmptyContent = []

export const TextContent = [
    {
        type: 'heading_1',
        data: [
            {
                type: 'text',
                data: [
                    {
                        type: 'text',
                        data: 'Simple text content'
                    },
                ],
            }
        ]
    },
    {
        type: 'text',
        data: 'In fact, there’s a financial incentive to get you hooked on these digital distractions. For example, the more time you spend on a social media platform, the more money they make through advertising revenue.'
    },
    {
        type: 'text',
        data: 'For example, when your long-term goal is to get in shape, but you end up binge-watching Netflix for hours, it’s the result of your limbic system overriding your prefrontal cortex.'
    },
    {
        type: 'text',
        data: 'Here is a line break\nfor no reason at all'
    }
]

export const BlogContent = [
    {
        type: 'heading_1',
        data: [
            {
                type: 'text',
                data: [
                    {
                        type: 'text',
                        data: 'This is a blog post'
                    },
                    {
                        type: 'italic',
                        data: ' check check'
                    },
                ],
            }
        ]
    },
    {
        type: 'heading_2',
        data: [
            {
                type: 'text',
                data: 'Subheader lol?',
            }
        ]
    },
    {
        type: 'image',
        additional_data: {
            url: 'https://images.takeshape.io/1f1d0876-be74-4b33-99c8-6ac93f1d70db/dev/4468e4af-526e-4ed6-a0c1-a0dc7673cef3/nicolo-di-giovanni-535450-unsplash.png?auto=compress%2Cformat&w=1200'
        },
        data: [
            {
                type: 'text',
                data: 'This is the image description',
            }
        ]
    },
    {
        type: 'text',
        data: [
            {
                type: 'text',
                data: 'This is just a paragraph hello ',
            },
            {
                type: 'text',
                data: [
                    {
                        type: 'text',
                        data: 'Level 1 nesting',
                    },
                    {
                        type: 'text',
                        data: [
                            {
                                type: 'text',
                                data: 'Level 2 nesting'
                            },
                            {
                                type: 'text',
                                data: [
                                    {
                                        type: 'text',
                                        data: 'Level 3 nesting'
                                    }
                                ]
                            }
                        ]
                    }

                ],
            }
        ]
    },
    {
        type: 'text',
        data: [
            {
                type: 'text',
                data: '',
            }
        ]
    }
]

export const EmojiContent = [
    {
        type: 'heading_1',
        data: [
            {
                type: 'text',
                data: [
                    {
                        type: 'text',
                        data: 'This is a bold blog post 🤡'
                    },
                    {
                        type: 'italic',
                        data: ' check check'
                    },
                ],
            }
        ]
    },
    {
        type: 'text',
        data: [
            {
                type: 'text',
                data: [
                    {
                        type: 'text',
                        data: 'Helloooooo! 🔥🔥🔥'
                    },
                    {
                        type: 'italic',
                        data: ' check check'
                    },
                ],
            }
        ]
    },
    {
        type: 'text',
        data: [
            {
                type: 'text',
                data: [
                    {
                        type: 'text',
                        data: '🔥🔥🔥This post is fire! 🔥🔥🔥'
                    },
                ],
            }
        ]
    },
    {
        type: 'text',
        data: [
            {
                type: 'text',
                data: [
                    {
                        type: 'text',
                        data: '🔥🔥🔥👨‍💻👨‍💻👨‍💻'
                    },
                ],
            }
        ]
    },
]

// Huge content generation
const element_types = ['text', 'text', 'text', 'text', 'text', 'text', 'text', 'text', 'text', 'text', 'text', 'heading_1', 'heading_2'] as const
const node_types = ['text', 'bold', 'italic']

const headings = [
    'Mental mediumship',
    'Description and identification',
    'Distribution and habitat',
    'Reproductive suppression',
    'Kin recognition and conflict'
]
const strings = [
    'You know what they’re like. Mechanical keyboard in the office? Can’t make the standup because they were thinking about that problem (it’s 5 minutes to mention what you’re thinking). How long did it take to get the latte?',
    'Some people in the industry do have degrees. I’ve worked with Doctors (not the medical kind, OK). Those with qualifications in the industry often choose not to mention them, because within many organizations there is a reverse snobbishness around education.',
    'Yet others wear glasses without medical reason (which really happens) and stand in front of a whiteboard on those video calls.',
    'Next we have deconstructed pancakes! This is a common layout for marketing websites, for example there might be a row of 3 items, usually with an image, a title, and then some text describing some of the features of the product. On mobile, we want them to stack nicely and scale as we increase screen size.',
    'Several different variants of mediumship have been described; arguably the best-known forms involve a spirit purportedly taking control of a medium`s voice and using it to relay a message, or where the medium simply "hears" the message and passes it on. Other forms involve materializations of the spirit or the presence of a voice, and telekinetic activity.'
]

function createRandomElement() {
    const type = getRandomItem(element_types)

    let data

    if (type === 'text') {
        data = createRandomNodes()
    }
    else {
        data = getRandomItem(headings)
    }

    return {
        type, data
    }
}

function createRandomNodes() {
    const nodes_count = getRandomInt(1, 5)

    const result = []

    for (let i = 0; i < nodes_count; i++) {
        result.push(createRandomNode())
    }

    return result
}

function createRandomNode() {
    const type = getRandomItem(node_types)
    const data = getRandomItem(strings)

    return {
        type,
        data
    }
}

function getRandomItem(list) {
    return list[Math.floor((Math.random() * list.length))];
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// export const HugeContent = getHugeContent()

export function getHugeContent(elements_count = 100) {
    const result = []

    for (let i = 0; i < elements_count; i++) {
        result.push(createRandomElement())
    }

    return result
}