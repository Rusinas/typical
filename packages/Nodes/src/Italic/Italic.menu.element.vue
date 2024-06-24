<template lang="pug">
MenuItemButton(v-bind="{ ...props }")
    template(#default="{ is_active, activeColor, toggle }")
        IconButton(@click="toggle(type)")
            ItalicIcon(:style="{ fill: is_active(type) ? activeColor : '' }")
</template>

<script lang="ts" setup>
import MenuItemButton, { type TypicalMenuItemProps } from '../Common/MenuItemButton.vue'
import IconButton from '../Common/IconButton.vue'
import ItalicIcon from './Italic.icon.vue'

import { ItalicTextSchema } from './Italic.text.schema'

const { type } = ItalicTextSchema

const props = defineProps<TypicalMenuItemProps>()

</script>
