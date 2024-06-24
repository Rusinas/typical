import { defineAsyncComponent } from 'vue'
import { TypicalTextNodeSchema } from '~typical/text/TypicalText'

export const ItalicTextSchema = new TypicalTextNodeSchema({
    name: 'Italic',
    type: 'italic',
    tag: 'i',
    menu_item_component: defineAsyncComponent(
        () => import('~typical/text-nodes/Italic/Italic.menu.element.vue')
    )
})