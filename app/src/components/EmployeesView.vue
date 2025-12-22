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
        <button @click="loadEmployees" :disabled="loading">
          Обновить
        </button>
      </div>
    </div>

    <div v-if="error" style="padding: 10px; margin-bottom: 15px; border-radius: 4px; border: 1px solid #f5c6cb;">
      {{ error }}
    </div>
    <div v-if="success" style="padding: 10px; margin-bottom: 15px; border-radius: 4px; border: 1px solid #c3e6cb;">
      {{ success }}
    </div>

    <div style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; min-width: 1200px;">
        <thead>
        <tr style="background: #f5f5f5;">
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">ID</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Фамилия</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Имя</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Отчество</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Дата рождения</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Паспорт</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Статус</th>
          <th v-if="userRole === 'admin'" style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Действия</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="employee in employees" :key="employee.id_employee" style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px;">{{ employee.id_employee }}</td>
          <td style="padding: 12px;">{{ employee.second_name }}</td>
          <td style="padding: 12px;">{{ employee.name }}</td>
          <td style="padding: 12px;">{{ employee.last_name || '-' }}</td>
          <td style="padding: 12px;">{{ formatDateForDisplay(employee.birth_date) }}</td>
          <td style="padding: 12px;">{{ formatPassport(employee) }}</td>
          <td style="padding: 12px;">
              <span :style="getStatusStyle(employee.hr_status)">
                {{ getStatusLabel(employee.hr_status) }}
              </span>
          </td>
          <td v-if="userRole === 'admin'" style="padding: 12px;">
            <div style="display: flex; gap: 8px;">
              <button
                  @click="openEditModal(employee)"
                  style="padding: 6px 12px;cursor: pointer;"
              >
                Редактировать
              </button>
              <button
                  @click="deleteEmployee(employee)"
                  style="padding: 6px 12px; background: #ffebee; color: #c62828; border: 1px solid #ffcdd2; cursor: pointer;"
              >
                Удалить
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="employees.length === 0">
          <td :colspan="userRole === 'admin' ? 8 : 7" style="padding: 20px; text-align: center; color: #999;">
            Нет данных о сотрудниках
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div v-if="showCreateModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
      <div style="background: white; padding: 30px; border-radius: 8px; width: 600px; max-height: 90vh; overflow-y: auto;">
        <h2 style="margin-top: 0; margin-bottom: 20px;">Новый сотрудник</h2>

        <h3 style="margin-bottom: 15px; color: #555;">Основная информация</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Фамилия *</label>
            <input
                v-model="newEmployee.second_name"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
                required
            >
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Имя *</label>
            <input
                v-model="newEmployee.name"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" required>
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Отчество</label>
            <input
                v-model="newEmployee.last_name"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Дата рождения *</label>
            <input
                v-model="newEmployee.birth_date"
                type="date"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
                required
            >
          </div>
        </div>

        <h3 style="margin-bottom: 15px; color: #555;">Паспортные данные</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Серия паспорта *</label>
            <input
                v-model="newEmployee.passport_serial"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" required>
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Номер паспорта *</label>
            <input
                v-model="newEmployee.passport_number"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" required>
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Дата выдачи *</label>
            <input
                v-model="newEmployee.passport_date"
                type="date"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" required>
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Код подразделения *</label>
            <input
                v-model="newEmployee.passport_code"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" placeholder="000-000" required>
          </div>
          <div style="grid-column: span 2;">
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Кем выдан *</label>
            <input
                v-model="newEmployee.passport_by"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" required>
          </div>
        </div>

        <h3 style="margin-bottom: 15px; color: #555;">Адрес регистрации</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Регион *</label>
            <input
                v-model="newEmployee.registration_region"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" required>
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Город *</label>
            <input
                v-model="newEmployee.registration_city"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" required>
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Улица *</label>
            <input
                v-model="newEmployee.registration_street"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" required>
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Дом *</label>
            <input
                v-model="newEmployee.registration_house"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" required>
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Корпус</label>
            <input
                v-model="newEmployee.registration_korp"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Квартира</label>
            <input
                v-model="newEmployee.registration_apart"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          </div>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
          <button
              @click="showCreateModal = false"
              style="padding: 8px 16px; background: #f5f5f5; border: 1px; cursor: pointer;">
            Отмена
          </button>
          <button
              @click="createEmployee"
              :disabled="!isValidNewEmployee"
              style="padding: 8px 16px;cursor: pointer;">
            Создать
          </button>
        </div>
      </div>
    </div>

    <div v-if="showEditModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1001;">
      <div style="background: white; padding: 30px; border-radius: 8px; width: 600px; max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2 style="margin: 0;">Редактирование сотрудника</h2>
          <button
              @click="closeEditModal"
              style="background: none; border: none; font-size: 24px; color: #999; cursor: pointer; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;"
          >
            ×
          </button>
        </div>

        <h3 style="margin-bottom: 15px; color: #555; border-bottom: 1px solid #eee; padding-bottom: 8px;">Основная информация</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Фамилия *</label>
            <input
                v-model="editForm.second_name"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
                required
            >
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Имя *</label>
            <input
                v-model="editForm.name"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
                required
            >
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Отчество</label>
            <input
                v-model="editForm.last_name"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
            >
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Дата рождения *</label>
            <input
                v-model="editForm.birth_date"
                type="date"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
                required
            >
          </div>
        </div>
        <h3 style="margin-bottom: 15px; color: #555; border-bottom: 1px solid #eee; padding-bottom: 8px;">Паспортные данные</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Серия паспорта *</label>
            <input
                v-model="editForm.passport_serial"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
                required
            >
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Номер паспорта *</label>
            <input
                v-model="editForm.passport_number"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
                required
            >
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Дата выдачи *</label>
            <input
                v-model="editForm.passport_date"
                type="date"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
                required
            >
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Код подразделения *</label>
            <input
                v-model="editForm.passport_code"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
                placeholder="000-000"
                required
            >
          </div>
          <div style="grid-column: span 2;">
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Кем выдан *</label>
            <input
                v-model="editForm.passport_by"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
                required
            >
          </div>
        </div>
        <h3 style="margin-bottom: 15px; color: #555; border-bottom: 1px solid #eee; padding-bottom: 8px;">Адрес регистрации</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px;">
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Регион *</label>
            <input
                v-model="editForm.registration_region"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
                required
            >
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Город *</label>
            <input
                v-model="editForm.registration_city"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
                required
            >
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Улица *</label>
            <input
                v-model="editForm.registration_street"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
                required
            >
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Дом *</label>
            <input
                v-model="editForm.registration_house"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
                required
            >
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Корпус</label>
            <input
                v-model="editForm.registration_korp"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
            >
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Квартира</label>
            <input
                v-model="editForm.registration_apart"
                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
            >
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
          <button
              @click="closeEditModal"
              style="padding: 10px 20px; background: #f5f5f5; color: #666; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; font-weight: 500;"
          >
            Отмена
          </button>
          <button
              @click="saveEditForm"
              :disabled="!isValidEditForm"
              style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;"
          >
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>

    <div v-if="selectedEmployee" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1002;">
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

const employees = ref([]);
const loading = ref(false);
const error = ref('');
const success = ref('');
const showCreateModal = ref(false);
const showEditModal = ref(false);
const selectedEmployee = ref(null);
const userRole = ref('user');

const newEmployee = ref({
  second_name: '',
  name: '',
  last_name: '',
  birth_date: '',
  passport_serial: '',
  passport_number: '',
  passport_date: '',
  passport_code: '',
  passport_by: '',
  registration_region: '',
  registration_city: '',
  registration_street: '',
  registration_house: '',
  registration_korp: '',
  registration_apart: ''
});

const editForm = ref({
  id_employee: null,
  second_name: '',
  name: '',
  last_name: '',
  birth_date: '',
  passport_serial: '',
  passport_number: '',
  passport_date: '',
  passport_code: '',
  passport_by: '',
  registration_region: '',
  registration_city: '',
  registration_street: '',
  registration_house: '',
  registration_korp: '',
  registration_apart: ''
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

async function loadEmployees() {
  loading.value = true;
  error.value = '';
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch('http://localhost:3000/employees/with-details', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) throw new Error(`Ошибка загрузки: ${res.status}`);

    const data = await res.json();
    employees.value = data;

  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

function formatDateToDDMMYYYY(dateString) {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  } catch (e) {
    console.error('Ошибка форматирования даты:', e);
    return dateString;
  }
}

function formatDateToYYYYMMDD(dateString) {
  if (!dateString) return '';

  if (dateString.includes('-')) {
    return dateString;
  }

  const parts = dateString.split('.');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return dateString;
}

function formatDateForDisplay(dateString) {
  if (!dateString) return '-';
  const dateOnly = dateString.split('T')[0];
  const [year, month, day] = dateOnly.split('-');
  return `${day}.${month}.${year}`;
}

function openEditModal(employee) {
  console.log('Открытие модального окна для:', employee);
  function convertDateForInput(dateStr) {
    if (!dateStr) return '';

    if (dateStr.includes('.')) {
      const parts = dateStr.split('.');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    return dateStr;
  }

  editForm.value = {
    id_employee: employee.id_employee,
    second_name: employee.second_name,
    name: employee.name,
    last_name: employee.last_name || '',
    birth_date: convertDateForInput(employee.birth_date),
    passport_serial: employee.passport_serial,
    passport_number: employee.passport_number,
    passport_date: convertDateForInput(employee.passport_date),
    passport_code: employee.passport_code || '',
    passport_by: employee.passport_by,
    registration_region: employee.registration_region,
    registration_city: employee.registration_city,
    registration_street: employee.registration_street,
    registration_house: employee.registration_house,
    registration_korp: employee.registration_korp || '',
    registration_apart: employee.registration_apart || ''
  };

  showEditModal.value = true;
}


function closeEditModal() {
  showEditModal.value = false;
  editForm.value = {
    id_employee: null,
    second_name: '',
    name: '',
    last_name: '',
    birth_date: '',
    passport_serial: '',
    passport_number: '',
    passport_date: '',
    passport_code: '',
    passport_by: '',
    registration_region: '',
    registration_city: '',
    registration_street: '',
    registration_house: '',
    registration_korp: '',
    registration_apart: ''
  };
}


const isValidEditForm = computed(() => {
  const form = editForm.value;
  return form.second_name &&
      form.name &&
      form.birth_date &&
      form.passport_serial &&
      form.passport_number &&
      form.passport_date &&
      form.passport_code &&
      form.passport_by &&
      form.registration_region &&
      form.registration_city &&
      form.registration_street &&
      form.registration_house;
});


async function saveEditForm() {
  if (!editForm.value.id_employee) return;

  if (userRole.value !== 'admin') {
    error.value = 'Недостаточно прав для редактирования сотрудника';
    return;
  }

  try {
    if (editForm.value.passport_code && editForm.value.passport_code.length !== 7) {
      error.value = 'Код подразделения должен содержать 7 символов (например: 123-456)';
      return;
    }

    const updateData = {
      second_name: editForm.value.second_name,
      name: editForm.value.name,
      last_name: editForm.value.last_name || null,
      birth_date: formatDateToDDMMYYYY(editForm.value.birth_date),
      passport_serial: editForm.value.passport_serial,
      passport_number: editForm.value.passport_number,
      passport_date: formatDateToDDMMYYYY(editForm.value.passport_date),
      passport_code: editForm.value.passport_code,
      passport_by: editForm.value.passport_by,
      registration_region: editForm.value.registration_region,
      registration_city: editForm.value.registration_city,
      registration_street: editForm.value.registration_street,
      registration_house: editForm.value.registration_house,
      registration_korp: editForm.value.registration_korp || null,
      registration_apart: editForm.value.registration_apart || null
    };

    console.log('Отправляемые данные для обновления:', updateData);
    const token = localStorage.getItem('authToken');
    const res = await fetch(`http://localhost:3000/employees/${editForm.value.id_employee}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    const data = await res.json();
    console.log('Ответ сервера:', data);
    if (!res.ok) {
      throw new Error(data.message || `Ошибка ${res.status}`);
    }

    const index = employees.value.findIndex(emp => emp.id_employee === editForm.value.id_employee);
    if (index !== -1) {
      employees.value[index] = {
        ...employees.value[index],
        ...updateData,
        birth_date: formatDateToDDMMYYYY(editForm.value.birth_date),
        passport_date: formatDateToDDMMYYYY(editForm.value.passport_date)
      };
    }

    success.value = 'Данные сотрудника успешно обновлены';
    closeEditModal();

    setTimeout(() => {
      success.value = '';
    }, 3000);

  } catch (err) {
    error.value = err.message;
    console.error('Ошибка обновления сотрудника:', err);
    console.error('Полная ошибка:', err.stack);
  }
}

async function createEmployee() {
  if (userRole.value !== 'admin') {
    error.value = 'Недостаточно прав для создания сотрудника';
    return;
  }

  try {
    if (newEmployee.value.passport_code && newEmployee.value.passport_code.length !== 7) {
      error.value = 'Код подразделения должен содержать 7 символов (например: 123-456)';
      return;
    }

    const employeeData = {
      ...newEmployee.value,
      birth_date: formatDateToDDMMYYYY(newEmployee.value.birth_date),
      passport_date: formatDateToDDMMYYYY(newEmployee.value.passport_date)
    };

    const token = localStorage.getItem('authToken');
    const res = await fetch('http://localhost:3000/employees', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(employeeData)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `Ошибка ${res.status}`);
    }

    success.value = `Сотрудник "${data.second_name} ${data.name}" создан успешно!`;
    showCreateModal.value = false;

    resetNewEmployee();

    await loadEmployees();

    setTimeout(() => {
      success.value = '';
    }, 3000);

  } catch (err) {
    error.value = err.message;
    console.error('Ошибка создания сотрудника:', err);
  }
}


async function deleteEmployee(employee) {
  if (userRole.value !== 'admin') {
    error.value = 'Недостаточно прав для удаления сотрудника';
    return;
  }

  if (!confirm(`Удалить сотрудника "${employee.second_name} ${employee.name}"?`)) return;

  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`http://localhost:3000/employees/${employee.id_employee}`, {
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

    employees.value = employees.value.filter(emp => emp.id_employee !== employee.id_employee);
    success.value = `Сотрудник "${employee.second_name} ${employee.name}" удален`;

    setTimeout(() => {
      success.value = '';
    }, 2000);

  } catch (err) {
    error.value = err.message;
  }
}

function getStatusLabel(status) {
  const labels = {
    'active': 'Активен',
    'dismiss': 'Уволен',
    'on_vacation': 'В отпуске',
    'sick_leave': 'На больничном'
  };
  return labels[status] || status;
}

function getStatusStyle(status) {
  const styles = {
    'active': 'color: #2e7d32; background-color: #e8f5e9; padding: 4px 8px; border-radius: 4px; font-weight: 500;',
    'dismiss': 'color: #c62828; background-color: #ffebee; padding: 4px 8px; border-radius: 4px; font-weight: 500;',
    'on_vacation': 'color: #f57c00; background-color: #fff3e0; padding: 4px 8px; border-radius: 4px; font-weight: 500;',
    'sick_leave': 'color: #6a1b9a; background-color: #f3e5f5; padding: 4px 8px; border-radius: 4px; font-weight: 500;'
  };
  return styles[status] || '';
}

function formatPassport(employee) {
  return `${employee.passport_serial} ${employee.passport_number}`;
}

function formatAddress(employee) {
  let address = `${employee.registration_region}, ${employee.registration_city}, ул. ${employee.registration_street}, д. ${employee.registration_house}`;
  if (employee.registration_korp) address += `, корп. ${employee.registration_korp}`;
  if (employee.registration_apart) address += `, кв. ${employee.registration_apart}`;
  return address;
}

function formatCurrency(amount) {
  if (!amount) return '-';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount);
}

const isValidNewEmployee = computed(() => {
  const emp = newEmployee.value;
  return emp.second_name &&
      emp.name &&
      emp.birth_date &&
      emp.passport_serial &&
      emp.passport_number &&
      emp.passport_date &&
      emp.passport_code &&
      emp.passport_by &&
      emp.registration_region &&
      emp.registration_city &&
      emp.registration_street &&
      emp.registration_house;
});

function resetNewEmployee() {
  newEmployee.value = {
    second_name: '',
    name: '',
    last_name: '',
    birth_date: '',
    passport_serial: '',
    passport_number: '',
    passport_date: '',
    passport_code: '',
    passport_by: '',
    registration_region: '',
    registration_city: '',
    registration_street: '',
    registration_house: '',
    registration_korp: '',
    registration_apart: ''
  };
}

onMounted(() => {
  userRole.value = getUserRole();
  loadEmployees();
});
</script>