<template>
  <div style="padding: 20px;">
    <div v-if="userRole !== 'admin'" style="background: #fff3cd; color: #856404; padding: 15px; margin-bottom: 20px; border-radius: 4px; border: 1px solid #ffeaa7;">
      Права только на просмотр данных. Редактирование и удаление недоступно
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h1 style="margin: 0;">Пользователи</h1>
      <div>
        <button v-if="userRole === 'admin'" @click="showCreateModal = true" style="margin-right: 10px;">
          Добавить
        </button>
        <button @click="loadUsers" :disabled="loading">
          Обновить
        </button>
      </div>
    </div>

    <div v-if="error" style="padding: 10px; margin-bottom: 15px; border-radius: 4px;">
      {{ error }}
    </div>
    <div v-if="success" style="padding: 10px; margin-bottom: 15px; border-radius: 4px;">
      {{ success }}
    </div>

    <table style="width: 100%; border-collapse: collapse;">
      <thead>
      <tr style="background: #f5f5f5;">
        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Логин</th>
        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Имя</th>
        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Фамилия</th>
        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Роль</th>
        <th v-if="userRole === 'admin'" style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Действия</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="user in users" :key="user.id_user" style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px;">{{ user.login }}</td>
        <td style="padding: 12px;">{{ user.name }}</td>
        <td style="padding: 12px;">{{ user.second_name }}</td>
        <td style="padding: 12px;">
          <select
              v-if="userRole === 'admin'"
              v-model="user.role"
              @change="updateRole(user)"
              style="padding: 4px 8px;"
          >
            <option value="user">Менеджер</option>
            <option value="admin">Администратор</option>
          </select>
          <span v-else>
              {{ user.role === 'admin' ? 'Администратор' : 'Менеджер' }}
            </span>
        </td>
        <td v-if="userRole === 'admin'" style="padding: 12px;">
          <button
              @click="deleteUser(user)"
              style="padding: 6px 12px; background: #ffebee; color: #c62828; border: 1px solid #ffcdd2;"
          >
            Удалить
          </button>
        </td>
      </tr>
      </tbody>
    </table>
    <div v-if="showCreateModal && userRole === 'admin'" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center;">
      <div style="background: white; padding: 30px; border-radius: 8px; width: 400px;">
        <h2 style="margin-top: 0;">Новый менеджер</h2>

        <input v-model="newUser.login" placeholder="Логин" style="width: 100%; padding: 8px; margin-bottom: 10px;">
        <input v-model="newUser.password" type="password" placeholder="Пароль" style="width: 100%; padding: 8px; margin-bottom: 10px;">
        <input v-model="newUser.name" placeholder="Имя" style="width: 100%; padding: 8px; margin-bottom: 10px;">
        <input v-model="newUser.second_name" placeholder="Фамилия" style="width: 100%; padding: 8px; margin-bottom: 10px;">

        <select v-model="newUser.role" style="width: 100%; padding: 8px; margin-bottom: 20px;">
          <option value="user">Менеджер</option>
          <option value="admin">Администратор</option>
        </select>

        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button @click="showCreateModal = false">Отмена</button>
          <button
              @click="createUser"
              :disabled="!newUser.login || !newUser.password"
          >
            Создать
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const users = ref([]);
const loading = ref(false);
const error = ref('');
const success = ref('');
const showCreateModal = ref(false);

const userRole = ref('user');

const newUser = ref({
  login: '',
  password: '',
  name: '',
  second_name: '',
  role: 'user'
});
function getUserRole() {
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      return parsed.role || 'user';
    }
  } catch (e) {
    console.error('Ошибка при получении роли:', e);
  }
  return 'user';
}

async function loadUsers() {
  loading.value = true;
  error.value = '';
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch('http://localhost:3000/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) throw new Error(`Ошибка загрузки: ${res.status}`);
    users.value = await res.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function createUser() {
  if (userRole.value !== 'admin') {
    error.value = 'Недостаточно прав для создания пользователя';
    return;
  }

  if (!newUser.value.login || !newUser.value.password || !newUser.value.name) {
    error.value = 'Заполните все обязательные поля';
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        login: newUser.value.login,
        password: newUser.value.password,
        name: newUser.value.name,
        second_name: newUser.value.second_name || '',
        role: newUser.value.role
      })
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 409) {
        throw new Error('Пользователь с таким логином уже существует');
      }
      throw new Error(data.message || `Ошибка ${res.status}`);
    }

    success.value = `Пользователь "${newUser.value.login}" создан успешно!`;
    showCreateModal.value = false;
    newUser.value = {
      login: '',
      password: '',
      name: '',
      second_name: '',
      role: 'user'
    };

    await loadUsers();

    setTimeout(() => {
      success.value = '';
    }, 3000);

  } catch (err) {
    error.value = err.message;
    console.error('Ошибка создания:', err);
  }
}

async function updateRole(user) {
  if (userRole.value !== 'admin') {
    error.value = 'Недостаточно прав для изменения роли';
    await loadUsers();
    return;
  }

  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`http://localhost:3000/users/${user.id_user}/role`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: user.role
      })
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || `Ошибка ${res.status}`);
    }

    success.value = `Роль пользователя "${user.login}" обновлена`;

    setTimeout(() => {
      success.value = '';
    }, 2000);

  } catch (err) {
    error.value = err.message;
    await loadUsers();
  }
}

async function deleteUser(user) {
  if (userRole.value !== 'admin') {
    error.value = 'Недостаточно прав для удаления пользователя';
    return;
  }

  if (!confirm(`Удалить пользователя "${user.login}"?`)) return;

  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`http://localhost:3000/users/${user.id_user}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || `Ошибка ${res.status}`);
    }

    users.value = users.value.filter(u => u.id_user !== user.id_user);
    success.value = `Пользователь "${user.login}" удален`;

    setTimeout(() => {
      success.value = '';
    }, 2000);

  } catch (err) {
    error.value = err.message;
  }
}

onMounted(() => {
  userRole.value = getUserRole();

  console.log('Текущая роль пользователя:', userRole.value);
  console.log('userData из localStorage:', localStorage.getItem('userData'));

  loadUsers();
});
</script>