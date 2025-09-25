<template>
  <div class="register">
    <h1>Регистрация</h1>
    <form @submit.prevent="register">
      <div class="form-group">
        <label for="username">Имя пользователя:</label>
        <input 
          type="text" 
          id="username" 
          v-model="user.username" 
          required
          class="form-control"
        />
      </div>
      
      <div class="form-group">
        <label for="email">Email:</label>
        <input 
          type="email" 
          id="email" 
          v-model="user.email" 
          required
          class="form-control"
        />
      </div>
      
      <div class="form-group">
        <label for="password">Пароль:</label>
        <input 
          type="password" 
          id="password" 
          v-model="user.password" 
          required
          class="form-control"
        />
      </div>
      
      <div class="form-group">
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Загрузка...' : 'Зарегистрироваться' }}
        </button>
      </div>
      
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>
      
      <div>
        <p>Уже есть учетная запись? <router-link to="/login">Войдите</router-link></p>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'Register',
  data() {
    return {
      user: {
        username: '',
        email: '',
        password: ''
      },
      loading: false,
      error: null
    }
  },
  created() {
    // If already logged in, redirect to home
    if (this.$store.getters.isLoggedIn) {
      this.$router.push('/')
    }
  },
  methods: {
    register() {
      this.loading = true
      this.error = null
      
      this.$store.dispatch('register', this.user)
        .then(() => {
          this.$router.push('/')
        })
        .catch(err => {
          console.error(err)
          this.error = 'Ошибка регистрации. Возможно, email уже используется.'
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style scoped>
.register {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-control {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #ddd;
  border-radius: 4px;
}

label {
  display: block;
  margin-bottom: 5px;
}

.btn {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background-color: #42b983;
  color: white;
}

.btn-primary:disabled {
  background-color: #95d5b7;
}

.alert {
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>
