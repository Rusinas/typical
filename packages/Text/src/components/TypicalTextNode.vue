<template lang="pug">
component.node(
    v-if="Array.isArray(node.data)"
    :id="node.id"
    :is="component"
)
    TypicalTextNode(
        v-for="subnode in node.data"
        :node="subnode"
    )

component.node(
    v-else
    :id="node.id"
    :is="component"
) {{ node.data }}

</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'TypicalTextNode'
})
</script>

<script lang="ts" setup>
import { computed, ref, watch, reactive } from 'vue'
import TypicalTextNode from '~typical/text/components/TypicalTextNode.vue'

import { TypicalTextNode as TextNode } from '~typical/text/TypicalText'

interface TypicalTextNodeProps {
    node: TextNode
}

const props = defineProps<TypicalTextNodeProps>()

const is_leaf = computed<boolean>(() => props.node.is_leaf)
const component = computed(() => props.node.component)

</script>

<style lang="sass" scoped>
.node:last-of-type:empty
    display: inline-block
    width: 100%

    &:before
        content: "\feff"
</style>