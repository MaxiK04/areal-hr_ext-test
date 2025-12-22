<template>
  <div style="padding: 20px;">
    <!-- Уведомление о правах -->
    <div v-if="userRole !== 'admin'" style="background: #fff3cd; color: #856404; padding: 15px; margin-bottom: 20px; border-radius: 4px; border: 1px solid #ffeaa7;">
      Права только на просмотр данных. Редактирование и удаление недоступно
    </div>

    <!-- Заголовок и кнопки -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h1 style="margin: 0;">Файлы сотрудников</h1>
      <div>
        <button @click="loadFiles" :disabled="loading">
          Обновить
        </button>
      </div>
    </div>
    <div v-if="error" style="background: #f8d7da; color: #721c24; padding: 10px; margin-bottom: 15px; border-radius: 4px; border: 1px solid #f5c6cb;">
      {{ error }}
    </div>

    <div v-if="success" style="background: #d4edda; color: #155724; padding: 10px; margin-bottom: 15px; border-radius: 4px; border: 1px solid #c3e6cb;">
      {{ success }}
    </div>
    <div style="background: #f8f9fa; padding: 20px; margin-bottom: 20px; border-radius: 8px; border: 1px solid #dee2e6;">
      <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
        <div>
          <label style="display: block; margin-bottom: 5px; font-weight: 500;">Сотрудник:</label>
          <select
              v-model="selectedEmployeeId"
              @change="loadEmployeeFiles"
              style="min-width: 300px; padding: 8px 12px; border: 1px solid #ced4da; border-radius: 4px;"
          >
            <option value="">Выберите сотрудника</option>
            <option
                v-for="employee in employees"
                :key="employee.id_employee"
                :value="employee.id_employee"
            >
              {{ employee.second_name }} {{ employee.name }} {{ employee.last_name || '' }}
            </option>
          </select>
        </div>

        <div style="margin-left: auto;">
          <button
              v-if="selectedEmployeeId && userRole === 'admin'"
              @click="showUploadModal = true"
              style=" border: none; padding: 8px 16px;"
          >
            Загрузить файл
          </button>
        </div>
      </div>
    </div>


    <div v-if="loading" style="text-align: center; padding: 40px;">
      Загрузка...
    </div>


    <div v-else-if="!selectedEmployeeId" style="text-align: center; padding: 40px; color: #6c757d;">
      Выберите сотрудника для просмотра файлов
    </div>


    <div v-else-if="files.length === 0" style="text-align: center; padding: 40px; color: #6c757d;">
      У сотрудника нет загруженных файлов
    </div>


    <div v-else style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; min-width: 800px;">
        <thead>
        <tr style="background: #f5f5f5;">
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Название</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Тип</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Дата загрузки</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Действия</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="file in files"
            :key="file.file_id"
            style="border-bottom: 1px solid #eee;"
        >
          <td style="padding: 12px;">
            {{ file.name }}
          </td>
          <td style="padding: 12px;">
              <span style="padding: 2px 8px; background: #e9ecef; border-radius: 4px; font-size: 0.85em;">
                {{ getFileType(file.name) }}
              </span>
          </td>
          <td style="padding: 12px; white-space: nowrap;">
            {{ formatDate(file.created_at) }}
          </td>
          <td style="padding: 12px;">
            <div style="display: flex; gap: 8px;">
              <button
                  v-if="userRole === 'admin'"
                  @click="deleteFile(file)"
                  style="padding: 6px 12px; background: #ffebee; color: #c62828; border: 1px solid #ffcdd2;"
              >
                Удалить
              </button>

              <button
                  @click="previewFile(file)"
                  style="padding: 6px 12px;"
              >
                Просмотр
              </button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div v-if="files.length > 0" style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; border: 1px solid #dee2e6;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong>Всего файлов:</strong> {{ files.length }}
        </div>
      </div>
    </div>

    <div
        v-if="showUploadModal && userRole === 'admin'"
        style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;"
    >
      <div style="background: white; padding: 30px; border-radius: 8px; width: 500px; max-width: 90%;">
        <h2 style="margin-top: 0;">Загрузка файла</h2>

        <div style="margin-bottom: 20px;">
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Сотрудник:</label>
            <div style="padding: 10px; background: #f8f9fa; border-radius: 4px; border: 1px solid #dee2e6;">
              {{ getSelectedEmployeeName() }}
            </div>
          </div>

          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Выберите файл:</label>
            <input
                type="file"
                ref="fileInput"
                @change="handleFileSelect"
                style="width: 100%; padding: 8px; border: 1px solid #ced4da; border-radius: 4px;"
            >
            <div v-if="selectedFile" style="margin-top: 10px; padding: 10px; background: #e8f4f8; border-radius: 4px;">
              <strong>Выбран файл:</strong> {{ selectedFile.name }}
            </div>
          </div>
        </div>

        <div v-if="uploadProgress > 0" style="margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>Загрузка...</span>
            <span>{{ uploadProgress }}%</span>
          </div>
          <div style="height: 10px; background: #e9ecef; border-radius: 5px; overflow: hidden;">
            <div
                :style="{
                width: `${uploadProgress}%`,
                height: '100%',
                background: '#28a745',
                transition: 'width 0.3s ease'
              }"
            ></div>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button
              @click="showUploadModal = false"
              style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px;"
          >
            Отмена
          </button>
          <button
              @click="uploadFile"
              :disabled="!selectedFile || uploading"
              style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px;"
          >
            {{ uploading ? 'Загрузка...' : 'Загрузить' }}
          </button>
        </div>
      </div>
    </div>

    <div
        v-if="previewFileData"
        style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;"
    >
      <div style="background: white; padding: 20px; border-radius: 8px; width: 90%; height: 90%; display: flex; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #dee2e6;">
          <h3 style="margin: 0;">{{ previewFileData.name }}</h3>
          <button
              @click="previewFileData = null"
              style="padding: 6px 12px; border: none; background: #6c757d; color: white; border-radius: 4px;"
          >
            Закрыть
          </button>
        </div>

        <div style="flex: 1; overflow: auto;">
          <div v-if="isImageFile(previewFileData.name)" style="text-align: center;">
            <img
                :src="getFilePreviewUrl(previewFileData)"
                :alt="previewFileData.name"
                style="max-width: 100%; max-height: 100%;"
                @load="imageLoaded = true"
            >
            <div v-if="!imageLoaded" style="padding: 40px;">
              Загрузка изображения...
            </div>
          </div>

          <div v-else-if="isPdfFile(previewFileData.name)" style="height: 100%;">
            <iframe
                :src="getFilePreviewUrl(previewFileData)"
                style="width: 100%; height: 100%; border: none;"
                title="PDF Preview"
            ></iframe>
          </div>

          <div v-else-if="isTextFile(previewFileData.name)" style="padding: 20px;">
            <pre style="white-space: pre-wrap; word-wrap: break-word;">{{ previewFileContent }}</pre>
          </div>

          <div v-else style="text-align: center; padding: 40px;">
            <p>Предпросмотр недоступен для этого типа файла</p>
          </div>
        </div>

        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #dee2e6; font-size: 0.9em; color: #666;">
          <strong>Информация о файле:</strong>
          {{ previewFileData.name }} |
          {{ getFileType(previewFileData.name) }} |
          Загружен: {{ formatDate(previewFileData.created_at) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {ref, onMounted} from 'vue';

export default {
  name: 'FilesView',

  setup() {
    const files = ref([]);
    const employees = ref([]);
    const selectedEmployeeId = ref('');
    const selectedEmployee = ref(null);
    const loading = ref(false);
    const uploading = ref(false);
    const uploadProgress = ref(0);
    const error = ref('');
    const success = ref('');
    const showUploadModal = ref(false);
    const selectedFile = ref(null);
    const previewFileData = ref(null);
    const previewFileContent = ref('');
    const imageLoaded = ref(false);
    const fileInput = ref(null);

    const userRole = ref('user');


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

    function getSelectedEmployeeName() {
      if (!selectedEmployee.value) return '';
      return `${selectedEmployee.value.last_name} ${selectedEmployee.value.name} ${selectedEmployee.value.second_name}`;
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
    async function loadEmployeeFiles() {
      if (!selectedEmployeeId.value) {
        files.value = [];
        selectedEmployee.value = null;
        return;
      }

      loading.value = true;
      error.value = '';

      try {
        selectedEmployee.value = employees.value.find(e => e.id_employee == selectedEmployeeId.value);
        const token = localStorage.getItem('authToken');
        const res = await fetch(`http://localhost:3000/files/employee/${selectedEmployeeId.value}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) throw new Error(`Ошибка загрузки файлов: ${res.status}`);

        files.value = await res.json();

      } catch (err) {
        error.value = err.message;
        console.error('Ошибка загрузки файлов:', err);
      } finally {
        loading.value = false;
      }
    }

    async function loadFiles() {
      await loadEmployees();
      if (selectedEmployeeId.value) {
        await loadEmployeeFiles();
      }
    }

    function handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) {

        if (file.size > 10 * 1024 * 1024) {
          error.value = 'Файл слишком большой. Максимальный размер: 10MB';
          selectedFile.value = null;
          if (fileInput.value) {
            fileInput.value.value = '';
          }
          return;
        }

        selectedFile.value = file;
        uploadProgress.value = 0;
      }
    }

    async function uploadFile() {
      if (!selectedFile.value || !selectedEmployeeId.value) {
        error.value = 'Выберите файл и сотрудника';
        return;
      }

      uploading.value = true;
      uploadProgress.value = 10;
      error.value = '';

      try {
        const formData = new FormData();
        formData.append('file', selectedFile.value);

        const url = `http://localhost:3000/files/upload?employee_id=${selectedEmployeeId.value}`;

        uploadProgress.value = 30;

        const token = localStorage.getItem('authToken');

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        uploadProgress.value = 70;

        if (!res.ok) {
          let errorMessage = `Ошибка загрузки: ${res.status}`;
          try {
            const errorData = await res.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            const text = await res.text();
            console.error('Error response text:', text);
          }
          throw new Error(errorMessage);
        }

        uploadProgress.value = 100;

        const uploadedFile = await res.json();

        success.value = `Файл "${uploadedFile.name}" успешно загружен`;
        showUploadModal.value = false;


        selectedFile.value = null;
        if (fileInput.value) {
          fileInput.value.value = '';
        }


        await loadEmployeeFiles();

        setTimeout(() => {
          success.value = '';
        }, 3000);

      } catch (err) {
        error.value = err.message;
        console.error('Ошибка загрузки файла:', err);
      } finally {
        uploading.value = false;
        uploadProgress.value = 0;
      }
    }

    async function deleteFile(file) {
      if (userRole.value !== 'admin') {
        error.value = 'Недостаточно прав для удаления файла';
        return;
      }

      if (!confirm(`Удалить файл "${file.name}"?`)) return;

      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`http://localhost:3000/files/${file.file_id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || `Ошибка удаления: ${res.status}`);
        }

        files.value = files.value.filter(f => f.file_id !== file.file_id);

        success.value = `Файл "${file.name}" удален`;

        setTimeout(() => {
          success.value = '';
        }, 3000);

      } catch (err) {
        error.value = err.message;
      }
    }

    async function previewFile(file) {
      previewFileData.value = file;
      imageLoaded.value = false;

      if (isTextFile(file.name)) {
        try {
          const token = localStorage.getItem('authToken');
          const response = await fetch(`http://localhost:3000/files/${file.file_id}/download`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const text = await response.text();
            previewFileContent.value = text;
          }
        } catch (err) {
          console.error('Ошибка загрузки текстового файла:', err);
        }
      }
    }

    function getFilePreviewUrl(file) {
      return `http://localhost:3000/files/${file.file_id}/download`;
    }

    function formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }


    function getFileType(filename) {
      const extension = filename.split('.').pop().toLowerCase();
      const types = {
        pdf: 'PDF документ',
        doc: 'Документ Word',
        docx: 'Документ Word',
        xls: 'Таблица Excel',
        xlsx: 'Таблица Excel',
        jpg: 'Изображение',
        jpeg: 'Изображение',
        png: 'Изображение',
        gif: 'Изображение',
        txt: 'Текстовый файл',
        zip: 'Архив',
        rar: 'Архив',
        ppt: 'Презентация',
        pptx: 'Презентация'
      };

      return types[extension] || extension.toUpperCase();
    }

    function isImageFile(filename) {
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
      const extension = filename.split('.').pop().toLowerCase();
      return imageExtensions.includes(extension);
    }

    function isPdfFile(filename) {
      return filename.toLowerCase().endsWith('.pdf');
    }

    function isTextFile(filename) {
      const textExtensions = ['txt', 'csv', 'json', 'xml', 'html', 'css', 'js'];
      const extension = filename.split('.').pop().toLowerCase();
      return textExtensions.includes(extension);
    }

    onMounted(() => {
      userRole.value = getUserRole();
      loadEmployees();
    });

    return {
      files,
      employees,
      selectedEmployeeId,
      selectedEmployee,
      loading,
      uploading,
      uploadProgress,
      error,
      success,
      showUploadModal,
      selectedFile,
      previewFileData,
      previewFileContent,
      imageLoaded,
      fileInput,
      userRole,
      loadFiles,
      loadEmployeeFiles,
      handleFileSelect,
      uploadFile,
      deleteFile,
      previewFile,
      getFilePreviewUrl,
      formatDate,
      getFileType,
      isImageFile,
      isPdfFile,
      isTextFile,
      getSelectedEmployeeName
    };
  }
}
</script>