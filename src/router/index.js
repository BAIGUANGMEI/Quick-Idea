import { createRouter, createWebHashHistory } from 'vue-router'

// 定义几个基本的页面组件（也可以单独创建组件文件）
import Home from '../components/Home.vue'
import Note from '../components/Note.vue'

const routes = [
    { 
        path: '/',
        component: Home
    },
    {
        path: '/note',
        component: Note
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router