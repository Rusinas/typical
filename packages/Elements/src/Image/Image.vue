<template lang="pug">
.image-wrapper(contenteditable="false")
    .image-preview-overlay(
        :class="{ 'image-preview-overlay-active': uploading }"
    )
    .image-menu(v-if="editable")
        Dropdown(auto-width position="top" hover)
            .image-menu-item(@click="toggleCaption") T
            template(#content)
                .tooltip Toggle caption 

        Dropdown(v-if="element.additional_data?.url" auto-width position="top" hover)
            .image-menu-item(@click="deleteImage") X
            template(#content)
                .tooltip Replace image

    img.image(
        v-if="element.additional_data?.url"
        :src="element.additional_data.url"
        draggable="false"
    )
    .image-upload(v-else-if="editable")
        img.image-preview(
            v-if="preview"
            :src="preview"
        )

        .file-input(v-else @click="openFileDialog")
            span Click to select a new image

            input(
                v-show="false"
                type="file"
                ref="file_input_ref"
                :accept="allowed_extensions.join(', ')"
                @input="onFileInput"
            )

TypicalText.m-t-10(
    v-if="use_text"
    :editable="editable"
    :text="element.text"
    v-bind="attrs"
)
</template>

<script lang="ts" setup>
import { computed, nextTick, ref } from 'vue'
import { type TypicalElementProps as Props } from '@typical/editor'
import { TypicalText } from '@typical/text'
import { Dropdown } from '@typical/ui'
import { useAttrs } from 'vue'
// import { Icon } from '@rusinas/icons'

import { TypicalImageElementSchema } from './Image.element'

const props = defineProps<Props>()

const attrs = useAttrs()

const use_text = computed<boolean>(() => props.element.use_text)

const allowed_extensions = [
    'image/png',
    'image/gif',
    'image/jpeg'
]

if (props.element) {
    props.element.use_text = props.element?.additional_data?.use_caption ?? true
}

const toggleCaption = () => {
    props.element.use_text = !props.element.use_text
    props.element.additional_data.use_caption = !props.element.additional_data.use_caption

    if (use_text.value) {
        nextTick(() => {
            props.element.focus()
        })
    }
}

const setImageUrl = (url: string) => {
    if (!props.element.additional_data) {
        props.element.additional_data = {}
    }

    props.element.additional_data.url = url
}

const deleteImage = () => {
    if (!props.element.additional_data) {
        props.element.additional_data = {}
    }

    props.element.additional_data.url = null
}

const file_input_ref = ref()

const openFileDialog = () => {
    file_input_ref.value.click()
}

const uploading = ref(false)
const preview = ref<string>()

const toggleUploading = () => {
    uploading.value = !uploading.value
}

const uploadHander = (props.element.schema as TypicalImageElementSchema).uploadHandler

const onFileInput = async (event) => {
    try {
        uploading.value = true
        const file = event.target.files[0]

        preview.value = URL.createObjectURL(file)

        const result = await uploadHander(file)

        const image = new Image()

        image.src = result

        await new Promise(resolve => {
            image.onload = () => {
                resolve(true)
            }
        })

        preview.value = null

        if (typeof result === 'string') {
            setImageUrl(result)
        } else {
            throw new Error('The return type of the uploadHandler must be a string')
        }
    } catch (error) {
        console.error('Error uploading imoge', error)
    } finally {
        uploading.value = false
    }
}

</script>

<style lang="sass" scoped>
.image
    user-select: none
    cursor: default
    display: block
    max-width: 100%
    box-shadow: 0 5px 25px rgba(0, 0, 0, .1)

.image-wrapper
    position: relative
    overflow: hidden
    border-radius: 6px
    &:hover .image-menu
        opacity: 1

.image-menu
    position: absolute
    top: 6px
    right: 6px
    display: flex
    gap: 6px
    opacity: 0
    transition: opacity .15s ease

    &-item
        cursor: pointer
        user-select: none
        display: flex
        align-items: center
        color: white
        justify-content: center
        background-color: rgba(0, 0, 0, .4)
        width: 24px
        height: 24px
        border-radius: 4px
        transition: background-color .15s ease

        &:hover
            background-color: rgba(0, 0, 0, .6)
.image-upload
    position: relative
    cursor: pointer
    width: 100%
    min-height: 350px
    background-color: #F5F5F5
    display: flex
    align-items: center
    justify-content: center
    transition: background-color .15s ease-in-out
    overflow: hidden

    &:hover 
        background-color: #EEEEEE 

.image-preview
    max-width: 100%

.image-preview-overlay
    pointer-events: none
    position: absolute
    inset: 0
    backdrop-filter: blur(10px)
    opacity: 0
    transition: opacity .5s ease
    z-index: 10

.image-preview-overlay-active
    opacity: 1

.file-input
    position: absolute
    inset: 0
    display: flex
    align-items: center
    justify-content: center
    color: #BDBDBD

.tooltip
    padding: 10px 
    background-color: rgba(0, 0, 0, .6)
    color: white
    border-radius: 6px
    font-size: .9rem

</style>