<template lang="pug">
.typical-element(
    ref="element_wrapper_ref"
    :id="element.id"
    @mouseover="hover = true"
    @mouseleave="hover = false"
)
    TypicalElementMenu(
        v-if="editable"
        ref="menu_ref"
        :element-index="index"
        :is-element-static="element.static"
        :items="element.actions"
        :offset-top="menu_offset"
        :show-buttons="hover"
        @dragstart="onDragStart"
    )

    UseTransition(name="fade")
        .drop-highlight-top(v-if="is_drop_target_before" contenteditable="false")

    component(
        ref="element_ref"
        :is="element.component"
        :element="element"
        :editable="editable"
        @delete="onDelete"
        @enter="onEnter"
        @enter:start="onEnterStart"
        @backspace:start="onBackspaceStart"
        @delete:end="onDeleteEnd"
    )

    UseTransition(name="fade")
        .drop-highlight-bottom(v-if="is_drop_target_after" contenteditable="false")

</template>

<script lang="ts" setup>
import { UseTransition } from '@typical/ui'
import {
    ref,
    computed,
    onUpdated,
    onMounted,
    type ComponentPublicInstance,
} from 'vue'
import { TypicalElement } from '~typical/editor/TypicalElement'

import TypicalElementMenu from '~typical/editor/components/TypicalElementMenu.vue'

import type { TypicalElementProps as Props } from '~typical/editor/types/TypicalEditor.types'

const props = defineProps<Props>()

const hover = ref(false)
const element_wrapper_ref = ref()
const element_ref = ref<ComponentPublicInstance>()
const menu_ref = ref<ComponentPublicInstance>()

const menu_offset = ref(0)

onMounted(() => {
    menu_offset.value = calculateMenuOffset()
})

onUpdated(() => {
    menu_offset.value = calculateMenuOffset()
})

const is_drop_target_before = computed(() => props.element.is_drop_target_before)
const is_drop_target_after = computed(() => props.element.is_drop_target_after)

let element_clone: HTMLElement | null = null

const onDragStart = (event: MouseEvent) => {
    event.preventDefault()
    const editor_wrapper = element_wrapper_ref.value.closest('.typical')

    const clone_wrapper = document.createElement('div')
    clone_wrapper.setAttribute('style', editor_wrapper.style)
    clone_wrapper.style.width = `${editor_wrapper.getBoundingClientRect().width}px`
    clone_wrapper.style.opacity = '.5'
    clone_wrapper.style.position = 'absolute'
    clone_wrapper.style.pointerEvents = 'none'

    const clone = element_wrapper_ref.value.cloneNode(true)
    clone_wrapper.appendChild(clone)

    let shiftX = event.clientX - clone_wrapper.getBoundingClientRect().left;
    let shiftY = event.clientY - clone_wrapper.getBoundingClientRect().top;
    
    element_clone = clone_wrapper
    document.body.append(clone_wrapper)

    clone_wrapper.style.left = event.pageX - shiftX + 'px';
    clone_wrapper.style.top = event.pageY - shiftY + 'px';

    document.addEventListener('mousemove', mousemoveHandler)
    document.addEventListener('mouseup', mouseupHandler)
}

let current_el_under: TypicalElement

const mousemoveHandler = (event) => {
    element_clone.style.top = `${event.pageY}px`
    element_clone.style.left = `${event.pageX}px`

    const el_under = document.elementFromPoint(event.clientX, event.clientY).closest('.typical-element') as HTMLElement
    
    if (el_under) {
        if (!current_el_under || current_el_under.id !== el_under.id) {
            const element = props.element.editor.getElementById(el_under.id)

            if (current_el_under) {
                current_el_under.is_drop_target_after = false
                current_el_under.is_drop_target_before = false
            }

            current_el_under = element
        }

        const rect = el_under.getBoundingClientRect()

        const rect_middle_point = rect.top + rect.height / 2

        if (current_el_under.id === props.element.id) {
            return
        }

        if (event.clientY >= rect.top && event.clientY <= rect_middle_point) {
            current_el_under.is_drop_target_before = true
            current_el_under.is_drop_target_after = false
        }
        else if (event.clientY <= rect.bottom && event.clientY >= rect_middle_point) {
            current_el_under.is_drop_target_before = false
            current_el_under.is_drop_target_after = true
        }
        else {
            current_el_under.is_drop_target_before = false
            current_el_under.is_drop_target_after = false
        }
    }
    else if (current_el_under) {
        current_el_under.is_drop_target_after = false
        current_el_under.is_drop_target_before = false
    }
}

const mouseupHandler = () => {
    element_clone?.remove()
    document.removeEventListener('mousemove', mousemoveHandler)
    document.removeEventListener('mouseup', mouseupHandler)
    
    if (current_el_under) {
        if (current_el_under.id !== props.element.id) {
            const curr_index = props.index
            const target_index = current_el_under.index

            // true = from top to botton
            // false = from bottom to top
            const direction = curr_index < target_index ? true : false

            if (current_el_under.is_drop_target_before) {
                current_el_under.editor.changeElementOrder(curr_index, target_index + (direction ? -1 : 0))
            }
            else if (current_el_under.is_drop_target_after) {
                current_el_under.editor.changeElementOrder(curr_index, target_index + (direction ? 0 : 1))
            }
        }
        
        current_el_under.is_drop_target_after = false
        current_el_under.is_drop_target_before = false
    }
}

const emit = defineEmits([
    'enter',
    'enter:start',
    'backspace:start',
    'delete',
    'delete:end'
])

const onDelete = () => {
    emit('delete')
}

const onDeleteEnd = () => {
    emit('delete:end')
}

const onEnter = (event: CustomEvent) => {
    emit('enter', event)
}

const onEnterStart = () => {
    emit('enter:start')
}

const onBackspaceStart = () => {
    emit('backspace:start')
}

function calculateMenuOffset(): number {
    if (!props.editable || !element_ref.value) return 0

    const el = element_ref.value.$el as HTMLElement

    const is_text_el = el.classList?.contains('typical-text') || el.children?.[0]?.classList?.contains('typical-text')

    if (is_text_el) {
        const clone = el.cloneNode(true)
        clone.textContent = 'A'
        const parent_el = clone.firstChild.parentElement

        document.body.appendChild(parent_el)

        const clone_bounding_rect = parent_el.getBoundingClientRect()
        const { marginBlockStart, paddingBlockStart } = window.getComputedStyle(el)

        parent_el.remove()

        const height = clone_bounding_rect.height
        const margin = parseInt(marginBlockStart)
        const padding = parseInt(paddingBlockStart)

        const menu_button = menu_ref.value.$el.querySelector('.menu-button')
        const { height: menu_height } = menu_button.getBoundingClientRect()

        const menu_offset = Math.round(margin + padding + (height / 2) - (menu_height / 2))

        return menu_offset
    } else {
        return 3 // magic numba?
    }
}
</script>

<style lang="sass" scoped>
.typical-element 
    position: relative

.drop-highlight-top,
.drop-highlight-bottom
    width: 100%
    height: 2px
    background-color: cyan

.drop-highlight-top
    margin-bottom: -2px

.drop-highlight-bottom
    margin-top: -2px

</style>