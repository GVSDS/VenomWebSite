import { createApp } from 'vue'
import router from '@/router'
import App from './App.vue'
import 'lenis/dist/lenis.css'
import '@/assets/base.css'

createApp(App).use(router).mount('#app')
