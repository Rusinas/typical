<template lang="pug">
.app
  .content.m-b-20
    pre {{ content }}

  .buttons
    button(
        @click="useData(EmptyContent)"
        size="xs"
    ) Empty data

    button(
        @click="useData(TextContent)"
        size="xs"
    ) Use text data

    button(
        @click="useData(BlogContent)"
        size="xs"
    ) Use blog data

  .wrapper
    TypicalEditor(
      v-model="content"
      :editable="editable"
      :schemas="schemas"
      :text-schemas="text_schemas"
    )
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { TypicalEditor, type ITypicalElement } from '@typical/editor'
import { HeadingOneSchema, HeadingTwoSchema, ImageSchema } from '@typical/elements'
import { BoldTextSchema, ItalicTextSchema } from '@typical/nodes'

import {
    EmptyContent,
    BlogContent,
    TextContent,
} from './data/TypicalEditorMockContent'

type ImageProps = {
    url: string
}

type ITypicalImageElement = ITypicalElement<ImageProps>

const schemas = [
  HeadingOneSchema,
  HeadingTwoSchema,
  ImageSchema
]

const text_schemas = [
    BoldTextSchema,
    ItalicTextSchema
]

const content = ref<Array<ITypicalElement | ITypicalImageElement>>()
const editable = ref(true)
const show_output = ref(false)

const useData = (data) => {
    content.value = data
}

</script>

<style lang="sass" scoped>
.app
  width: 100%
  display: grid
  align-items: start
  justify-content: center
  box-sizing: border-box
  padding: 50px

.content
    background-color: #263238
    overflow: auto
    color: white
    font-weight: bold
    max-width: 100%
    border-radius: 6px
    padding: 10px
    box-shadow: 0 5px 15px rgba(0, 0, 0, .1)
    margin-bottom: 40px
    max-height: 400px
    max-width: 700px

.buttons
  display: flex
  gap: 10px
  margin-bottom: 20px

.wrapper
  width: 700px
  max-width: 700px
  display: grid
</style>

