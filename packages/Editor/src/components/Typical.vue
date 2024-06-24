<template lang="pug">
UseTransition(v-if="editable" name="slide-fade")
    TypicalTextFloatingMenu(
        v-if="show_floating_menu"
        contenteditable="false"
        :schemas="schemas_in_current_range"
        :selection-position="selection_position"
        :applied-schemas="applied_schemas_in_current_range"
        @apply="applySchema"
        @remove="removeSchema"
    )

.typical(
    ref="typical_wrapper"
    :id="id"
    :contenteditable="editable"
    :style="style"
)
    Element(
        v-for="(element, index) in data"
        :key="element.id"
        :element="element"
        :index="index"
        :editable="editable"
        @enter="onEnter($event, index)"
        @enter:start="onEnterStart(index)"
        @backspace:start="onBackspaceStart(index)"
        @delete="onDelete(element)"
        @delete:end="onDeleteEnd(index)"
    )
</template>

<script lang="ts" setup>
import { 
    ref,
    computed,
    watch,
    onBeforeUnmount,
    nextTick,
    onMounted,
    type CSSProperties,
} from 'vue'

import debounce from 'lodash.debounce'

import { Typical } from '~typical/editor/Typical'
import type { ITypicalElement } from '~typical/editor/TypicalElement'
import { TypicalElement, TypicalElementSchema } from '~typical/editor/TypicalElement'
import { TypicalTextNodeSchema } from '~typical/text/TypicalText'
import Element from '~typical/editor/components/TypicalElement.vue'
import type {
    TypicalStyle,
} from '~typical/editor/TypicalEditorStyleProvider'
import { TypicalSelection, type Selection } from '~typical/core/TypicalSelection'
import { UseTransition } from '@typical/ui'
import { useTypicalTextSelection } from '~typical/core/composables/useTypicalTextSelection'

import TypicalTextFloatingMenu from '~typical/text/components/TypicalTextFloatingMenu.vue'

interface TypicalProps {
    modelValue?: ITypicalElement[]
    placeholder?: string
    editable?: boolean
    schemas?: TypicalElementSchema[]
    textSchemas?: TypicalTextNodeSchema[]
    style?: TypicalStyle
    autofocus?: boolean
}

const IS_BROWSER = typeof window !== 'undefined'

const props = withDefaults(defineProps<TypicalProps>(), {
    editable: false,
})

const emit = defineEmits([
    'update:modelValue',
    'enter',
    'ready'
])

const typical_wrapper = ref<HTMLElement>()

let typical: Typical

try {
    typical = new Typical({
        data: props.modelValue,
        schemas: {
            elements: props.schemas,
            text: props.textSchemas
        },
        style: props.style
    })
} catch (error) {
    console.error(`🗿 Can't initialize Typical. \n`, error)
}

onMounted(() => {
    nextTick(() => {
        typical.setRef(typical_wrapper.value)

        emit('ready')
    
        watch(() => props.editable, (value) => {
            if (value) {
                typical.init()
                if (props.autofocus) {
                    typical.focus()
                }
            } else {
                typical.destroy()
            }
        }, {
            immediate: true
        })
    })
})

onBeforeUnmount(() => {
    typical.destroy()
})

const id = ref<string>(typical.id)
const data = computed(() => typical.data)
const internal_update = ref(false)

watch(data, () => {
    internal_update.value = true

    if (props.editable) {
        emit('update:modelValue', typical.toJSON())
    }
}, {
    deep: true
})

watch(() => props.modelValue, (value) => {
    if (!internal_update.value) {
        typical.updateData(value)
    }

    internal_update.value = false
})


const { selection } = useTypicalTextSelection()
const show_floating_menu = ref(false)

watch(selection, (value) => {
    if (props.editable) {
        checkFloatingMenuVisibility(value)
    }
})

const applySchema = (type: string) => {
    const selection = TypicalSelection.getSelection()

    typical.applyTextSchema(
        type,
        selection.start_node_id,
        selection.start_index,
        selection.end_node_id,
        selection.end_index
    )
}

const removeSchema = (type: string) => {
    const selection = TypicalSelection.getSelection()

    typical.removeTextSchema(
        type,
        selection.start_node_id,
        selection.start_index,
        selection.end_node_id,
        selection.end_index
    )
}

const schemas_in_current_range = ref<TypicalTextNodeSchema[]>([])
const applied_schemas_in_current_range = ref<string[]>([])

function checkFloatingMenuVisibility(selection: Selection) {
    if (!selection) {
        show_floating_menu.value = false
        return
    }
    
    const {
        collapsed,
        start_editor_id,
        end_editor_id,
        start_element_id,
        end_element_id,
        start_node_id,
        start_index,
        end_node_id,
        end_index,
    } = selection

    if (
        !collapsed
        && start_editor_id === id.value 
        && start_editor_id === end_editor_id
    ) {
        applied_schemas_in_current_range.value = typical.getAppliedSchemasForRange({
            start_el_id: start_element_id,
            end_el_id: end_element_id,
            start_node_id,
            start_index,
            end_node_id,
            end_index
        })

        debouncedGetSchemasForRange(selection.start_element_id, selection.end_element_id, selection.collapsed)
    }
    else {
        show_floating_menu.value = false
    }
}

const debouncedGetSchemasForRange = debounce((start_element_id: string, end_element_id: string, collapsed: boolean) => {
    schemas_in_current_range.value = typical.getSchemasForRange(
        start_element_id,
        end_element_id
    )

    if (schemas_in_current_range.value.length > 0 && !collapsed) {
        showMenu()
    }
}, 300)

const showMenu = () => {
    updateSelectionPosition()
    show_floating_menu.value = true
}

const selection_position = ref({
    top: 0,
    left: 0,
    width: 0
})

function updateSelectionPosition() {
    const native_selection = window.getSelection()

    if (!native_selection) return

    const rect = native_selection.getRangeAt(0).getBoundingClientRect()

    selection_position.value.top = rect.top 
    selection_position.value.left = rect.left
    selection_position.value.width = rect.width
}

const onDelete = (element: TypicalElement) => {
    element.delete()
}

const onEnter = (event: any, index: number) => {
    const new_element = typical.createElement({
        data: event.detail.data
    })

    typical.data.splice(index + 1, 0, new_element)

    nextTick(() => {
        TypicalSelection.setSelection({
            start_node_id: new_element.text.first_leaf.id,
            start_index: 0
        })
    })
}

const onEnterStart = (index: number) => {
    const new_element = typical.createElement()

    const current_element = data.value[index]

    typical.data.splice(index, 0, new_element)

    nextTick(() => {
        TypicalSelection.setSelection({
            start_node_id: current_element.text.first_leaf.id,
            start_index: 0
        })
    })
}

const onDeleteEnd = (index: number) => {
    if (index + 1 === data.value.length) return

    const current_el = data.value[index]
    const next_el = current_el.next

    if (next_el) {
        if (!next_el.use_text) { 
            next_el.delete()
            
            nextTick(() => {
                current_el.focus()
            })
        }
        else {
            const current_length = current_el.text.length
    
            current_el.text.appendData(next_el.text.toJSON())
            next_el.delete()
            current_el.text.normalize()
    
            const [node, index_in_node] = current_el.text.getNodeByCumulativeIndex(
                current_length
            )
    
            nextTick(() => {
                TypicalSelection.setSelection({
                    start_node_id: node.id,
                    start_index: index_in_node
                })
            })
        }
    }
}

const onBackspaceStart = (index: number) => {
    if (index === 0) return

    const current_el = data.value[index]
    const prev_el = current_el.prev

    if (!prev_el.use_text) { 
        prev_el.delete()
        
        nextTick(() => {
            TypicalSelection.setSelection({
                start_node_id: current_el.text.first_leaf.id,
                start_index: 0
            })
        })
    }
    else if (current_el.is_empty) {
        prev_el.focus()
        current_el.delete()
    }
    else {
        const prev_length = prev_el.text.length

        prev_el.text.appendData(current_el.text.toJSON())
        current_el.delete()
        prev_el.text.normalize()

        const [node, index_in_node] = prev_el.text.getNodeByCumulativeIndex(prev_length)

        nextTick(() => {
            TypicalSelection.setSelection({
                start_node_id: node.id,
                start_index: index_in_node
            })
        })
    }
}

// Styles section
const selection_font_color = computed(() => typical.style.text.selection_font_color)
const selection_background_color = computed(() => typical.style.text.selection_background_color)

const style = computed<CSSProperties>(() => ({
    fontFamily: typical.style.text.font_family,
    fontSize: typical.style.text.font_size,
    color: typical.style.text.font_color,
    fontWeight: typical.style.text.font_weight,
    fontStyle: typical.style.text.font_style,
    letterSpacing: typical.style.text.letter_spacing,
    lineHeight: typical.style.text.line_height,
    gap: typical.style.editor.gap
}))

</script>

<style lang="sass" scoped>
.typical
    position: relative
    word-break: break-word
    white-space: pre-wrap
    display: grid

    ::selection
        color: v-bind('selection_font_color')
        background-color: v-bind('selection_background_color')

    &[contenteditable=true]:focus
        outline: none !important // really important
</style>
