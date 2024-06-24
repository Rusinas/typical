import {
    ref,
    onMounted,
    onBeforeUnmount
} from 'vue'
import { TypicalSelection, type Selection } from '~typical/core/TypicalSelection'


export function useTypicalTextSelection() {
    const selection = ref<Selection>()

    function selectionHandler() {
        selection.value = TypicalSelection.getSelection()
    }

    onMounted(() => {
        document.addEventListener('selectionchange', selectionHandler)
    })
    
    onBeforeUnmount(() => {
        document.removeEventListener('selectionchange', selectionHandler)
    })

    return {
        selection,
    }
}