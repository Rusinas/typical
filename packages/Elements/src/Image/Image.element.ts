import { defineAsyncComponent } from 'vue'
import { TypicalElementSchema } from '~typical/editor/TypicalElement'

type UploadFunction = (file: Blob) => Promise<string | null> 

export class TypicalImageElementSchema extends TypicalElementSchema {
    uploadHandler: UploadFunction

    constructor(params: ConstructorParameters<typeof TypicalElementSchema>[0]) {
        super(params)
    }

    public setUploadHandler(handler: UploadFunction) {
        this.uploadHandler = handler
    }
}

export const ImageSchema = new TypicalImageElementSchema({
    component: defineAsyncComponent(
        () => import('~typical/elements/Image/Image.vue')
    ),
    name: 'Image',
    type: 'image',
    style: {
        text: {
            font_style: 'italic',
        }
    }
})
