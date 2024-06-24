<template lang="pug">
component.typical-text(
    ref="wrapper_ref"
    :id="id"
    :is="tag"
    :contenteditable="editable"
    :style="styles"
    spellcheck="false"
    @enter="onEnter"
    @enter:start="onEnterStart"
    @backspace:start="onBackspaceStart"
    @delete:end="onDeleteEnd"
    @delete="onDelete"
)
    UseTransition(
        name="slide-fade-right"
    )
        .typical-text-placeholder(v-if="show_placeholder" contenteditable="false") {{ placeholder }}

    TextNode(
        v-for="node in data"
        :node="node"
    )

</template>

<script lang="ts" setup>
import { 
    ref, 
    computed,
    watch,
    onUpdated,
    type CSSProperties,
} from 'vue'

import { TypicalText } from '~typical/text/TypicalText'
import { type Selection } from '~typical/core/TypicalSelection'

import { UseTransition } from '@typical/ui'
import TextNode from '~typical/text/components/TypicalTextNode.vue'

import { useTypicalTextSelection } from '~typical/core/composables/useTypicalTextSelection'

interface TypicalTextElementProps {
    text: TypicalText
    editable?: boolean
}

const props = defineProps<TypicalTextElementProps>()

const emit = defineEmits([
    'update:data',
    'enter',
    'enter:start',
    'backspace:start',
    'delete',
    'delete:end'
])

const wrapper_ref = ref()

const { selection } = useTypicalTextSelection()

watch(selection, (value) => {
    if (props.editable) {
        checkFocusState(value)
    }
})

onUpdated(() => {
    if (props.editable) {
        checkFocusState(selection.value)
    }
})

const focused = ref(false)
const show_placeholder = computed(() => props.editable && props.text.is_empty && focused.value)

const id = computed(() => props.text.id)
const data = computed(() => props.text.data)
const tag = computed(() => props.text.tag)
const placeholder = computed(() => props.text.placeholder)

const styles = computed<CSSProperties>(() => ({
    fontFamily: props.text.style.font_family,
    fontSize: props.text.style.font_size,
    fontStyle: props.text.style.font_style,
    fontWeight: props.text.style.font_weight,
    color: props.text.style.font_color,
    lineHeight: props.text.style.line_height,
    letterSpacing: props.text.style.letter_spacing,
}))

const placeholder_color = computed<string>(() => props.text.style.placeholder_color)



const onEnter = (event: CustomEvent) => {
    emit('enter', event)
}

const onEnterStart = () => {
    emit('enter:start')
}

const onBackspaceStart = () => {
    emit('backspace:start')
}

const onDeleteEnd = () => {
    emit('delete:end')
}

const onDelete = () => {
    emit('delete')
}

function checkFocusState(selection: Selection) {
    if (selection) {
        const { start_text_id, collapsed } = selection

        if (collapsed && start_text_id === id.value) {
            focused.value = true
        } else {
            focused.value = false
        }
    }
}

const selection_font_color = computed(() => props.text.style?.selection_font_color)
const selection_background_color = computed(() => props.text.style?.selection_background_color)

</script>

<style lang="sass" scoped>
.typical-text-placeholder
    position: absolute
    pointer-events: none
    user-select: none
    left: 0
    color: v-bind("placeholder_color")
</style>