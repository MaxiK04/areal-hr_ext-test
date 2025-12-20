<template>
  <div style="padding: 20px;">
    <!-- Сообщение о правах доступа -->
    <div v-if="userRole !== 'admin'" style="background: #fff3cd; color: #856404; padding: 15px; margin-bottom: 20px; border-radius: 4px; border: 1px solid #ffeaa7;">
      Права только на просмотр данных. Создание и удаление недоступно
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h1 style="margin: 0;">Должности</h1>
      <div>
        <button
            v-if="userRole === 'admin'"
            @click="showCreateModal = true"
            style="margin-right: 10px;">
          Добавить
        </button>
        <button
            @click="loadPositions"
            :disabled="loading"
            style="margin-right: 10px;">
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

    <div style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; min-width: 600px;">
        <thead>
        <tr style="background: #f5f5f5;">
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">ID</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Название</th>
          <th v-if="userRole === 'admin'" style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Действия</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="position in positions" :key="position.position_id" style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px;">{{ position.position_id }}</td>
          <td style="padding: 12px;">{{ position.name }}</td>
          <td v-if="userRole === 'admin'" style="padding: 12px;">
            <button
                @click="deletePosition(position)"
                style="padding: 6px 12px; background: #ffebee; color: #c62828; border: 1px solid #ffcdd2;  cursor: pointer;">
              Удалить
            </button>
          </td>
        </tr>
        <tr v-if="positions.length === 0">
          <td :colspan="userRole === 'admin' ? 3 : 2" style="padding: 20px; text-align: center; color: #999;">
            Нет данных о должностях
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showCreateModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
      <div style="background: white; padding: 30px; border-radius: 8px; width: 400px;">
        <h2 style="margin-top: 0; margin-bottom: 20px;">Новая должность</h2>

        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 500;">Название *</label>
          <input
              v-model="newPosition.name"
              @keyup.enter="createPosition"
              style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
              placeholder="Введите название должности" required>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button
              @click="showCreateModal = false"
              style="padding: 8px 16px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">
            Отмена
          </button>
          <button
              @click="createPosition"
              :disabled="!newPosition.name"
              style="padding: 8px 16px; cursor: pointer;">
            Создать
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';

const positions = ref([]);
const loading = ref(false);
const error = ref('');
const success = ref('');
const showCreateModal = ref(false);
const userRole = ref('user');

const newPosition = ref({
  name: ''
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

async function loadPositions() {
  loading.value = true;
  error.value = '';
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch('http://localhost:3000/positions', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Ошибка загрузки: ${res.status} - ${errorText}`);
    }

    const data = await res.json();
    console.log('Загруженные должности:', data);

    positions.value = data;

  } catch (err) {
    error.value = err.message;
    console.error('Ошибка загрузки должностей:', err);
  } finally {
    loading.value = false;
  }
}

async function createPosition() {
  if (userRole.value !== 'admin') {
    error.value = 'Недостаточно прав для создания должности';
    return;
  }

  if (!newPosition.value.name) {
    error.value = 'Введите название должности';
    return;
  }

  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch('http://localhost:3000/positions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newPosition.value)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `Ошибка ${res.status}`);
    }

    success.value = `Должность "${newPosition.value.name}" создана успешно!`;
    showCreateModal.value = false;
    newPosition.value = {name: ''};

    await loadPositions();

    setTimeout(() => {
      success.value = '';
    }, 3000);

  } catch (err) {
    error.value = err.message;
    console.error('Ошибка создания должности:', err);
  }
}

async function deletePosition(position) {
  if (userRole.value !== 'admin') {
    error.value = 'Недостаточно прав для удаления должности';
    return;
  }

  console.log('Попытка удалить должность:', position);

  if (!confirm(`Удалить должность "${position.name}"?\n\nВнимание: Если есть сотрудники с этой должностью, удаление может быть невозможно.`)) {
    return;
  }

  try {
    const token = localStorage.getItem('authToken');

    const res = await fetch(`http://localhost:3000/positions/${position.position_id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `Ошибка ${res.status}`);
    }

    positions.value = positions.value.filter(p => p.position_id !== position.position_id);

    success.value = data.message || `Должность "${position.name}" удалена`;

    setTimeout(() => {
      success.value = '';
    }, 2000);

  } catch (err) {
    error.value = err.message;
    console.error('Ошибка удаления должности:', err);
  }
}
onMounted(() => {
  userRole.value = getUserRole();
  loadPositions();
});
</script>