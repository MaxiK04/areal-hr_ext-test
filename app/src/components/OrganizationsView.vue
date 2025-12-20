<template>
  <div style="padding: 20px;">
    <div v-if="userRole !== 'admin'" style="background: #fff3cd; color: #856404; padding: 15px; margin-bottom: 20px; border-radius: 4px; border: 1px solid #ffeaa7;">
      Права только на просмотр данных. Редактирование и удаление недоступно
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h1 style="margin: 0;">Организации</h1>
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

    <div v-if="organizations.length === 0 && !loading" style="background: #fff9c4; color: #5d4037; padding: 20px; text-align: center; border-radius: 4px; margin: 20px 0;">
      <p>Нет данных об организациях</p>
      <button v-if="userRole === 'admin'" @click="showCreateModal = true" style="padding: 8px 16px; background: #FF9800; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">
        Создать первую организацию
      </button>
    </div>

    <div v-if="organizations.length > 0">
      <table style="width: 100%; border-collapse: collapse; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <thead>
        <tr style="background: #f5f5f5;">
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-weight: 600;">ID</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-weight: 600;">Название</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-weight: 600;">Описание</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-weight: 600;">Дата создания</th>
          <th v-if="userRole === 'admin'" style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-weight: 600;">Действия</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="org in organizations" :key="org.id_organization" style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px; color: #666;">
            {{ org.id_organization }}
          </td>
          <td style="padding: 12px;">
            <template v-if="userRole === 'admin'">
              <input
                  v-model="org.name"
                  @change="updateOrganization(org)"
                  style="padding: 8px; width: 100%; border: 1px solid #ddd; border-radius: 4px;">
            </template>
            <template v-else>
              {{ org.name || 'Без названия' }}
            </template>
          </td>
          <td style="padding: 12px;">
            <template v-if="userRole === 'admin'">
              <input
                  v-model="org.comment"
                  @change="updateOrganization(org)"
                  style="padding: 8px; width: 100%; border: 1px solid #ddd; border-radius: 4px;">
            </template>
            <template v-else>
              {{ org.comment || '—' }}
            </template>
          </td>
          <td style="padding: 12px;">
            {{ formatDate(org.created_at) }}
          </td>
          <td v-if="userRole === 'admin'" style="padding: 12px;">
            <button
                @click="deleteOrganization(org)"
                style="padding: 6px 12px; background: #ffebee; color: #c62828; border: 1px solid #ffcdd2;">
              Удалить
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div v-if="showCreateModal && userRole === 'admin'" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
      <div style="background: white; padding: 30px; border-radius: 8px; width: 500px; max-width: 90vw; box-shadow: 0 4px 20px rgba(0,0,0,0.2);">
        <h2 style="margin-top: 0; margin-bottom: 20px;">Новая организация</h2>

        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 500;">Название организации *</label>
          <input
              v-model="newOrganization.name"
              placeholder="Введите название"
              style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
        </div>

        <div style="margin-bottom: 25px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 500;">Описание</label>
          <input
              v-model="newOrganization.comment"
              placeholder="Введите описание (необязательно)"
              style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button @click="showCreateModal = false" style="padding: 10px 20px; background: #9e9e9e; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Отмена
          </button>
          <button
              @click="createOrganization"
              :disabled="!newOrganization.name || creating"
              style="padding: 10px 20px; cursor: pointer;">
            {{ creating ? 'Создание...' : 'Создать' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const organizations = ref([]);
const loading = ref(false);
const creating = ref(false);
const error = ref('');
const success = ref('');
const showCreateModal = ref(false);

const userRole = ref('user');

const newOrganization = ref({
  name: '',
  comment: ''
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

function formatDate(dateString) {
  if (!dateString) return '—';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

async function loadOrganizations() {
  loading.value = true;
  error.value = '';
  try {
    const token = localStorage.getItem('authToken');
    console.log('Загрузка организаций... Токен:', token ? 'есть' : 'нет');

    const res = await fetch('http://localhost:3000/organizations', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Статус ответа организаций:', res.status);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Ошибка загрузки: ${res.status} - ${errorText}`);
    }

    const data = await res.json();
    console.log('Загружены организации:', data);

    organizations.value = data;

  } catch (err) {
    console.error('Ошибка загрузки организаций:', err);
    error.value = `Ошибка загрузки организаций: ${err.message}`;
  } finally {
    loading.value = false;
  }
}

async function createOrganization() {
  if (userRole.value !== 'admin') {
    error.value = 'Недостаточно прав для создания организации';
    return;
  }
  if (!newOrganization.value.name) {
    error.value = 'Введите название организации';
    return;
  }
  creating.value = true;
  error.value = '';
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch('http://localhost:3000/organizations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: newOrganization.value.name,
        comment: newOrganization.value.comment || ''
      })
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `Ошибка ${res.status}`);
    }

    success.value = `Организация "${newOrganization.value.name}" создана успешно!`;
    showCreateModal.value = false;
    newOrganization.value = {
      name: '',
      comment: ''
    };

    await loadOrganizations();

    setTimeout(() => {
      success.value = '';
    }, 3000);

  } catch (err) {
    console.error('Ошибка создания организации:', err);
    error.value = err.message || 'Ошибка при создании организации';
  } finally {
    creating.value = false;
  }
}

async function updateOrganization(org) {
  if (userRole.value !== 'admin') {
    error.value = 'Недостаточно прав для изменения данных';
    await loadOrganizations();
    return;
  }

  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`http://localhost:3000/organizations/${org.id_organization}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: org.name,
        comment: org.comment
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `Ошибка ${res.status}`);
    }

    success.value = `Данные организации "${org.name}" обновлены`;
    setTimeout(() => {
      success.value = '';
    }, 2000);

  } catch (err) {
    error.value = `Ошибка обновления: ${err.message}`;
    console.error('Ошибка обновления:', err);
    await loadOrganizations();
  }
}

async function deleteOrganization(org) {
  if (userRole.value !== 'admin') {
    error.value = 'Недостаточно прав для удаления организации';
    return;
  }

  if (!confirm(`Удалить организацию "${org.name}"? Это также удалит все связанные отделы.`)) {
    return;
  }

  try {
    const token = localStorage.getItem('authToken');


    const res = await fetch(`http://localhost:3000/organizations/${org.id_organization}`, {
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

    organizations.value = organizations.value.filter(o => o.id_organization !== org.id_organization);
    success.value = `Организация "${org.name}" удалена`;

    setTimeout(() => {
      success.value = '';
    }, 2000);

  } catch (err) {
    error.value = err.message;
    console.error('Ошибка удаления:', err);
  }
}

onMounted(() => {
  userRole.value = getUserRole();
  console.log('Текущая роль пользователя:', userRole.value);
  loadOrganizations();
});
</script>

