<template lang="pug">
slot(v-if="!name")
TransitionGroup(
    v-else-if="group"
    :name="name"
)
    slot

Transition(
    v-else
    :name="name"
    :mode="mode"
)
    slot
</template>

<script lang="ts" setup>
export type Transition = 'fade' | 'slow-fade' | 'slide-fade' | 'slide-fade-left' | 'slide-fade-right' | 'slide-fade-down' | undefined
export type TransitionMode = 'default' | 'out-in' | 'in-out'

type TransitionProps = {
    name?: Transition | null
    group?: boolean
    mode?: TransitionMode
}

withDefaults(defineProps<TransitionProps>(), {
    mode: 'out-in'
})

</script>

<style lang="sass" scoped>
// Fade
.fade-enter-active,
.fade-leave-active 
    transition: opacity 0.15s ease

.fade-enter-from,
.fade-leave-to 
    opacity: 0

.fade-leave-active
    // position: absolute

// Slow fade
.slow-fade-enter-active,
.slow-fade-leave-active 
    transition: opacity 0.15s ease

.slow-fade-enter-from,
.slow-fade-leave-to 
    opacity: 0

// Slide fade up (default)
.slide-fade-enter-active 
  transition: all 0.09s ease-out

.slide-fade-leave-active 
  transition: all 0.15s cubic-bezier(1, 0.5, 0.8, 1)

.slide-fade-enter-from,
.slide-fade-leave-to 
  transform: translateY(20px)
  opacity: 0

// Slide fade left <-
.slide-fade-left-enter-active 
  transition: all 0.09s ease-out

.slide-fade-left-leave-active 
  transition: all 0.15s cubic-bezier(1, 0.5, 0.8, 1)

.slide-fade-left-enter-from,
.slide-fade-left-leave-to 
  transform: translateX(-20px)
  opacity: 0


// Slide fade right ->
.slide-fade-right-enter-active 
  transition: all 0.09s ease-out

.slide-fade-right-leave-active 
  transition: all 0.15s cubic-bezier(1, 0.5, 0.8, 1)

.slide-fade-right-enter-from,
.slide-fade-right-leave-to 
  transform: translateX(20px)
  opacity: 0


// Slide fade down
.slide-fade-up-enter-active 
  transition: all 0.09s ease-out

.slide-fade-up-leave-active 
  transition: all 0.15s cubic-bezier(1, 0.5, 0.8, 1)

.slide-fade-up-enter-from,
.slide-fade-up-leave-to 
  transform: translateY(-20px)
  opacity: 0

</style>