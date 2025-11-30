# Руководство по разработке модулей CoFlow Frontend

Этот документ описывает стандарты, структуру и лучшие практики для разработки модулей в проекте CoFlow. Используйте его как эталон при создании новых функций или рефакторинге существующих.

## 1. Структура модуля

Каждый функциональный модуль должен находиться в папке `src/modules/[имя-модуля]` и иметь следующую структуру:

```text
src/modules/example-module/
├── api/                        # API слой
│   ├── index.ts               # Экспорт сервиса
│   └── example.service.ts     # Сервис и типы данных
├── router/                     # Маршрутизация
│   └── index.ts               # Определение маршрутов модуля
├── store/                      # Управление состоянием (Vuex)
│   ├── index.ts               # Экспорт модуля хранилища
│   └── example.store.ts       # Логика хранилища
└── views/                      # UI слой модуля
    ├── components/            # Компоненты, специфичные для модуля
    │   └── ExampleCard.vue    # Переиспользуемый компонент внутри модуля
    └── pages/                 # Страницы (маршрутизируемые компоненты)
        ├── ExampleList.vue    # Списковое представление
        └── ExampleDetail.vue  # Детальное представление
```

## 2. API слой (`api/`)

Мы используем Strapi v5, что накладывает определенные требования на структуру данных.

### Основные правила:
1. **Используйте `httpService`**: Импортируйте его из `@/core/api`. Не создавайте новые экземпляры Axios.
2. **Типизация Strapi v5**: Ответы Strapi v5 **не содержат** обертку `attributes`. Поля находятся на верхнем уровне объекта `data`.
3. **Синглтон**: Экспортируйте экземпляр класса сервиса.

### Пример `api/example.service.ts`:

```typescript
import { httpService } from '@/core/api';

// Интерфейс данных (Strapi v5 - без attributes!)
export interface Example {
  id: number;
  documentId: string;
  title: string;
  description?: string;
  createdAt: string;
  // Отношения (возвращаются как объекты/массивы)
  owner?: {
    id: number;
    username: string;
  };
}

export interface ExampleResponse {
  data: Example;
}

export interface ExampleListResponse {
  data: Example[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    }
  }
}

class ExampleService {
  /**
   * Получение списка с фильтрацией и пагинацией
   */
  async getExamples(params: any = {}): Promise<ExampleListResponse> {
    // Формирование query параметров для Strapi
    const queryParams = new URLSearchParams();
    
    // Всегда запрашиваем необходимые связи
    queryParams.append('populate', '*'); 
    
    // Пагинация
    if (params.page) queryParams.append('pagination[page]', params.page.toString());
    
    // Сортировка
    queryParams.append('sort', params.sort || 'createdAt:desc');

    const response = await httpService.get<ExampleListResponse>(`/examples?${queryParams.toString()}`);
    return response.data;
  }

  async getExample(id: string | number): Promise<ExampleResponse> {
    const response = await httpService.get<ExampleResponse>(`/examples/${id}?populate=*`);
    return response.data;
  }

  async createExample(data: Partial<Example>): Promise<ExampleResponse> {
    const response = await httpService.post<ExampleResponse>('/examples', { data });
    return response.data;
  }
}

export const exampleService = new ExampleService();
```

## 3. Хранилище (`store/`)

Используйте модульный подход Vuex. Модуль должен быть `namespaced: true`.

### Стандартный шаблон `store/example.store.ts`:

```typescript
import { Module } from 'vuex';
import { exampleService, Example } from '../api/example.service';

export interface ExampleState {
  items: Example[];
  currentItem: Example | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    total: number;
  };
}

const exampleModule: Module<ExampleState, any> = {
  namespaced: true,

  state: () => ({
    items: [],
    currentItem: null,
    loading: false,
    error: null,
    pagination: { page: 1, total: 0 }
  }),

  getters: {
    allItems: (state) => state.items,
    isLoading: (state) => state.loading
  },

  mutations: {
    SET_ITEMS(state, items) { state.items = items; },
    SET_LOADING(state, status) { state.loading = status; },
    SET_ERROR(state, error) { state.error = error; }
  },

  actions: {
    async fetchItems({ commit }, params) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        const response = await exampleService.getExamples(params);
        commit('SET_ITEMS', response.data);
        return response;
      } catch (error: any) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    }
  }
};

export default exampleModule;
```

## 4. Маршрутизация (`router/`)

Определяйте маршруты в файле `router/index.ts` и экспортируйте их как массив `RouteRecordRaw`.

```typescript
import { RouteRecordRaw } from 'vue-router';
import ExampleList from '../views/pages/ExampleList.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/examples',
    name: 'ExampleList',
    component: ExampleList,
    meta: { requiresAuth: true }
  },
  {
    path: '/examples/:id',
    name: 'ExampleDetail',
    component: () => import('../views/pages/ExampleDetail.vue'), // Lazy loading
    meta: { requiresAuth: true }
  }
];

export default routes;
```

## 5. Представления (`views/`)

Папка `views` разделена на две подпапки для лучшей организации:

1.  `pages/`: Содержит компоненты, которые являются полноценными страницами и подключены к роутеру.
2.  `components/`: Содержит компоненты, которые используются только внутри этого модуля (например, карточка элемента, специфичная форма).

> **Важно**: Если компонент может быть использован в *других* модулях, он должен находиться в `src/core/components`.

Используйте **Composition API** (`setup()` или `<script setup lang="ts">`) и компоненты **Vuetify**.

### Лучшие практики для Pages:
1. **Доступ к Store**: Используйте `useStore` и `computed` для получения данных.
2. **Dispatch Actions**: Вызывайте действия store для загрузки данных (`store.dispatch('example/fetchItems')`).
3. **Изоляция**: Страницы собирают данные и передают их в "глупые" (dumb) компоненты из папки `components/`.

### Пример `views/pages/ExampleList.vue`:

```vue
<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 class="text-h3">Examples</h1>
      </v-col>
    </v-row>

    <!-- Loading -->
    <v-row v-if="loading">
      <v-progress-circular indeterminate></v-progress-circular>
    </v-row>

    <!-- Error -->
    <v-row v-else-if="error">
      <v-alert type="error">{{ error }}</v-alert>
    </v-row>

    <!-- Data -->
    <v-row v-else>
      <v-col v-for="item in items" :key="item.id" cols="12" md="4">
        <v-card :to="{ name: 'ExampleDetail', params: { id: item.documentId }}">
          <v-card-title>{{ item.title }}</v-card-title>
          <v-card-text>{{ item.description }}</v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'ExampleList',
  setup() {
    const store = useStore();

    const items = computed(() => store.getters['example/allItems']);
    const loading = computed(() => store.getters['example/isLoading']);
    const error = computed(() => store.state.example.error);

    onMounted(() => {
      store.dispatch('example/fetchItems');
    });

    return { items, loading, error };
  }
});
</script>
```

## Регистрация нового модуля

После создания файлов модуля, не забудьте зарегистрировать его в ядре:

1. **Router**: Добавьте маршруты в `src/core/router/index.ts`.
2. **Store**: Добавьте модуль в `src/core/store/index.ts`.

