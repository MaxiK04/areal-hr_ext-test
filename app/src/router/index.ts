// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// Ленивая загрузка компонентов (чтобы не было ошибок импорта)
const LoginView = () => import('../components/LoginView.vue')
const DashboardView = () => import('../components/DashboardView.vue')
const UsersView = () => import('../components/UsersView.vue')

const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'login',
        component: LoginView
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: DashboardView,
        meta: { requiresAuth: true }
    },
    {
        path: '/users',
        name: 'users',
        component: UsersView,
        meta: { requiresAuth: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Глобальный навигационный хук для проверки аутентификации
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('authToken')

    if (to.meta.requiresAuth && !token) {
        // Если маршрут требует авторизации, а токена нет - редирект на логин
        next('/login')
    } else if (to.path === '/login' && token) {
        // Если уже авторизован и пытается зайти на логин - редирект на dashboard
        next('/dashboard')
    } else {
        next()
    }
})

export default router