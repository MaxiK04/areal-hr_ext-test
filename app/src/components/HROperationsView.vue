<template>
  <div style="padding: 20px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h1 style="margin: 0;">HR Операции</h1>
      <div>
        <button
            @click="showCreateModal = true"
            style="margin-right: 10px;"
        >
          Добавить
        </button>
        <button
            @click="loadOperations"
            :disabled="loading"
            style="margin-right: 10px;"
        >
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
      <table style="width: 100%; border-collapse: collapse; min-width: 800px;">
        <thead>
        <tr style="background: #f5f5f5;">
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">ID</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Сотрудник</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Тип операции</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Отдел</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Должность</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Зарплата</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Дата</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Действия</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="operation in operations" :key="operation.id" style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px;">{{ operation.id }}</td>
          <td style="padding: 12px;">
            {{ operation.employee_id }} - {{ operation.name }} {{ operation.second_name }}
          </td>
          <td style="padding: 12px;">
              <span :style="getOperationStyle(operation.type_action)">
                {{ getOperationLabel(operation.type_action) }}
              </span>
          </td>
          <td style="padding: 12px;">{{ operation.department_id || '-' }}</td>
          <td style="padding: 12px;">{{ operation.position_id || '-' }}</td>
          <td style="padding: 12px;">
            {{ operation.set_salary ? formatCurrency(operation.set_salary) : '-' }}
          </td>
          <td style="padding: 12px;">
            {{ formatDate(operation.created_at) }}
          </td>
          <td style="padding: 12px;">
            <button
                @click="deleteOperation(operation)"
                style="padding: 6px 12px; background: #ffebee; color: #c62828; border: 1px solid #ffcdd2;"
            >
              Удалить
            </button>
          </td>
        </tr>
        <tr v-if="operations.length === 0">
          <td colspan="8" style="padding: 20px; text-align: center; color: #999;">
            Нет данных об операциях
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showCreateModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
      <div style="background: white; padding: 30px; border-radius: 8px; width: 500px; max-height: 90vh; overflow-y: auto;">
        <h2 style="margin-top: 0; margin-bottom: 20px;">Новая HR операция</h2>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 500;">Сотрудник *</label>
          <select
              v-model="newOperation.employee_id"
              @change="onEmployeeChange"
              style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
              required
          >
            <option value="">Выберите сотрудника</option>
            <option v-for="employee in employees" :key="employee.id_employee" :value="employee.id_employee">
              {{ employee.id_employee }} - {{ employee.second_name }} {{ employee.name }} {{ employee.last_name }} ({{ employee.hr_status }})
            </option>
          </select>
        </div>

        <div v-if="currentEmployeeState" style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 15px; border: 1px solid #e9ecef;">
          <h4 style="margin-top: 0; margin-bottom: 10px;">Текущее состояние:</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <strong>Статус:</strong> {{ currentEmployeeState.hr_status }}
            </div>
            <div>
              <strong>Отдел:</strong> {{ currentEmployeeState.department_name || '-' }}
            </div>
            <div>
              <strong>Должность:</strong> {{ currentEmployeeState.position_name || '-' }}
            </div>
            <div>
              <strong>Зарплата:</strong> {{ formatCurrency(currentEmployeeState.current_salary) || '-' }}
            </div>
          </div>
        </div>

        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 500;">Тип операции *</label>
          <select
              v-model="newOperation.type_action"
              @change="onOperationTypeChange"
              style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
              required
          >
            <option value="HIRE">Прием на работу</option>
            <option value="TRANSFER">Перевод</option>
            <option value="SALARY_CHANGE">Изменение зарплаты</option>
            <option value="DISMISSAL">Увольнение</option>
          </select>
        </div>

        <div v-if="showDepartmentField" style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 500;">Отдел</label>
          <select
              v-model="newOperation.department_id"
              @change="console.log('Выбран отдел:', newOperation.department_id)"
              style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
              required
          >
            <option value="">Выберите отдел</option>
            <option
                v-for="dept in departments"
                :key="dept.id_department"
                :value="dept.id_department"
            >
              {{ dept.name }} (ID: {{ dept.id_department }})
            </option>
          </select>
        </div>

        <div v-if="showPositionField" style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 500;">Должность</label>
          <select
              v-model="newOperation.position_id"
              style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
          >
            <option value="">Выберите должность</option>
            <option v-for="position in positions" :key="position.position_id" :value="position.position_id">
              {{ position.name }}
            </option>
          </select>
        </div>

        <div v-if="showSalaryField" style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 500;">Зарплата</label>
          <input
              v-model="newOperation.set_salary"
              type="number"
              min="0"
              style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
              placeholder="Введите сумму"
          >
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
          <button
              @click="showCreateModal = false"
              style="padding: 8px 16px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;"
          >
            Отмена
          </button>
          <button
              @click="createOperation"
              :disabled="!newOperation.employee_id || !newOperation.type_action"
              style="padding: 8px 16px;  cursor: pointer;"
          >
            Создать
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

const operations = ref([]);
const employees = ref([]);
const departments = ref([]);
const positions = ref([]);
const loading = ref(false);
const error = ref('');
const success = ref('');
const showCreateModal = ref(false);
const currentEmployeeState = ref(null);

const newOperation = ref({
  employee_id: '',
  type_action: 'HIRE',
  department_id: '',
  position_id: '',
  set_salary: ''
});

const showDepartmentField = computed(() => {
  return ['HIRE', 'TRANSFER'].includes(newOperation.value.type_action);
});

const showPositionField = computed(() => {
  return ['HIRE', 'TRANSFER'].includes(newOperation.value.type_action);
});

const showSalaryField = computed(() => {
  return ['HIRE', 'TRANSFER', 'SALARY_CHANGE'].includes(newOperation.value.type_action);
});

const isHireOperation = computed(() => {
  return newOperation.value.type_action === 'HIRE';
});

const isNewEmployee = computed(() => {
  return newOperation.value.type_action === 'HIRE' ||
      !currentEmployeeState.value ||
      currentEmployeeState.value.hr_status === 'dismiss' ||
      !currentEmployeeState.value.current_department_id;
});

async function loadOperations() {
  loading.value = true;
  error.value = '';
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch('http://localhost:3000/hr-operations', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) throw new Error(`Ошибка загрузки: ${res.status}`);
    operations.value = await res.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function loadEmployees() {
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch('http://localhost:3000/employees/with-details', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (res.ok) {
      employees.value = await res.json();
    }
  } catch (err) {
    console.error('Ошибка загрузки сотрудников:', err);
  }
}

async function loadDepartments() {
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch('http://localhost:3000/departments', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (res.ok) {
      departments.value = await res.json();
    }
  } catch (err) {
    console.error('Ошибка загрузки отделов:', err);
  }
}

async function loadPositions() {
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch('http://localhost:3000/positions', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (res.ok) {
      positions.value = await res.json();
    }
  } catch (err) {
    console.error('Ошибка загрузки должностей:', err);
  }
}

async function getEmployeeCurrentState(employeeId) {
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`http://localhost:3000/hr-operations/employee/${employeeId}/state`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      currentEmployeeState.value = data;

      if (newOperation.value.type_action === 'HIRE' && isNewEmployee.value) {
        newOperation.value.department_id = '';
        newOperation.value.position_id = '';
        newOperation.value.set_salary = '';
      }
    } else {
      currentEmployeeState.value = {
        id_employee: employeeId,
        hr_status: 'inactive',
        current_department_id: null,
        current_position_id: null,
        current_salary: null
      };
    }
  } catch (err) {
    console.error('Ошибка загрузки состояния сотрудника:', err);
    currentEmployeeState.value = {
      id_employee: employeeId,
      hr_status: 'inactive',
      current_department_id: null,
      current_position_id: null,
      current_salary: null
    };
  }
}

async function createOperation() {
  console.log('=== createOperation началось ===');
  console.log('newOperation.value:', newOperation.value);
  console.log('department_id перед отправкой:', newOperation.value.department_id);

  if (!newOperation.value.employee_id || !newOperation.value.type_action) {
    error.value = 'Выберите сотрудника и тип операции';
    return;
  }

  let operationData = {
    employee_id: parseInt(newOperation.value.employee_id),
    type_action: newOperation.value.type_action
  };

  console.log('Создание операции:', newOperation.value);
  if (newOperation.value.type_action === 'HIRE') {
    console.log('HIRE - проверка полей:');
    console.log('- department_id:', newOperation.value.department_id, 'type:', typeof newOperation.value.department_id);
    console.log('- position_id:', newOperation.value.position_id, 'type:', typeof newOperation.value.position_id);
    console.log('- set_salary:', newOperation.value.set_salary, 'type:', typeof newOperation.value.set_salary);

    if (!newOperation.value.department_id ||
        !newOperation.value.position_id ||
        !newOperation.value.set_salary) {
      console.log('ОШИБКА: одно из полей пустое!');
      error.value = 'Для приема на работу необходимо заполнить все поля: отдел, должность и зарплату';
      return;
    }

    operationData.department_id = parseInt(newOperation.value.department_id);
    operationData.position_id = parseInt(newOperation.value.position_id);
    operationData.set_salary = parseFloat(newOperation.value.set_salary);

    console.log('operationData после преобразования:', operationData);
  }
  else if (newOperation.value.type_action === 'TRANSFER') {
    if (!newOperation.value.department_id && !newOperation.value.position_id && !newOperation.value.set_salary) {
      error.value = 'Для перевода укажите хотя бы одно поле: отдел, должность или зарплату';
      return;
    }

    if (newOperation.value.department_id) {
      operationData.department_id = parseInt(newOperation.value.department_id);
    } else if (currentEmployeeState.value?.current_department_id) {
      operationData.department_id = currentEmployeeState.value.current_department_id;
    } else {
      operationData.department_id = 1;
    }

    if (newOperation.value.position_id) {
      operationData.position_id = parseInt(newOperation.value.position_id);
    } else if (currentEmployeeState.value?.current_position_id) {
      operationData.position_id = currentEmployeeState.value.current_position_id;
    } else {
      operationData.position_id = 1;
    }

    if (newOperation.value.set_salary) {
      operationData.set_salary = parseInt(newOperation.value.set_salary);
    } else if (currentEmployeeState.value?.current_salary) {
      operationData.set_salary = currentEmployeeState.value.current_salary;
    } else {
      operationData.set_salary = 30000;
    }
  }
  else if (newOperation.value.type_action === 'SALARY_CHANGE') {
    if (!newOperation.value.set_salary) {
      error.value = 'Для изменения зарплаты укажите новую зарплату';
      return;
    }

    if (currentEmployeeState.value) {
      operationData.department_id = currentEmployeeState.value.current_department_id || 1;
      operationData.position_id = currentEmployeeState.value.current_position_id || 1;
    } else {
      operationData.department_id = 1;
      operationData.position_id = 1;
    }

    operationData.set_salary = parseInt(newOperation.value.set_salary);
  }
  else if (newOperation.value.type_action === 'DISMISSAL') {
    if (currentEmployeeState.value) {
      operationData.department_id = currentEmployeeState.value.current_department_id || 1;
      operationData.position_id = currentEmployeeState.value.current_position_id || 1;
      operationData.set_salary = currentEmployeeState.value.current_salary || 0;
    } else {
      operationData.department_id = 1;
      operationData.position_id = 1;
      operationData.set_salary = 0;
    }
  }

  try {
    const token = localStorage.getItem('authToken');
    console.log('Отправляемые данные:', operationData);

    const res = await fetch('http://localhost:3000/hr-operations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(operationData)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `Ошибка ${res.status}`);
    }

    success.value = `Операция "${getOperationLabel(newOperation.value.type_action)}" создана успешно!`;
    showCreateModal.value = false;
    resetNewOperation();
    await loadOperations();

    setTimeout(() => {
      success.value = '';
    }, 3000);

  } catch (err) {
    error.value = err.message;
    console.error('Ошибка создания операции:', err);
    console.error('Отправленные данные:', operationData);
  }
}

async function deleteOperation(operation) {
  if (!confirm(`Удалить операцию #${operation.id}?`)) return;

  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`http://localhost:3000/hr-operations/${operation.id}`, {
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

    operations.value = operations.value.filter(op => op.id !== operation.id);
    success.value = `Операция #${operation.id} удалена`;

    setTimeout(() => {
      success.value = '';
    }, 2000);

  } catch (err) {
    error.value = err.message;
  }
}

function getOperationLabel(type) {
  const labels = {
    'HIRE': 'Прием на работу',
    'TRANSFER': 'Перевод',
    'SALARY_CHANGE': 'Изменение зарплаты',
    'DISMISSAL': 'Увольнение'
  };
  return labels[type] || type;
}

function getOperationStyle(type) {
  const styles = {
    'HIRE': 'padding: 4px 8px;',
    'DISMISSAL': 'padding: 4px 8px;',
    'TRANSFER': 'padding: 4px 8px;',
    'SALARY_CHANGE': 'padding: 4px 8px;'
  };
  return styles[type] || '';
}

function formatCurrency(amount) {
  if (!amount) return '-';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount);
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function onEmployeeChange() {
  if (newOperation.value.employee_id) {
    getEmployeeCurrentState(parseInt(newOperation.value.employee_id));
  } else {
    currentEmployeeState.value = null;
  }
}

function onOperationTypeChange() {
  const oldType = previousOperationType;
  const currentType = newOperation.value.type_action;
  const userSelectedDept = newOperation.value.department_id;
  const userSelectedPos = newOperation.value.position_id;
  const userSelectedSalary = newOperation.value.set_salary;

  if (currentEmployeeState.value) {
    switch(currentType) {
      case 'HIRE':
        newOperation.value.department_id = userSelectedDept || '';
        newOperation.value.position_id = userSelectedPos || '';
        newOperation.value.set_salary = userSelectedSalary || '';
        break;

      case 'TRANSFER':
        newOperation.value.department_id = userSelectedDept ||
            currentEmployeeState.value.current_department_id || '';
        newOperation.value.position_id = userSelectedPos ||
            currentEmployeeState.value.current_position_id || '';
        newOperation.value.set_salary = userSelectedSalary ||
            currentEmployeeState.value.current_salary || '';
        break;

      case 'SALARY_CHANGE':
        newOperation.value.department_id = userSelectedDept || '';
        newOperation.value.position_id = userSelectedPos || '';
        newOperation.value.set_salary = userSelectedSalary ||
            currentEmployeeState.value.current_salary || '';
        break;

      case 'DISMISSAL':
        break;
    }
  }

  previousOperationType = currentType;
}

let previousOperationType = '';

function resetNewOperation() {
  newOperation.value = {
    employee_id: '',
    type_action: 'HIRE',
    department_id: '',
    position_id: '',
    set_salary: ''
  };
  currentEmployeeState.value = null;
}

onMounted(() => {
  loadOperations();
  loadEmployees();
  loadDepartments();
  loadPositions();
});
</script>