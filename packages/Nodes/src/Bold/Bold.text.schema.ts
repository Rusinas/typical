import { defineAsyncComponent } from 'vue'
import { TypicalTextNodeSchema } from '~typical/text/TypicalText'

export const BoldTextSchema = new TypicalTextNodeSchema({
    name: 'Bold',
    type: 'bold',
    tag: 'strong',
    menu_item_component: defineAsyncComponent(
        () => import('~typical/text-nodes/Bold/Bold.menu.element.vue')
    )
})