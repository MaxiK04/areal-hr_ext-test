<template>
  <div>
    <h1>Панель управления</h1>
    <div class="nav-panel" v-if="showNav">
      <button @click="$router.push('/dashboard')">Панель</button>
      <button @click="$router.push('/users')">Пользователи</button>
      <button @click="$router.push('/employees')">Сотрудники</button>
      <button @click="$router.push('/departments')">Отделы</button>
      <button @click="$router.push('/positions')">Должности</button>
      <button @click="$router.push('/operations')">Операции</button>
      <button @click="$router.push('/files')">Файлы</button>
      <button @click="$router.push('/logs')">Логи</button>
      <button @click="logout">Выйти</button>
    </div>
    <div class="dashboard-grid">
      <div class="card" @click="$router.push('/users')">
        <h3>Пользователи</h3>
        <p>Управление учетными записями</p>
      </div>

      <div class="card" @click="$router.push('/employees')">
        <h3>Сотрудники</h3>
        <p>Управление сотрудниками</p>
      </div>

      <div class="card" @click="$router.push('/departments')">
        <h3>Отделы</h3>
        <p>Управление отделами</p>
      </div>

      <div class="card" @click="$router.push('/positions')">
        <h3>Должности</h3>
        <p>Управление должностями</p>
      </div>

      <div class="card" @click="$router.push('/operations')">
        <h3>HR-Операции</h3>
        <p>Управление операциями</p>
      </div>

      <div class="card" @click="$router.push('/files')">
        <h3>Файлы</h3>
        <p>Управление файлами</p>
      </div>

      <div class="card" @click="$router.push('/logs')">
        <h3>Логи</h3>
        <p>Просмотр системных логов</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, } from 'vue';
import {useRouter} from 'vue-router';

const router = useRouter();
const showNav = ref(true);

function logout() {
  localStorage.removeItem('authToken');
  router.push('/login');
}


</script>

<style scoped>
.nav-panel {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.nav-panel button {
  padding: 8px 16px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.nav-panel button:hover {
  background: #e0e0e0;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

</style>