<template lang="pug">
.typical-menu-item-button
    slot(v-bind="{ appliedSchemas, activeColor, is_active, apply, remove, toggle }")
</template>

<script lang="ts" setup>
import { computed }  from 'vue'

export type TypicalMenuItemProps = {
    activeColor?: string
    appliedSchemas: string[]
}

const props = withDefaults(defineProps<TypicalMenuItemProps>(), {
    activeColor: '#26C6DA'
})

const is_active = computed(() => (type: string) => props.appliedSchemas.includes(type))

const emit = defineEmits([
    'apply',
    'remove'
])

const apply = (type: string) => {
    emit('apply', type)
}

const remove = (type: string) => {
    emit('remove', type)
}

const toggle = (type: string) => {
    if (props.appliedSchemas.includes(type)) {
        remove(type)
    } else {
        apply(type)
    }
}

</script>

<style lang="sass" scoped>
.typical-menu-item-button
    font-size: 1em
</style>