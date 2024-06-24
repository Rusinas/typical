<template lang="pug">
.floating-menu(ref="menu_ref" contenteditable="false" :style="getMenuPosition")
    .floating-menu-item(v-for="schema in schemas")
        component(
            :is="schema.menu_item_component"
            :applied-schemas="appliedSchemas"
            @apply="applySchema"
            @remove="removeSchema"
        )
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { TypicalTextNodeSchema } from '../TypicalText'

type SelectionPosition = {
    top: number
    left: number
    width: number
}

type FloatingMenuProps = {
    selectionPosition: SelectionPosition
    schemas: TypicalTextNodeSchema[]
    appliedSchemas: string[]
}

const props = withDefaults(defineProps<FloatingMenuProps>(), {
    appliedSchemas: () => []
})

const emit = defineEmits([
    'apply',
    'remove'
])

const toggleSchema = ({ type }: TypicalTextNodeSchema) => {
    if (props.appliedSchemas.includes(type)) {
        removeSchema(type)
    } else {
        applySchema(type)
    }
}

const applySchema = (type: string) => {
    emit('apply', type)
}

const removeSchema = (type: string) => {
    emit('remove', type)
}

const menu_ref = ref<HTMLElement>()

const getMenuPosition = computed(() => {
    if (!menu_ref.value) return

    const menu_rect = menu_ref.value.getBoundingClientRect()

    return {
        top: `${props.selectionPosition.top - menu_rect.height - 10}px`,
        left: `${props.selectionPosition.left + (props.selectionPosition.width / 2) - (menu_rect.width / 2)}px`
    }
})
</script>

<style lang="sass" scoped>
.floating-menu
    display: flex
    user-select: none
    position: fixed
    background-color: white
    border-radius: 4px
    box-shadow: 0 5px 15px rgba(0, 0, 0, .2)
    background-color: white
    z-index: 1000
    overflow: hidden
    transition: top .15s ease, left .15s ease

    &-item
        cursor: pointer
        width: 34px
        height: 34px
        display: flex
        align-items: center
        justify-content: center
        transition: background-color .15s linear
        &:hover
            background-color: #f7f7f7
</style>