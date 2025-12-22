import { createRouter, createWebHistory } from 'vue-router'

// Импортируем из src/ (а не из src/views/)
import LoginView from '../components/LoginView.vue'
import DashboardView from '../components/DashboardView.vue'
import UsersView from '../components/UsersView.vue'
import EmployeesView from '../components/EmployeesView.vue'
import PositionsView from '../components/PositionsView.vue'
import DepartmentsView from '../components/DepartmentsView.vue'
import OrganizationsView from '../components/OrganizationsView.vue'
import HROperationsView from '../components/HROperationsView.vue'
import LogsView from '../components/LogsView.vue'
import FilesView from '../components/FilesView.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', redirect: '/login' },
        { path: '/login', component: LoginView },
        {
            path: '/dashboard',
            component: DashboardView,
            meta: { requiresAuth: true }
        },
        {
            path: '/users',
            component: UsersView,
            meta: { requiresAuth: true }
        },
        {
            path: '/employees',
            component: EmployeesView,
            meta: { requiresAuth: true }
        },
        {
            path: '/positions',
            component: PositionsView,
            meta: { requiresAuth: true }
        },
        {
            path: '/departments',
            component: DepartmentsView,
            meta: { requiresAuth: true }
        },
        {
            path: '/organizations',
            component: OrganizationsView,
            meta: { requiresAuth: true }
        },
        {
            path: '/hr-operations',
            component: HROperationsView,
            meta: { requiresAuth: true }
        },
        {
            path: '/logs',
            component: LogsView,
            meta: { requiresAuth: true }
        },
        {
            path: '/files',
            component: FilesView,
            meta: { requiresAuth: true }
        }
    ]
})

router.beforeEach((to, from, next) => {
    const isAuthenticated = localStorage.getItem('authToken')

    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login')
    } else {
        next()
    }
})

export default router