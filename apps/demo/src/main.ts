import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
// @ts-ignore
import { createPlausible } from 'v-plausible/vue'

const plausible = createPlausible({
    init: {
        domain: 'rusinas.github.io/typical',
        apiHost: 'https://plausible.rsns.tech',
        trackLocalhost: false,
    },
    settings: {
        enableAutoOutboundTracking: true,
        enableAutoPageviews: true,
    },
    partytown: false,
})

const app = createApp(App)

app.use(plausible)
app.mount('#app')