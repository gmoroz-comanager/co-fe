<template>
  <v-app>
    <v-app-bar v-if="isLoggedIn" app color="primary" dark>
      <v-app-bar-title>
        <div class="d-flex align-center">
          <v-icon class="mr-2">mdi-alpha-c-box</v-icon>
          <span class="font-weight-bold">Flow</span>
        </div>
      </v-app-bar-title>
      
      <v-spacer></v-spacer>
      
      <v-btn to="/" text>
        <v-icon left>mdi-home</v-icon>
        Home
      </v-btn>
      
      <v-btn to="/audio" text>
        <v-icon left>mdi-waveform</v-icon>
        Audio
      </v-btn>
      <v-btn to="/ideas" text>
        <v-icon left>mdi-lightbulb-outline</v-icon>
        Ideas
      </v-btn>
      <v-btn to="/brand-profile" text>
        <v-icon left>mdi-account-star</v-icon>
        Brand Profile
      </v-btn>
      <v-btn to="/contacts" text>
        <v-icon left>mdi-contacts</v-icon>
        Contacts
      </v-btn>
      <v-btn to="/posting/calendar" text>
        <v-icon left>mdi-calendar-clock</v-icon>
        Schedule
      </v-btn>
      <v-btn to="/posting/setup" text>
        <v-icon left>mdi-cog</v-icon>
        Posting Setup
      </v-btn>
      <v-btn @click="logout" text>
        <v-icon left>mdi-logout</v-icon>
        Logout
      </v-btn>
    </v-app-bar>
    
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  computed: {
    isLoggedIn() {
      return this.$store.getters['auth/isLoggedIn']
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('auth/logout')
      this.$router.push('/login')
    }
  }
}
</script>

<style>
:root {
  --app-bar-height: 64px;
}

html, body {
  font-family: 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
  margin: 0;
  padding: 0;
}

.v-application {
  background-color: #F5F7FA !important;
}

.v-main {
  min-height: 100vh;
}
</style>
