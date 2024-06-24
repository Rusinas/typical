<template lang="pug">
TypicalText(
    v-if="element.text"
    :editable="editable"
    :text="element.text"
)
</template>

<script lang="ts" setup>
import { type TypicalElementProps as Props } from '@typical/editor'
import { TypicalText } from '@typical/text'

defineProps<Props>()

</script>

<style lang="sass" scoped>

</style>