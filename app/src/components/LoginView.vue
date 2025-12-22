<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const login = ref('admin');
const password = ref('admin123');
const error = ref('');

async function handleLogin() {
  try {
    console.log('Отправляем запрос на логин...');

    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        login: login.value,
        password: password.value
      })
    });

    const data = await response.json();
    console.log('Полный ответ от сервера:', data);

    if (response.ok) {

      localStorage.setItem('authToken', data.access_token);
      console.log('Токен сохранён');


      if (data.user) {
        localStorage.setItem('userData', JSON.stringify({
          id: data.user.id || data.user.id_user,
          login: data.user.login,
          name: data.user.name,
          role: data.user.role,
          second_name: data.user.second_name || ''
        }));
        console.log('Данные пользователя с ролью сохранены:', data.user);
      } else {
        console.error('В ответе нет данных пользователя!');
        try {
          const tokenParts = data.access_token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            localStorage.setItem('userData', JSON.stringify({
              id: payload.sub,
              login: payload.login,
              role: payload.role || 'user'
            }));
            console.log('Данные из токена:', payload);
          }
        } catch (e) {
          console.error('Не удалось декодировать токен:', e);
        }
      }

      console.log('Токен в localStorage:', localStorage.getItem('authToken'));
      console.log('userData в localStorage:', localStorage.getItem('userData'));

      router.push('/dashboard');

    } else {
      error.value = data.message || 'Ошибка входа';
    }
  } catch (err) {
    console.error('Полная ошибка:', err);
    error.value = 'Ошибка сети: ' + err.message;
  }
}
</script>

<template>
  <div style="max-width: 400px; margin: 100px auto; padding: 30px; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="text-align: center; margin-bottom: 30px;">Вход в систему</h2>

    <div v-if="error"
         style="background: #ffebee; color: #c62828; padding: 10px; margin-bottom: 15px; border-radius: 4px;">
      {{ error }}
    </div>

    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 5px;">Логин:</label>
      <input v-model="login" style="width: 100%; padding: 10px; box-sizing: border-box; border: 1px solid #ddd;">
    </div>

    <div style="margin-bottom: 25px;">
      <label style="display: block; margin-bottom: 5px;">Пароль:</label>
      <input v-model="password" type="password"
             style="width: 100%; padding: 10px; box-sizing: border-box; border: 1px solid #ddd;">
    </div>

    <button @click="handleLogin"
            style="width: 100%; padding: 12px; background: #2196f3; color: white; border: none; cursor: pointer;">
      Войти
    </button>

    <div style="margin-top: 20px; color: #666; font-size: 14px; text-align: center;">
      <p>Для теста администратора используйте:</p>
      <p>Логин: admin</p>
      <p>Пароль: admin123</p>
      <p>Для теста менеджера используйте</p>
      <p>Логин: 1234 </p>
      <p>Пароль: 1234 </p>
    </div>
  </div>
</template>