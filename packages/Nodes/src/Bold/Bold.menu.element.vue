<template lang="pug">
MenuItemButton(v-bind="{ ...props }")
    template(#default="{ activeColor, is_active, toggle }")
        IconButton(@click="toggle(type)")
            BoldIcon(:style="{ fill: is_active(type) ? activeColor : '' }")
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import MenuItemButton, { type TypicalMenuItemProps } from '../Common/MenuItemButton.vue'
import IconButton from '../Common/IconButton.vue'
import BoldIcon from './Bold.icon.vue'

import { BoldTextSchema } from './Bold.text.schema'

const { type } = BoldTextSchema

const props = defineProps<TypicalMenuItemProps>()

</script>

<style lang="sass" scoped>

</style>