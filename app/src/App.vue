<template>
  <div>
    <nav v-if="showNav" style="background: #f8f9fa; padding: 10px 20px; border-bottom: 1px solid #dee2e6;">
      <div style="display: flex; align-items: center; gap: 15px;">
        <span style="font-weight: bold; margin-right: 20px;">HR Система</span>
        <button @click="$router.push('/dashboard')" :class="{ active: $route.path === '/dashboard' }">
          Панель
        </button>
        <button @click="$router.push('/users')" :class="{ active: $route.path === '/users' }">
          Пользователи
        </button>
        <button @click="$router.push('/employees')" :class="{ active: $route.path === '/employees' }">
          Сотрудники
        </button>
        <button @click="$router.push('/departments')" :class="{ active: $route.path === '/departments' }">
          Отделы
        </button>
        <button @click="$router.push('/positions')" :class="{ active: $route.path === '/positions' }">
          Должности
        </button>
        <button @click="$router.push('/organizations')" :class="{ active: $route.path === '/organizations' }">
          Организации
        </button>
        <button @click="$router.push('/hr-operations')" :class="{ active: $route.path === '/hr-operations' }">
          HR-Operations
        </button>
        <button @click="$router.push('/logs')" :class="{ active: $route.path === '/logs' }">
          Логи
        </button>
        <button @click="$router.push('/files')" :class="{ active: $route.path === '/files' }">
          Файлы
        </button>
        <div style="margin-left: auto;">
          <button @click="logout" style="background: #dc3545; color: white;">
            Выйти
          </button>
        </div>
      </div>
    </nav>

    <div style="padding: 20px;">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import {computed} from 'vue'
import {useRouter, useRoute} from 'vue-router'
const router = useRouter()
const route = useRoute()
const showNav = computed(() => {
  return route.path !== '/login'
})
function logout() {
  localStorage.removeItem('authToken')
  router.push('/login')
}
</script>

<style scoped>
button {
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #e9ecef;
}

button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}
</style>