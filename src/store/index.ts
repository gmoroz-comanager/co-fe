import { createStore } from 'vuex'
import axios from 'axios'

const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:1337/api'

// Настройка глобального перехватчика для добавления токена авторизации
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Define types
interface User {
  id: number;
  username: string;
  email: string;
  [key: string]: any;
}

interface AudioSourceAttributes {
  title: string;
  transcription?: string;
  ideas?: string;
  audio_file?: {
    data: Array<{
      id: number;
      attributes: {
        name: string;
        url: string;
        mime: string;
        size: number;
      }
    }>
  }
}

interface AudioSource {
  id: number;
  documentId: string; // Добавлен documentId
  attributes: AudioSourceAttributes;
}

interface State {
  token: string;
  user: User | Record<string, never>;
  audioSources: AudioSource[];
}

export default createStore<State>({
  state: {
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user') || '{}'),
    audioSources: []
  },
  getters: {
    isLoggedIn: (state): boolean => !!state.token,
    currentUser: (state): User | Record<string, never> => state.user,
    audioSources: (state): AudioSource[] => state.audioSources
  },
  mutations: {
    auth_success(state, { token, user }: { token: string; user: User }) {
      state.token = token
      state.user = user
    },
    logout(state) {
      state.token = ''
      state.user = {}
    },
    set_audio_sources(state, audioSources: AudioSource[]) {
      state.audioSources = audioSources
    }
  },
  actions: {
    login({ commit }, credentials: { email: string; password: string }) {
      return new Promise<any>((resolve, reject) => {
        axios.post(`${API_URL}/auth/local`, {
          identifier: credentials.email,
          password: credentials.password
        })
        .then(response => {
          const token = response.data.jwt
          const user = response.data.user
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(user))
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          commit('auth_success', { token, user })
          resolve(response)
        })
        .catch(error => {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          reject(error)
        })
      })
    },
    register({ commit }, user: { username: string; email: string; password: string }) {
      return new Promise<any>((resolve, reject) => {
        axios.post(`${API_URL}/auth/local/register`, {
          username: user.username,
          email: user.email,
          password: user.password
        })
        .then(response => {
          const token = response.data.jwt
          const user = response.data.user
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(user))
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          commit('auth_success', { token, user })
          resolve(response)
        })
        .catch(error => {
          reject(error)
        })
      })
    },
    logout({ commit }) {
      return new Promise<void>((resolve) => {
        commit('logout')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        delete axios.defaults.headers.common['Authorization']
        resolve()
      })
    },
    fetchAudioSources({ commit }) {
      return new Promise<any>((resolve, reject) => {
        // Get the authorization token
        const token = localStorage.getItem('token');
        
        axios.get(`${API_URL}/audio-sources?populate=*&sort=id:desc`, {
          headers: {
            
            'Authorization': `Bearer ${token}`
          }
        })
          .then(response => {
            // Используем данные прямо из ответа, без обработки attributes
            commit('set_audio_sources', response.data.data)
            resolve(response)
          })
          .catch(error => reject(error))
      })
    },
    createAudioSource({ dispatch }, payload: { formData?: FormData; data?: any }) {
      return new Promise<any>((resolve, reject) => {
        // Get the authorization token
        const token = localStorage.getItem('token');
        
        let request;
        
        if (payload.formData) {
          // Если передан FormData (для файлов)
          request = axios.post(`${API_URL}/audio-sources`, payload.formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`
            }
          });
        } else if (payload.data) {
          // Если передан обычный JSON объект
          request = axios.post(`${API_URL}/audio-sources`, payload.data, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
        } else {
          reject(new Error('Не указаны данные для создания записи'));
          return;
        }
        
        request.then(response => {
          // Refresh audio sources list
          dispatch('fetchAudioSources')
          resolve(response)
        })
        .catch(error => reject(error))
      })
    },
    
    // Обновлено: используем documentId вместо id
    deleteAudioSource({ dispatch }, documentId: string) {
      return new Promise<any>((resolve, reject) => {
        // Get the authorization token
        const token = localStorage.getItem('token');
        
        axios.delete(`${API_URL}/audio-sources/${documentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        .then(response => {
          // Refresh audio sources list
          dispatch('fetchAudioSources')
          resolve(response)
        })
        .catch(error => reject(error))
      })
    },
    
    // Новый метод для транскрибирования с использованием documentId
    transcribeAudioSource({ dispatch }, documentId: string) {
      return new Promise<any>((resolve, reject) => {
        // Get the authorization token
        const token = localStorage.getItem('token');
        
        axios.post(`${API_URL}/audio-sources/${documentId}/transcribe`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          // Refresh audio sources list
          dispatch('fetchAudioSources')
          resolve(response)
        })
        .catch(error => reject(error))
      })
    }
  }
})