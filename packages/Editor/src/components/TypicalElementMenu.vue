<template lang="pug">
Dropdown(
    auto-width
    :dropdown-min-width="250"
)
    template(#default="{ is_open }")
        .menu-button(
            contenteditable="false"
            :style="menu_button_styles(is_open)"
            draggable="true"
        )
            .menu-button-dot(v-for="n in 3")

    template(#content="{ close }")
        .menu-actions
            template(v-for="(item, index) in computed_items") 
                .title(v-if="item.type === 'title'") {{ item.name }}
                .divider(v-if="item.type === 'divider' && index !== computed_items.length - 1")
                .action(v-if="item.type === 'action' && (item.isShown?.(elementIndex, isElementStatic) ?? true)" @click="performAction(item.action, close)") {{ item.name }}
</template>

<script lang="ts" setup>
import { computed, unref } from 'vue'
import { Dropdown } from '@typical/ui'
import type { TypicalElementMenuItem } from '~typical/editor/TypicalElement'

interface TypicalElementMenuProps {
    elementIndex: number
    isElementStatic?: boolean
    items: Array<TypicalElementMenuItem>
    showButtons: boolean
    offsetTop: number
}

const props = defineProps<TypicalElementMenuProps>()

const menu_button_styles = computed(() => (is_open: boolean) => ({
    opacity: is_open || props.showButtons ? 1 : 0,
    top: `${props.offsetTop}px`
}))

const computed_items = computed(() => props.items.filter(item => {
    if (item.type === 'action') {
        if (typeof item.isShown === 'function') {
            return item.isShown(props.elementIndex, props.isElementStatic)
        }
        else {
            return true
        }
    }
    else {
        return true
    }
}))

function performAction(action: Function, close_dropdown: Function): void {
    close_dropdown()
    action(props.elementIndex)
}

function onDragStart(event) {
}

</script>

<style lang="sass" scoped>
.menu-button
    cursor: pointer
    position: absolute
    top: -3px
    left: -15px
    user-select: none
    display: grid
    grid-template-rows: repeat(3, 3px)
    gap: 3px
    padding: 4px
    border-radius: 2px
    transition: background-color .15s, opacity .15s ease

    &:hover
        background-color: #f2f2f2

        // &:hover &-dot
        //     background-color: #c2c2c2

    &-dot
        user-select: none
        width: 3px
        height: 3px
        border-radius: 69%
        background-color: #d1d1d1
        transform: background-color .15s

.menu-actions
    background-color: #fff
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2)
    border-radius: 4px
    padding: 4px

.title, .action
    padding: 8px 10px

.title
    font-size: .89em
    opacity: .4
    color: black

.divider
    height: 1px
    width: 100%
    padding: 0 20px
    margin: 4px 0
    background-color: #f7f7f7

.action
    cursor: pointer
    user-select: none
    border-radius: 2px
    min-width: 80px
    color: black

    &:hover
        background-color: #f7f7f7

</style>