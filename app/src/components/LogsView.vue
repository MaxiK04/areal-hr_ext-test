<template>
  <div style="padding: 20px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h1 style="margin: 0;">Журнал действий</h1>
      <div>
        <button @click="loadLogs" :disabled="loading">
          Обновить
        </button>
      </div>
    </div>

    <div v-if="error" style="background: #f8d7da; color: #721c24; padding: 10px; margin-bottom: 15px; border-radius: 4px; border: 1px solid #f5c6cb;">
      {{ error }}
    </div>


    <div style="background: #f8f9fa; padding: 20px; margin-bottom: 20px; border-radius: 8px; border: 1px solid #dee2e6;">
      <h3 style="margin-top: 0; margin-bottom: 15px;">Фильтры</h3>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 15px;">
        <div>
          <label style="display: block; margin-bottom: 5px; font-weight: 500;">Пользователь:</label>
          <select v-model="filters.userId" style="width: 100%; padding: 8px 12px; border: 1px solid #ced4da; border-radius: 4px;">
            <option value="">Все пользователи</option>
            <option v-for="user in allUsers" :key="user.id_user" :value="user.id_user">
              {{ user.login }} ({{ user.name }} {{ user.second_name }})
            </option>
          </select>
        </div>

        <!-- Фильтр по действию -->
        <div>
          <label style="display: block; margin-bottom: 5px; font-weight: 500;">Действие:</label>
          <select v-model="filters.objectOperation" style="width: 100%; padding: 8px 12px; border: 1px solid #ced4da; border-radius: 4px;">
            <option value="">Все действия</option>
            <option v-for="(label, key) in operationLabels" :key="key" :value="key">
              {{ label }}
            </option>
          </select>
        </div>

        <!-- Фильтр по дате -->
        <div>
          <label style="display: block; margin-bottom: 5px; font-weight: 500;">Период:</label>
          <input
              type="date"
              v-model="filters.startDate"
              style="width: 100%; padding: 8px 12px; border: 1px solid #ced4da; border-radius: 4px; margin-bottom: 5px;"
          >
          <input
              type="date"
              v-model="filters.endDate"
              style="width: 100%; padding: 8px 12px; border: 1px solid #ced4da; border-radius: 4px;"
          >
        </div>
      </div>

      <div style="display: flex; gap: 10px;">
        <button @click="applyFilters" style="padding: 8px 16px;">
          Применить фильтры
        </button>
        <button @click="resetFilters" style="padding: 8px 16px;">
          Сбросить фильтры
        </button>
      </div>
    </div>

    <div v-if="loading" style="text-align: center; padding: 40px;">
      Загрузка...
    </div>

    <div v-else-if="filteredLogs.length === 0" style="text-align: center; padding: 40px; color: #6c757d;">
      Нет записей логов
    </div>

    <div v-else style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; min-width: 800px;">
        <thead>
        <tr style="background: #f5f5f5;">
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; white-space: nowrap;">Дата и время</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Пользователь</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Действие</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Старое значение</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Новое значение</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="log in filteredLogs"
            :key="log.id_log"
            style="border-bottom: 1px solid #eee;"
            :style="getLogRowStyle(log.object_operation)"
        >
          <td style="padding: 12px; white-space: nowrap;">
            {{ formatDateTime(log.created_at) }}
          </td>
          <td style="padding: 12px;">
              <span v-if="log.user_login">
                {{ log.user_login }}
                <span v-if="log.user_name" style="color: #666; font-size: 0.9em;">
                  ({{ log.user_name }} {{ log.user_second_name }})
                </span>
              </span>
            <span v-else style="color: #999;">
                Система
              </span>
          </td>
          <td style="padding: 12px;">
              <span :style="getOperationStyle(log.object_operation)">
                {{ getOperationLabel(log.object_operation) }}
              </span>
          </td>
          <td style="padding: 12px; max-width: 300px; word-wrap: break-word; color: #666; background-color: #f8f9fa; border-radius: 4px;">
            {{ formatLogValue(log.old_field) }}
          </td>
          <td style="padding: 12px; max-width: 300px; word-wrap: break-word; background-color: #e8f4f8; border-radius: 4px;">
            {{ formatLogValue(log.new_field) }}
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div
        v-if="selectedLog"
        style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;"
    >
      <div style="background: white; padding: 30px; border-radius: 8px; width: 600px; max-width: 90%; max-height: 90%; overflow-y: auto;">
        <h2 style="margin-top: 0;">Детали записи</h2>

        <div style="margin-bottom: 20px;">
          <strong>ID записи:</strong> {{ selectedLog.id_log }}<br>
          <strong>Дата и время:</strong> {{ formatDateTime(selectedLog.created_at) }}<br>
          <strong>Пользователь:</strong> {{ selectedLog.user_login || 'Система' }}<br>
          <strong>Действие:</strong> {{ getOperationLabel(selectedLog.object_operation) }}
        </div>

        <div style="margin-bottom: 15px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <strong style="display: block; margin-bottom: 5px;">Старое значение:</strong>
              <div style="background: #f8f9fa; padding: 10px; border-radius: 4px; border: 1px solid #dee2e6; min-height: 100px; overflow: auto;">
                <pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word;">{{ formatLogValue(selectedLog.old_field) }}</pre>
              </div>
            </div>

            <div>
              <strong style="display: block; margin-bottom: 5px;">Новое значение:</strong>
              <div style="background: #e8f4f8; padding: 10px; border-radius: 4px; border: 1px solid #b8daff; min-height: 100px; overflow: auto;">
                <pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word;">{{ formatLogValue(selectedLog.new_field) }}</pre>
              </div>
            </div>
          </div>
        </div>

        <div v-if="selectedLog.metadata" style="margin-bottom: 20px;">
          <strong style="display: block; margin-bottom: 5px;">Метаданные:</strong>
          <pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; border: 1px solid #dee2e6; font-size: 12px; overflow-x: auto;">
            {{ JSON.stringify(selectedLog.metadata, null, 2) }}
          </pre>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button
              @click="selectedLog = null"
              style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px;"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue';

const logs = ref([]);
const allUsers = ref([]);
const loading = ref(false);
const error = ref('');
const selectedLog = ref(null);
const currentPage = ref(1);
const itemsPerPage = 50;

const filters = ref({
  userId: '',
  objectOperation: '',
  startDate: '',
  endDate: ''
});
const getLogRowStyle = (operation) => {
  const styles = {
    create: {backgroundColor: 'rgba(40, 167, 69, 0.05)'},
    update: {backgroundColor: 'rgba(23, 162, 184, 0.05)'},
    delete: {backgroundColor: 'rgba(220, 53, 69, 0.05)'},
    login: {backgroundColor: 'rgba(0, 123, 255, 0.05)'},
    logout: {backgroundColor: 'rgba(108, 117, 125, 0.05)'},
    password_change: {backgroundColor: 'rgba(255, 193, 7, 0.05)'},
    role_change: {backgroundColor: 'rgba(111, 66, 193, 0.05)'}
  };
  return styles[operation] || {};
};

const getOperationStyle = (operation) => {
  const styles = {
    create: {color: '#28a745', fontWeight: 'bold'},
    update: {color: '#17a2b8', fontWeight: 'bold'},
    delete: {color: '#dc3545', fontWeight: 'bold'},
    login: {color: '#007bff', fontWeight: 'bold'},
    logout: {color: '#6c757d', fontWeight: 'bold'},
    password_change: {color: '#ffc107', fontWeight: 'bold'},
    role_change: {color: '#6f42c1', fontWeight: 'bold'}
  };
  return styles[operation] || {};
};
const operationLabels = {
  create: 'Создание',
  update: 'Обновление',
  delete: 'Удаление',
  restore: 'Восстановление',
  status_change: 'Изменение статуса',
  role_change: 'Изменение роли',
};

const getOperationLabel = (operation) => {
  return operationLabels[operation] || operation;
};


const formatLogValue = (value) => {
  if (!value || value.trim() === '') return '-';


  const trimmedValue = value.trim();

  if ((trimmedValue.startsWith('{') && trimmedValue.endsWith('}')) ||
      (trimmedValue.startsWith('[') && trimmedValue.endsWith(']'))) {
    try {
      const parsed = JSON.parse(trimmedValue);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {

      return trimmedValue;
    }
  }

  return trimmedValue;
};



// Форматирование даты и времени
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-';
  const date = new Date(dateTime);
  return date.toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Загрузка логов
async function loadLogs() {
  loading.value = true;
  error.value = '';

  try {
    const token = localStorage.getItem('authToken');

    // Загружаем логи
    const logsRes = await fetch('http://localhost:3000/logs', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!logsRes.ok) throw new Error(`Ошибка загрузки логов: ${logsRes.status}`);
    logs.value = await logsRes.json();

    // Загружаем пользователей для фильтра
    const usersRes = await fetch('http://localhost:3000/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (usersRes.ok) {
      allUsers.value = await usersRes.json();
    }

  } catch (err) {
    error.value = err.message;
    console.error('Ошибка загрузки:', err);
  } finally {
    loading.value = false;
  }
}

// Применение фильтров
function applyFilters() {
  currentPage.value = 1;
}

// Сброс фильтров
function resetFilters() {
  filters.value = {
    userId: '',
    objectOperation: '',
    startDate: '',
    endDate: ''
  };
  currentPage.value = 1;
}

// Фильтрованные логи
const filteredLogs = computed(() => {
  let result = [...logs.value];

  // Фильтр по пользователю
  if (filters.value.userId) {
    result = result.filter(log => log.user_id === parseInt(filters.value.userId));
  }

  // Фильтр по действию
  if (filters.value.objectOperation) {
    result = result.filter(log => log.object_operation === filters.value.objectOperation);
  }

  // Фильтр по дате
  if (filters.value.startDate) {
    const startDate = new Date(filters.value.startDate);
    result = result.filter(log => {
      const logDate = new Date(log.created_at);
      return logDate >= startDate;
    });
  }

  if (filters.value.endDate) {
    const endDate = new Date(filters.value.endDate);
    endDate.setHours(23, 59, 59, 999);
    result = result.filter(log => {
      const logDate = new Date(log.created_at);
      return logDate <= endDate;
    });
  }

  return result;
});


onMounted(() => {
  loadLogs();
});
</script>