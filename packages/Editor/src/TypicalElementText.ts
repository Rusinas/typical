import { TypicalText, TypicalTextNode } from '~typical/text/TypicalText'
import { TypicalElement } from '~typical/editor/TypicalElement'
import { Ref } from 'vue'

type TypicalElementTextParams = ConstructorParameters<typeof TypicalText>[0] & {
    parent_element: TypicalElement
}

export class TypicalElementText extends TypicalText {
    parent_element: TypicalElement
    declare _data: Ref<TypicalTextNode<this>[]> | TypicalTextNode<this>[]

    constructor(params: TypicalElementTextParams) {
        super(params)

        this.parent_element = params.parent_element
    }
}
