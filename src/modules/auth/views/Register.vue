<template>
  <v-container fluid class="fill-height pa-0">
    <v-row no-gutters class="fill-height">
      <!-- Left side with registration form -->
      <v-col cols="12" md="5" class="register-container">
        <v-container class="register-form-container">
          <div class="logo-container mb-8">
            <v-icon color="primary" size="x-large" class="logo-icon">mdi-alpha-c-box</v-icon>
            <span class="text-primary font-weight-bold text-h6">Flow</span>
          </div>
          
          <h1 class="text-h4 font-weight-bold mb-2">Join CoFlow</h1>
          <h2 class="text-h5 font-weight-medium mb-8">Create your account</h2>
          
          <v-form @submit.prevent="register">
            <v-text-field
              v-model="user.username"
              label="Username"
              variant="outlined"
              :disabled="loading"
              required
              class="mb-4"
            ></v-text-field>
            
            <v-text-field
              v-model="user.email"
              label="Email address"
              variant="outlined"
              :disabled="loading"
              required
              class="mb-4"
            ></v-text-field>
            
            <v-text-field
              v-model="user.linkedinUrl"
              label="LinkedIn URL (Optional)"
              variant="outlined"
              :disabled="loading"
              placeholder="https://www.linkedin.com/in/yourprofile"
              :rules="linkedinRules"
              class="mb-4"
            ></v-text-field>
            
            <v-text-field
              v-model="user.password"
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
              Register
            </v-btn>
            
            <div class="text-center">
              <router-link to="/login" class="text-decoration-none text-primary text-caption">Already have an account? Sign in</router-link>
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
            src="/img/register-illustration.svg"
            max-width="600"
            contain
            class="illustration-content"
          ></v-img>
        </div>
      </v-col>
    </v-row>
    
    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      location="top"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="snackbar.show = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
export default {
  name: 'Register',
  data() {
    return {
      user: {
        username: '',
        email: '',
        linkedinUrl: '',
        password: ''
      },
      loading: false,
      error: null,
      showPassword: false,
      linkedinRules: [
        (v) => !v || v.includes('linkedin.com') || 'Please provide a valid LinkedIn URL'
      ],
      snackbar: {
        show: false,
        message: '',
        color: 'success',
        timeout: 2000
      }
    }
  },
  created() {
    // If already logged in, redirect to home
    if (this.$store.getters['auth/isLoggedIn']) {
      this.$router.push('/')
    }
  },
  methods: {
    showSnackbar(message, color = 'success', timeout = 2000) {
      this.snackbar.message = message
      this.snackbar.color = color
      this.snackbar.timeout = timeout
      this.snackbar.show = true
    },
    
    register() {
      this.loading = true
      this.error = null
      
      this.$store.dispatch('auth/register', this.user)
        .then((response) => {
          // Show success message
          this.showSnackbar(
            response.message || 'Registration successful! Please login.',
            'success',
            3000
          )
          // Redirect to login after short delay
          setTimeout(() => {
            this.$router.push('/login')
          }, 1500)
        })
        .catch(err => {
          console.error(err)
          const errorMessage = err.response?.data?.error?.message || 'Registration failed. This email may already be in use.'
          this.error = errorMessage
          this.showSnackbar(errorMessage, 'error', 2000)
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.register-form-container {
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

.illustration-content {
  opacity: 0.9;
}
</style>
