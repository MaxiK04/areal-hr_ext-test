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
          <td style="padding: 12px;">
            <span v-if="!employee.editing">{{ employee.second_name }}</span>
            <input
                v-else
                v-model="employee.editForm.second_name"
                style="padding: 4px; border: 1px solid #ddd; border-radius: 4px; width: 100%;"
            >
          </td>
          <td style="padding: 12px;">
            <span v-if="!employee.editing">{{ employee.name }}</span>
            <input
                v-else
                v-model="employee.editForm.name"
                style="padding: 4px; border: 1px solid #ddd; border-radius: 4px; width: 100%;"
            >
          </td>
          <td style="padding: 12px;">
            <span v-if="!employee.editing">{{ employee.last_name || '-' }}</span>
            <input
                v-else
                v-model="employee.editForm.last_name"
                style="padding: 4px; border: 1px solid #ddd; border-radius: 4px; width: 100%;"
            >
          </td>
          <td style="padding: 12px;">
            <span v-if="!employee.editing">{{ formatDateForDisplay(employee.birth_date) }}</span>
            <input
                v-else
                v-model="employee.editForm.birth_date"
                type="date"
                style="padding: 4px; border: 1px solid #ddd; border-radius: 4px; width: 100%;"
            >
          </td>
          <td style="padding: 12px;">
            <span v-if="!employee.editing">{{ formatPassport(employee) }}</span>
            <div v-else>
              <div style="display: flex; gap: 4px; margin-bottom: 4px;">
                <input
                    v-model="employee.editForm.passport_serial"
                    placeholder="Серия"
                    style="padding: 4px; border: 1px solid #ddd; border-radius: 4px; width: 70px;"
                >
                <input
                    v-model="employee.editForm.passport_number"
                    placeholder="Номер"
                    style="padding: 4px; border: 1px solid #ddd; border-radius: 4px; width: 100px;"
                >
              </div>
            </div>
          </td>
          <td style="padding: 12px;">
              <span :style="getStatusStyle(employee.hr_status)">
                {{ getStatusLabel(employee.hr_status) }}
              </span>
          </td>
          <td v-if="userRole === 'admin'" style="padding: 12px;">
            <div style="display: flex; gap: 8px;">
              <button
                  v-if="!employee.editing"
                  @click="startEditing(employee)"
                  style="padding: 6px 12px; border: 1px;  cursor: pointer;"
              >
                Редактировать
              </button>
              <template v-else>
                <button
                    @click="saveEmployee(employee)"
                    style="padding: 6px 12px; background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; border-radius: 4px;"
                >
                  Сохранить
                </button>
                <button
                    @click="cancelEditing(employee)"
                    style="padding: 6px 12px; background: #f5f5f5; color: #666; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;"
                >
                  Отмена
                </button>
              </template>
              <button
                  @click="deleteEmployee(employee)"
                  style="padding: 6px 12px; background: #ffebee; color: #c62828; border: 1px solid #ffcdd2;"
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
              style="padding: 8px 16px; background: #4CAF50; color: white; border: none;  cursor: pointer;">
            Создать
          </button>
        </div>
      </div>
    </div>


    <div v-if="selectedEmployee" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1001;">
      <div style="background: white; padding: 30px; border-radius: 8px; width: 700px; max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2 style="margin: 0;">
            {{ selectedEmployee.second_name }} {{ selectedEmployee.name }} {{ selectedEmployee.last_name || '' }}
          </h2>
          <button
              @click="selectedEmployee = null"
              style="background: none; border: none; font-size: 20px; color: #999; cursor: pointer;"
          >
            ×
          </button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <h3 style="margin-bottom: 15px; color: #555;">Личные данные</h3>
            <div style="margin-bottom: 10px;">
              <strong>Дата рождения:</strong> {{ formatDateForDisplay(selectedEmployee.birth_date) }}
            </div>
            <div style="margin-bottom: 10px;">
              <strong>Статус:</strong>
              <span :style="getStatusStyle(selectedEmployee.hr_status)">
                {{ getStatusLabel(selectedEmployee.hr_status) }}
              </span>
            </div>
          </div>

          <div>
            <h3 style="margin-bottom: 15px; color: #555;">Паспортные данные</h3>
            <div style="margin-bottom: 5px;">
              <strong>Серия/Номер:</strong> {{ selectedEmployee.passport_serial }} {{ selectedEmployee.passport_number }}
            </div>
            <div style="margin-bottom: 5px;">
              <strong>Дата выдачи:</strong> {{ formatDateForDisplay(selectedEmployee.passport_date) }}
            </div>
            <div style="margin-bottom: 5px;">
              <strong>Код подразделения:</strong> {{ selectedEmployee.passport_code }}
            </div>
            <div style="margin-bottom: 5px;">
              <strong>Кем выдан:</strong> {{ selectedEmployee.passport_by }}
            </div>
          </div>

          <div style="grid-column: span 2;">
            <h3 style="margin-bottom: 15px; color: #555;">Адрес регистрации</h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 4px;">
              {{ formatAddress(selectedEmployee) }}
            </div>
          </div>

          <div v-if="selectedEmployee.hr_status === 'active'" style="grid-column: span 2;">
            <h3 style="margin-bottom: 15px; color: #555;">Текущие данные</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
              <div>
                <strong>Отдел:</strong> {{ selectedEmployee.current_department_id || 'Не назначен' }}
              </div>
              <div>
                <strong>Должность:</strong> {{ selectedEmployee.current_position_id || 'Не назначена' }}
              </div>
              <div>
                <strong>Зарплата:</strong>
                {{ selectedEmployee.current_salary ? formatCurrency(selectedEmployee.current_salary) : 'Не установлена' }}
              </div>
            </div>
          </div>
        </div>

        <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
          <button
              @click="selectedEmployee = null"
              style="padding: 8px 16px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Закрыть
          </button>
        </div>
      </div>
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

  if (dateString.includes('.')) {
    return dateString;
  }

  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  } catch (e) {
    return dateString;
  }
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
    const res = await fetch('http://localhost:3000/employees', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) throw new Error(`Ошибка загрузки: ${res.status}`);

    const data = await res.json();
    employees.value = data.map(emp => ({
      ...emp,
      editing: false,
      editForm: null
    }));

  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
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


async function updateEmployee(employee) {
  if (userRole.value !== 'admin') {
    error.value = 'Недостаточно прав для обновления сотрудника';
    return;
  }

  try {
    const updateData = {};

    if (employee.editForm.second_name !== employee.second_name) {
      updateData.second_name = employee.editForm.second_name;
    }
    if (employee.editForm.name !== employee.name) {
      updateData.name = employee.editForm.name;
    }
    if (employee.editForm.last_name !== employee.last_name) {
      updateData.last_name = employee.editForm.last_name || null;
    }


    const formattedBirthDate = formatDateToDDMMYYYY(employee.editForm.birth_date);
    if (formattedBirthDate !== employee.birth_date) {
      updateData.birth_date = formattedBirthDate;
    }
    if (employee.editForm.passport_serial !== employee.passport_serial) {
      updateData.passport_serial = employee.editForm.passport_serial;
    }
    if (employee.editForm.passport_number !== employee.passport_number) {
      updateData.passport_number = employee.editForm.passport_number;
    }

    const formattedPassportDate = formatDateToDDMMYYYY(employee.editForm.passport_date);
    if (formattedPassportDate !== employee.passport_date) {
      updateData.passport_date = formattedPassportDate;
    }

    if (employee.editForm.passport_code !== employee.passport_code) {
      if (employee.editForm.passport_code && employee.editForm.passport_code.length !== 7) {
        error.value = 'Код подразделения должен содержать 7 символов (например: 123-456)';
        return;
      }
      updateData.passport_code = employee.editForm.passport_code;
    }

    if (employee.editForm.passport_by !== employee.passport_by) {
      updateData.passport_by = employee.editForm.passport_by;
    }

    if (employee.editForm.registration_region !== employee.registration_region) {
      updateData.registration_region = employee.editForm.registration_region;
    }
    if (employee.editForm.registration_city !== employee.registration_city) {
      updateData.registration_city = employee.editForm.registration_city;
    }
    if (employee.editForm.registration_street !== employee.registration_street) {
      updateData.registration_street = employee.editForm.registration_street;
    }
    if (employee.editForm.registration_house !== employee.registration_house) {
      updateData.registration_house = employee.editForm.registration_house;
    }
    if (employee.editForm.registration_korp !== employee.registration_korp) {
      updateData.registration_korp = employee.editForm.registration_korp || null;
    }
    if (employee.editForm.registration_apart !== employee.registration_apart) {
      updateData.registration_apart = employee.editForm.registration_apart || null;
    }

    if (Object.keys(updateData).length === 0) {
      employee.editing = false;
      employee.editForm = null;
      return;
    }

    const token = localStorage.getItem('authToken');
    const res = await fetch(`http://localhost:3000/employees/${employee.id_employee}`, {
      method: 'PATCH',
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


    Object.assign(employee, data);
    employee.editing = false;
    employee.editForm = null;

    success.value = `Данные сотрудника обновлены`;

    setTimeout(() => {
      success.value = '';
    }, 2000);

  } catch (err) {
    error.value = err.message;
    console.error('Ошибка обновления сотрудника:', err);
    console.error('Отправленные данные:', employee.editForm);
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

function startEditing(employee) {
  employee.editing = true;
  employee.editForm = {
    second_name: employee.second_name,
    name: employee.name,
    last_name: employee.last_name || '',
    birth_date: formatDateToYYYYMMDD(employee.birth_date),
    passport_serial: employee.passport_serial,
    passport_number: employee.passport_number,
    passport_date: formatDateToYYYYMMDD(employee.passport_date),
    passport_code: employee.passport_code || '',
    passport_by: employee.passport_by,
    registration_region: employee.registration_region,
    registration_city: employee.registration_city,
    registration_street: employee.registration_street,
    registration_house: employee.registration_house,
    registration_korp: employee.registration_korp || '',
    registration_apart: employee.registration_apart || ''
  };
}

function saveEmployee(employee) {
  updateEmployee(employee);
}

function cancelEditing(employee) {
  employee.editing = false;
  employee.editForm = null;
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
    'active': 'padding: 4px 8px; border-radius: 4px;',
    'dismiss': 'padding: 4px 8px; border-radius: 4px;',
    'on_vacation': 'padding: 4px 8px; border-radius: 4px;',
    'sick_leave': ' padding: 4px 8px; border-radius: 4px;'
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