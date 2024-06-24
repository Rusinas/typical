import { defineAsyncComponent } from 'vue'
import { TypicalElementSchema, type ITypicalElementSchema } from '~typical/editor/TypicalElement'
import { BoldTextSchema } from '@typical/nodes'

export const TextSchema = new TypicalElementSchema({
    component: defineAsyncComponent(
        () => import('~typical/elements/Text/Text.vue')
    ),
    // component: () => import('~typical/elements/Text/Text.vue'),
    name: 'Paragraph',
    type: 'text',
})

export const HeadingOneSchema = createTextElementSchema({
    name: 'Heading 1',
    type: 'heading_1',
    placeholder: 'Type sumfin',
    text_tag: 'h1',
    style: {
        element: {
            margin_top: '1em',
            margin_bottom: '1em',
        },
        text: {
            font_weight: 600,
            font_size: '2.25rem',
            line_height: '1.25em',
        }
    }
})

export const HeadingTwoSchema = createTextElementSchema({
    name: 'Heading 2',
    type: 'heading_2',
    placeholder: 'Type sumfing',
    text_tag: 'h2',
    style: {
        element: {
            margin_top: '1em',
            margin_bottom: '1em',
        },
        text: {
            font_weight: 600,
            font_size: '1.25rem',
            line_height: '1.25em',
        }
    }
})

export function createTextElementSchema(params: Omit<ITypicalElementSchema, 'component'>): TypicalElementSchema {
    return new TypicalElementSchema({
        ...params,
        // component: () => import('~typical/elements/Text/Text.vue'),
        component: defineAsyncComponent(
            () => import('~typical/elements/Text/Text.vue')
        ),
    })
}