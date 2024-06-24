<template lang="pug">
TypicalTextComponent(
    ref="typical_text_ref"
    :text="text"
    :editable="editable"
    class="typical-text-standalone"
)
</template>

<script lang="ts" setup>
import { 
    ref, 
    computed,
    watch,
    onUpdated,
    onMounted,
    onBeforeUnmount,
} from 'vue'

import { default as TypicalTextComponent } from './TypicalText.vue'

import { type ITypicalTextNode, TypicalText, TypicalTextNodeSchema } from '~typical/text/TypicalText'
import { TypicalTextController } from '~typical/core/TypicalTextController'

import type { TypicalTextStyle } from '~typical/text/TypicalTextStyleProvider'

interface TypicalTextElementProps {
    id?: string
    tag?: string
    placeholder?: string
    modelValue?: string | ITypicalTextNode[]
    schemas?: TypicalTextNodeSchema[]
    style?: TypicalTextStyle
    editable?: boolean
    standalone?: boolean
    prev?: () => TypicalText 
    next?: () => TypicalText 
}

const props = withDefaults(defineProps<TypicalTextElementProps>(), {
    placeholder: 'Type something'
})

const emit = defineEmits([
    'update:modelValue',
    'enter',
    'enter:start',
    'backspace:start',
    'delete',
    'delete:end'
])

const text = new TypicalText({
    id: props.id,
    tag: props.tag,
    data: props.modelValue,
    schemas: props.schemas,
    style: props.style,
    standalone: props.standalone,
    prev: props.prev,
    next: props.next
})

const typical_text_ref = ref()

if (props.standalone) {
    let text_controller: TypicalTextController

    const internal_update = ref(false)

    watch(text.data, () => {
        internal_update.value = true
        emit('update:modelValue', text.toJSON())
    }, {
        deep: true
    })

    watch(() => props.modelValue, (value) => {
        if (!internal_update.value) {
            text.replaceData(value)
        }

        internal_update.value = false
    })

    onMounted(() => {
        const text_controller = new TypicalTextController({
            wrapper: typical_text_ref.value.$el,
            getHeadNode: () => text.first_leaf
        })
        
        watch(() => props.editable, (value) => {
            if (value) {
                text_controller?.init()
            } else {
                text_controller?.destroy()
            }
        }, {
            immediate: true
        })
    })

    onBeforeUnmount(() => {
        text_controller?.destroy()
    })
}
const selection_font_color = computed(() => text.style.selection_font_color)
const selection_background_color = computed(() => text.style.selection_background_color)

</script>

<style lang="sass" scoped>
.typical-text-standalone
    pointer-events: auto
    position: relative
    word-break: break-word
    white-space: pre-wrap

    ::selection
        color: v-bind('selection_font_color')
        background-color: v-bind('selection_background_color')

    &[contenteditable=true]:focus
        outline: none !important

</style>