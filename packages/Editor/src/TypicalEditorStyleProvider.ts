import { TypicalStyleProvider } from '@typical/core'
import { TypicalTextStyle } from '@typical/text'

export type TypicalStyle = {
    editor?: Partial<TypicalEditorStyle>
    element?: Partial<TypicalElementStyle>
    text?: Partial<TypicalTextStyle>
}

export type TypicalEditorStyle = {
    gap: string | number
}

type TypicalEditorStyleFinal = {
    gap: string
}

const TypicalEditorStyleDefaults: TypicalEditorStyle = {
    gap: '10px'
}

export type TypicalElementStyle = {
    margin_top: string | number
    margin_bottom: string | number
}

export type TypicalElementStyleFinal = {
    margin_top: string
    margin_bottom: string
}

const TypicalElementStyleDefaults: TypicalElementStyle = {
    margin_top: 0,
    margin_bottom: 0,
}

export class TypicalEditorStyleProvider extends TypicalStyleProvider<TypicalEditorStyle, TypicalEditorStyleFinal> {
    protected getStyles(params: Partial<TypicalEditorStyle> = {}): TypicalEditorStyleFinal {
        const result: TypicalEditorStyleFinal = {
            gap: this.getGap(params.gap)
        }

        return result
    }

    private getGap(gap = TypicalEditorStyleDefaults.gap): string {
        let result

        if (typeof gap === 'string') {
            result = gap
        } else {
            result = `${gap}px`
        }

        return result
    }
}

export class TypicalElementStyleProvider extends TypicalStyleProvider<TypicalElementStyle, TypicalElementStyleFinal> {
    protected getStyles(params: Partial<TypicalElementStyle> = {}): TypicalElementStyleFinal {
        const result: TypicalElementStyleFinal = {
            margin_top: this.getMargin(params.margin_top ?? TypicalElementStyleDefaults.margin_top),
            margin_bottom: this.getMargin(params.margin_bottom ?? TypicalElementStyleDefaults.margin_bottom),
        }

        return result
    }

    private getMargin(margin: string | number): string {
        let result

        if (typeof margin === 'string') {
            result = margin
        } else {
            result = `${margin}px`
        }

        return result
    }
}