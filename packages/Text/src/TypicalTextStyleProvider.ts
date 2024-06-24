import { type CSSProperties } from 'vue'
import { TypicalStyleProvider } from '@typical/core'

type FontWeight = CSSProperties['font-weight']

export type TypicalTextStyle = {
    font_family: string | string[]
    font_size: string | number
    font_weight: FontWeight
    line_height: string | number
    font_style: string
    letter_spacing: string | number
    font_color: string
    selection_font_color: string
    selection_background_color: string
    placeholder_color: string
}

export type TypicalTextStyleFinal = {
    font_family: string
    font_size: string
    font_weight: FontWeight
    line_height: string
    font_style: string
    letter_spacing: string
    font_color: string
    selection_font_color: string
    selection_background_color: string
    placeholder_color: string
}

const TypicalTextStyleDefaults: TypicalTextStyle = {
    font_family: 'inherit',
    font_size: '1rem',
    font_color: '#37352f', // #37352f previous
    font_weight: 'initial',
    font_style: 'normal',
    placeholder_color: '#d1d1d1',
    line_height: '1.5em',
    letter_spacing: 'normal',
    selection_font_color: '#212121',
    selection_background_color: '#B3E5FC', // '#E0F7FA' previous
}

export class TypicalTextStyleProvider extends TypicalStyleProvider<TypicalTextStyle, TypicalTextStyleFinal> {
    protected getStyles(styles: Partial<TypicalTextStyle> = {}): TypicalTextStyleFinal {
        let result: TypicalTextStyleFinal = {
            font_family: this.getFontFamily(styles.font_family),
            font_size: this.getFontSize(styles.font_size),
            font_color: styles.font_color || TypicalTextStyleDefaults.font_color,
            font_style: styles.font_style || TypicalTextStyleDefaults.font_style,
            placeholder_color: styles.placeholder_color || TypicalTextStyleDefaults.placeholder_color,
            line_height: this.getLineHeight(styles.line_height),
            letter_spacing: this.getLetterSpacing(styles.letter_spacing),
            font_weight: styles.font_weight || TypicalTextStyleDefaults.font_weight,
            selection_font_color: styles?.selection_font_color || TypicalTextStyleDefaults.selection_font_color,
            selection_background_color: styles?.selection_background_color || TypicalTextStyleDefaults.selection_background_color,
        }

        return result
    }

    private getFontFamily(font_family = TypicalTextStyleDefaults.font_family): string {
        let result: string

        if (typeof font_family === 'string') {
            result = font_family
        } else {
            result = font_family.join(', ')

            if (!font_family.includes('sans-serif')) {
                result += ', sans-serif'
            } 
        }

        return result
    }

    private getFontSize(font_size = TypicalTextStyleDefaults.font_size): string {
        let result: string

        if (typeof font_size === 'string') {
            result = font_size
        } else {
            result = `${font_size}px`
        }

        return result
    }

    private getLineHeight(line_height = TypicalTextStyleDefaults.line_height): string {
        let result: string

        if (typeof line_height === 'string') {
            result = line_height
        } else {
            result = `${line_height}px`
        }

        return result
    }

    private getLetterSpacing(letter_spacing = TypicalTextStyleDefaults.letter_spacing): string {
        let result: string

        if (typeof letter_spacing === 'string') {
            result = letter_spacing
        } else {
            result = `${letter_spacing}px`
        }

        return result
    }
}
