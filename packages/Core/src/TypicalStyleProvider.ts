export abstract class TypicalStyleProvider<StyleInput, StyleFinal> {
    readonly style: StyleFinal

    constructor(params: Partial<StyleInput> = {}) {
        this.style = this.getStyles(params)
    }

    protected abstract getStyles(styles: Partial<StyleInput>): StyleFinal
}
