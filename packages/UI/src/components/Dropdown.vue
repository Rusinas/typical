<template lang="pug">
.dropdown-wrapper(
    contenteditable="false"
)
    .trigger(
        ref="trigger_ref"
        :style="[triggerFitContent ? 'width: fit-content' : '']"
    )
        slot(v-bind="{ is_open: show_dropdown, close }" ref="trigger_slot_ref")

    Teleport(to="body")
        .dropdown(
            ref="dropdown_ref"
            v-if="show_dropdown_wrapper"
            @click.stop
            :style="dropdown_styles"
        )
            UseTransition(
                name="slide-fade"
                @after-enter="onAfterEnter"
                @before-leave="onBeforeLeave"
                @after-leave="onAfterLeave"
            )
                .dropdown-content(v-if="show_dropdown")
                    slot(name="content" v-bind="{ close }")
</template>

<script lang="ts" setup>
import { ref, computed, onBeforeUnmount, nextTick, onMounted, watch } from 'vue'
import { UseTransition } from '@typical/ui'

import { useClickOutside } from '../composables/useClickOutside'

export type DropdownProps = {
    modelValue?: boolean | undefined
    dropdownOffset?: number
    dropdownMinWidth?: number
    dropdownMaxWidth?: number
    dropdownMaxHeight?: number
    autoWidth?: boolean
    disabled?: boolean
    triggerFitContent?: boolean
    position?: 'top' | 'bottom' | 'top-start' | 'bottom-start'
}

const props = withDefaults(defineProps<DropdownProps>(), {
    modelValue: undefined,
    dropdownOffset: 10,
    dropdownMinWidth: 0,
    position: 'bottom-start',
    triggerFitContent: true
})

const emit = defineEmits([
    'update:modelValue',
    'open',
    'close'
])

watch(() => props.modelValue, (value) => {
    show_dropdown.value = value
})

const is_animation_ended = ref(false)

const onAfterEnter = () => {
    calculatePositions()
    is_animation_ended.value = true
}

const onBeforeLeave = () => {
    is_animation_ended.value = false
}

const onAfterLeave = () => {
    show_dropdown_wrapper.value = false
}

const trigger_ref = ref<HTMLElement>()
const trigger_slot_ref = ref<HTMLElement>()
const dropdown_ref = ref<HTMLElement>()

useClickOutside({
    target: [trigger_ref, dropdown_ref],
    handler: () => {
        close()
    }
})

const show_dropdown_local = ref(!!props.modelValue)

const show_dropdown = computed<boolean>({
    get() {
        return props.modelValue ?? show_dropdown_local.value
    },
    set(value) {
        show_dropdown_local.value = value
        emit('update:modelValue', value)

        if (value) {
            emit('open')
        } else {
            emit('close')
        }
    }
})

if (show_dropdown.value) {
    nextTick(() => {
        calculatePositions()
    })
}

// This needed in order to show transitions correctly
const show_dropdown_wrapper = ref(show_dropdown.value)

const trigger_position = ref({
    width: 0,
    height: 0,
    top: 0,
    bottom: 0,
    left: 0
})

const dropdown_size = ref({
    width: 0,
    height: 0
})

const calculated_dropdown_position = ref({
    width: 0,
    maxWidth: props.dropdownMaxWidth,
    height: 0,
    top: 0,
    left: 0
})

const dropdown_styles = computed(() => {
    const styles = {
        minWidth: `${props.dropdownMinWidth}px`,
        top: `${calculated_dropdown_position.value.top}px`,
        left: `${calculated_dropdown_position.value.left}px`,
        pointerEvents: is_animation_ended.value ? 'auto' : 'none'
    }

    if ((props.dropdownMaxHeight ?? 0) > 0) {
        styles['maxHeight'] = `${props.dropdownMaxHeight}px`
    }

    if ((calculated_dropdown_position.value.maxWidth ?? 0) > 0) {
        styles['width'] = `${calculated_dropdown_position.value.maxWidth}px`
    } else if (props.autoWidth) {
        styles['width'] = 'auto'
    } else if (trigger_position.value.width > 0) {
        styles['width'] = `${trigger_position.value.width}px`
    }

    return styles
})


let resize_observer: ResizeObserver

const close = () => {
    if (props.disabled) {
        return
    }

    destroyListeners()

    if (dropdown_ref.value && resize_observer) {
        resize_observer.unobserve(dropdown_ref.value)
    }

    show_dropdown.value = false
}

const open = () => {
    if (props.disabled) {
        return
    }

    initListeners()
    show_dropdown_wrapper.value = true

    nextTick(() => {
        show_dropdown.value = true
        resize_observer?.observe(dropdown_ref.value)
        calculatePositions()
    })
}

const toggle = () => {
    if (props.disabled) {
        return
    }

    if (show_dropdown.value) close()
    else {
        open()
    }
}

defineExpose({
    toggle
})

const getTriggerPosition = () => {
    if (!trigger_ref.value) return

    trigger_ref.value.normalize()

    const trigger = trigger_ref.value.children[0] as HTMLElement // check node type later

    if (!trigger) return

    const { width, bottom, left, top, height } = trigger.getBoundingClientRect()

    trigger_position.value.width = width
    trigger_position.value.height = height
    trigger_position.value.top = top
    trigger_position.value.bottom = bottom
    trigger_position.value.left = left
}

const getDropdownSize = () => {
    if (!dropdown_ref.value) return

    const { width, height } = dropdown_ref.value.getBoundingClientRect()

    dropdown_size.value.height = height
    dropdown_size.value.width = width
}

const calculatePositions = () => {
    getDropdownSize()
    getTriggerPosition()
    calculateDropdownPosition()
}

const calculateDropdownPosition = () => {
    nextTick(() => {
        const width = getDropdownWidth()
        const left = getDropdownLeftPosition(width)

        calculated_dropdown_position.value.width = width
        calculated_dropdown_position.value.left = left

        const height = getDropdownHeight()
        const top = getDropdownTopPosition(height)

        calculated_dropdown_position.value.top = top
        calculated_dropdown_position.value.height = height
    })
}

const getDropdownWidth = () => {
    return dropdown_size.value.width
}

const getDropdownLeftPosition = width => {
    let left

    const window_width = window.innerWidth

    const is_dropdown_fit_to_window_width = trigger_position.value.left + width < window_width

    if (!is_dropdown_fit_to_window_width) {
        left = window_width - width - 20
    }
    else {
        if (props.position.includes('start')) {
            left = trigger_position.value.left
        }
        else {
            left = trigger_position.value.left + (trigger_position.value.width / 2) - (dropdown_size.value.width / 2)
        }
    }

    return left
}

const getDropdownHeight = () => {
    let height

    if (props.dropdownMaxHeight && dropdown_size.value.height > props.dropdownMaxHeight) {
        height = props.dropdownMaxHeight
    } else {
        height = dropdown_size.value.height
    }


    return height
}

const getDropdownTopPosition = height => {
    let top

    const window_height = window.innerHeight

    const is_dropdown_fit_to_window_height = (
        height + trigger_position.value.bottom + props.dropdownOffset
    ) < window_height




    if (!is_dropdown_fit_to_window_height || props.position.includes('top')) {
        top = trigger_position.value.top - height - props.dropdownOffset
    }
    else {
        top = trigger_position.value.bottom + props.dropdownOffset
    }

    return top
}

const getParentNodes = (el: HTMLElement | Node) => {
    const nodes: (HTMLElement | Node)[] = []

    if (el?.parentNode) {
        nodes.push(el, ...getParentNodes(el.parentNode))
    } else {
        nodes.push(el)
    }

    return nodes
}

let trigger_parent_nodes: (HTMLElement | Node)[] = []

const initListeners = () => {
    for (let parent of trigger_parent_nodes) {
        parent?.addEventListener?.('scroll', calculatePositions)
    }

    window.addEventListener('resize', calculatePositions)
}

const destroyListeners = () => {
    for (let parent of trigger_parent_nodes) {
        parent?.removeEventListener?.('scroll', calculatePositions)
    }

    window.removeEventListener('resize', calculatePositions)
}

onMounted(() => {
    resize_observer = new ResizeObserver(() => {
        calculatePositions()
    })

    if (trigger_ref.value) {
        trigger_parent_nodes = getParentNodes(trigger_ref.value)
        trigger_ref.value.addEventListener('click', toggle)
    }
})

onBeforeUnmount(() => {
    destroyListeners()
    trigger_ref.value.removeEventListener('click', toggle)
    resize_observer?.disconnect()
})

const getDropdownContentWidth = computed(() => {
    if (props.autoWidth) return 'auto'
    else return '100%'
})
</script>

<style lang="sass" scoped>
.dropdown
    display: flex
    isolation: isolate
    z-index: 2
    position: fixed

.dropdown-content
    display: flex
    flex-direction: column
    width: v-bind('getDropdownContentWidth')
    z-index: 2

.dropdown-wrapper
    width: fit-content
</style>