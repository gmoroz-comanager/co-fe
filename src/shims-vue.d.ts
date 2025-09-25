/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Declares environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    VUE_APP_API_URL: string;
    VUE_APP_PORT: string;
    BASE_URL: string;
  }
}
