import { onBeforeUnmount, onMounted, type Ref } from 'vue'

type UseClickOutsideParams = {
    target: Ref<HTMLElement | any> | Ref<HTMLElement | any>[]
    handler: Function
}

export function useClickOutside(params: UseClickOutsideParams) {
    const {
        target,
        handler
    } = params

    const target_array: Ref<HTMLElement | any>[] = []

    function clickListener(event: MouseEvent) {
        const path = event.composedPath()

        const is_clicked_outside = !target_array.some(
            item => path.includes(item.value)
        )

        if (is_clicked_outside) {
            handler()
        }
    }

    onMounted(() => {
        if (Array.isArray(target)) {
            for (const item of target) {
                target_array.push(item)
            }
        } else {
            target_array.push(target)
        }

        document.addEventListener('mousedown', clickListener)
    })

    onBeforeUnmount(() => {
        document.removeEventListener('mousedown', clickListener)
    })

}