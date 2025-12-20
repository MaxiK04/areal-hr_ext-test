<template>
  <div style="padding: 20px;">
    <div v-if="userRole !== 'admin'" style="background: #fff3cd; color: #856404; padding: 15px; margin-bottom: 20px; border-radius: 4px; border: 1px solid #ffeaa7;">
      Права только на просмотр данных. Редактирование и удаление недоступно
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h1 style="margin: 0;">Отделы</h1>
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

    <div v-if="departments.length === 0 && !loading" style="background: #fff9c4; color: #5d4037; padding: 20px; text-align: center; border-radius: 4px; margin: 20px 0;">
      <p>Нет данных об отделах</p>
      <button v-if="userRole === 'admin'" @click="showCreateModal = true" style="padding: 8px 16px; background: #FF9800; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">
        Создать первый отдел
      </button>
    </div>
    <div v-if="departments.length > 0">
      <table style="width: 100%; border-collapse: collapse; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <thead>
        <tr style="background: #f5f5f5;">
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-weight: 600;">ID</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-weight: 600;">Название отдела</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-weight: 600;">Описание</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-weight: 600;">Организация</th>
          <th v-if="userRole === 'admin'" style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-weight: 600;">Действия</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="dept in departments" :key="dept.id_department" style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px; color: #666;">
            {{ dept.id_department }}
          </td>
          <td style="padding: 12px;">
            <template v-if="userRole === 'admin'">
              <input
                  v-model="dept.name"
                  @change="updateDepartment(dept)"
                  style="padding: 8px; width: 100%; border: 1px solid #ddd; border-radius: 4px;"
              >
            </template>
            <template v-else>
              {{ dept.name || 'Без названия' }}
            </template>
          </td>
          <td style="padding: 12px;">
            <template v-if="userRole === 'admin'">
              <input
                  v-model="dept.comment"
                  @change="updateDepartment(dept)"
                  style="padding: 8px; width: 100%; border: 1px solid #ddd; border-radius: 4px;"
              >
            </template>
            <template v-else>
              {{ dept.comment || '—' }}
            </template>
          </td>
          <td style="padding: 12px;">
            {{ getOrganizationName(dept.organization_id) || '—' }}
          </td>
          <td v-if="userRole === 'admin'" style="padding: 12px;">
            <button
                @click="deleteDepartment(dept)"
                style="padding: 6px 12px; background: #ffebee; color: #c62828; border: 1px solid #ffcdd2;"
            >
              Удалить
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showCreateModal && userRole === 'admin'" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
      <div style="background: white; padding: 30px; border-radius: 8px; width: 500px; max-width: 90vw; box-shadow: 0 4px 20px rgba(0,0,0,0.2);">
        <h2 style="margin-top: 0; margin-bottom: 20px;">Новый отдел</h2>

        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 500;">Название отдела *</label>
          <input
              v-model="newDepartment.name"
              placeholder="Введите название отдела"
              style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;"
          >
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 500;">Описание</label>
          <input
              v-model="newDepartment.comment"
              placeholder="Введите описание (необязательно)"
              style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;"
          >
        </div>

        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 500;">Родительский отдел (ID)</label>
          <input
              v-model="newDepartment.parent_id"
              type="number"
              placeholder="ID родительского отдела (необязательно)"
              style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;"
          >
        </div>

        <div style="margin-bottom: 25px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 500;">Организация *</label>
          <select
              v-model="newDepartment.organization_id"
              style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;"
          >
            <option value="" disabled>Выберите организацию</option>
            <option v-for="org in organizations" :value="org.id_organization" :key="org.id_organization">
              {{ org.organization_name || org.name }}
            </option>
          </select>
          <div v-if="organizations.length === 0" style="color: #f44336; font-size: 12px; margin-top: 5px;">
            Нет доступных организаций. Сначала создайте организацию.
          </div>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button @click="showCreateModal = false" style="padding: 10px 20px; cursor: pointer;">
            Отмена
          </button>
          <button
              @click="createDepartment"
              :disabled="!newDepartment.name || !newDepartment.organization_id || creating"
              style="padding: 10px 20px; cursor: pointer;"
          >
            {{ creating ? 'Создание...' : 'Создать' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const departments = ref([]);
const organizations = ref([]);
const loading = ref(false);
const error = ref('');
const success = ref('');
const showCreateModal = ref(false);
const userRole = ref('user');

const newDepartment = ref({
  name: '',
  organization_id: '',
  comment: ''
});

function getOrganizationName(orgId) {
  const org = organizations.value.find(o => o.id_organization === orgId);
  return org ? org.name : `Организация ID: ${orgId}`;
}

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

async function loadDepartments() {
  loading.value = true;
  error.value = '';
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch('http://localhost:3000/departments', {
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
    console.log('Загруженные отделы:', data);

    departments.value = data.map(dept => ({
      ...dept,
      editing: false,
      editForm: null
    }));

  } catch (err) {
    error.value = err.message;
    console.error('Ошибка загрузки отделов:', err);
  } finally {
    loading.value = false;
  }
}

async function loadOrganizations() {
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch('http://localhost:3000/organizations', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (res.ok) {
      organizations.value = await res.json();
      console.log('Загруженные организации:', organizations.value);
    }
  } catch (err) {
    console.error('Ошибка загрузки организаций:', err);
  }
}

async function createDepartment() {
  if (userRole.value !== 'admin') {
    error.value = 'Недостаточно прав для создания отдела';
    return;
  }

  if (!newDepartment.value.name || !newDepartment.value.organization_id) {
    error.value = 'Заполните обязательные поля (название и организация)';
    return;
  }

  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch('http://localhost:3000/departments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: newDepartment.value.name,
        organization_id: parseInt(newDepartment.value.organization_id),
        comment: newDepartment.value.comment || null
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `Ошибка ${res.status}`);
    }

    success.value = `Отдел "${newDepartment.value.name}" создан успешно!`;
    showCreateModal.value = false;
    newDepartment.value = {
      name: '',
      organization_id: '',
      comment: ''
    };

    await loadDepartments();

    setTimeout(() => {
      success.value = '';
    }, 3000);

  } catch (err) {
    error.value = err.message;
    console.error('Ошибка создания отдела:', err);
  }
}

async function updateDepartment(department) {
  if (userRole.value !== 'admin') {
    error.value = 'Недостаточно прав для изменения данных';
    await loadDepartments();
    return;
  }

  try {
    const updateData = {
      name: department.editForm.name,
      organization_id: department.editForm.organization_id ? parseInt(department.editForm.organization_id) : null,
      comment: department.editForm.comment || null
    };

    console.log('Обновление отдела:', department.department_id, updateData);

    const token = localStorage.getItem('authToken');

    const res = await fetch(`http://localhost:3000/departments/${department.department_id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `Ошибка ${res.status}`);
    }

    Object.assign(department, data);
    department.editing = false;
    department.editForm = null;

    success.value = `Данные отдела "${department.name}" обновлены`;

    setTimeout(() => {
      success.value = '';
    }, 2000);

  } catch (err) {
    error.value = `Ошибка обновления: ${err.message}`;
    console.error('Ошибка обновления:', err);
    await loadDepartments();
  }
}

async function deleteDepartment(department) {
  if (userRole.value !== 'admin') {
    error.value = 'Недостаточно прав для удаления отдела';
    return;
  }

  if (!confirm(`Удалить отдел "${department.name}"?\n\nВнимание: Если есть сотрудники в этом отделе, удаление может быть невозможно.`)) {
    return;
  }

  try {
    const token = localStorage.getItem('authToken');

    const res = await fetch(`http://localhost:3000/departments/${department.department_id}`, {
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

    departments.value = departments.value.filter(d => d.department_id !== department.department_id);
    success.value = `Отдел "${department.name}" удален`;

    setTimeout(() => {
      success.value = '';
    }, 2000);

  } catch (err) {
    error.value = err.message;
    console.error('Ошибка удаления:', err);
  }
}

function startEditing(department) {
  department.editing = true;
  department.editForm = {
    name: department.name,
    organization_id: department.organization_id,
    comment: department.comment || ''
  };
}

function saveDepartment(department) {
  updateDepartment(department);
}

function cancelEditing(department) {
  department.editing = false;
  department.editForm = null;
}

onMounted(() => {
  userRole.value = getUserRole();
  loadDepartments();
  loadOrganizations();
});
</script>

