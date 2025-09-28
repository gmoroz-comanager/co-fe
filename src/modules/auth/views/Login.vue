<template>
  <v-container fluid class="fill-height pa-0">
    <v-row no-gutters class="fill-height">
      <!-- Left side with login form -->
      <v-col cols="12" md="5" class="login-container">
        <v-container class="login-form-container">
          <div class="logo-container mb-8">
            <v-icon color="primary" size="x-large" class="logo-icon">mdi-alpha-c-box</v-icon>
            <span class="text-primary font-weight-bold text-h6">Flow</span>
          </div>
          
          <h1 class="text-h4 font-weight-bold mb-2">Welcome to CoFlow</h1>
          <h2 class="text-h5 font-weight-medium mb-8">Sign into your account</h2>
          
          <v-form @submit.prevent="login">
            <v-text-field
              v-model="credentials.email"
              label="Phone or Email address"
              variant="outlined"
              :disabled="loading"
              required
              class="mb-4"
            ></v-text-field>
            
            <v-text-field
              v-model="credentials.password"
              label="Password"
              variant="outlined"
              :disabled="loading"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              :type="showPassword ? 'text' : 'password'"
              required
              class="mb-6"
            ></v-text-field>
            
            <v-btn
              block
              color="primary"
              size="large"
              type="submit"
              :loading="loading"
              class="mb-4"
            >
              Log In
            </v-btn>
            
            <div class="text-center">
              <router-link to="/register" class="text-decoration-none text-primary text-caption">Don't have an account? Register</router-link>
            </div>
            
            <v-alert
              v-if="error"
              type="error"
              class="mt-4"
              variant="tonal"
              density="compact"
            >
              {{ error }}
            </v-alert>
          </v-form>
        </v-container>
      </v-col>
      
      <!-- Right side with illustration -->
      <v-col cols="12" md="7" class="d-none d-md-flex illustration-container bg-primary">
        <div class="fill-height d-flex align-center justify-center">
          <v-img
            src="/img/login-illustration.svg"
            max-width="600"
            contain
            class="illustration-content"
          ></v-img>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      credentials: {
        email: '',
        password: ''
      },
      loading: false,
      error: null,
      showPassword: false
    }
  },
  created() {
    // If already logged in, redirect to home
    if (this.$store.getters['auth/isLoggedIn']) {
      this.$router.push('/')
    }
  },
  methods: {
    login() {
      this.loading = true
      this.error = null
      
      this.$store.dispatch('auth/login', this.credentials)
        .then(() => {
          this.$router.push('/')
        })
        .catch(err => {
          console.error(err)
          this.error = 'Invalid credentials. Please check your email and password.'
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-form-container {
  max-width: 400px;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo-icon {
  margin-right: 4px;
}

.illustration-container {
  position: relative;
  height: 100%;
}

.illustration {
  height: 100%;
}


.illustration-content {
  opacity: 0.9;
}
</style>
