# Руководство по работе с TypeScript в проекте

## Текущее состояние проекта

На данный момент мы настроили базовую конфигурацию проекта, которая позволяет:
1. Запускать проект в режиме разработки
2. Использовать TypeScript файлы в проекте
3. Интегрировать TypeScript и Vue компоненты

Однако, для полноценной миграции на TypeScript потребуется постепенный переход.

## План миграции на TypeScript

### 1. Правила именования файлов

- JavaScript файлы: `.js`
- TypeScript файлы: `.ts`
- Vue компоненты с JavaScript: `.vue`
- Vue компоненты с TypeScript: `.vue` (используйте внутри `<script lang="ts">`)

### 2. Последовательность действий для преобразования файлов

1. **Начните с хранилища Vuex**:
   - Файл `/src/store/index.ts` уже преобразован в TypeScript
   - Пример использования типов для state, actions и mutations

2. **Переход компонентов на Composition API**:
   ```vue
   <script setup lang="ts">
   // Импорты
   import { ref, reactive, computed, onMounted } from 'vue'
   
   // Типы
   interface User {
     id: number
     name: string
   }
   
   // Реактивные переменные
   const count = ref<number>(0)
   const user = reactive<User>({ id: 1, name: 'User' })
   
   // Вычисляемые свойства
   const doubleCount = computed(() => count.value * 2)
   
   // Методы
   function increment() {
     count.value++
   }
   
   // Хуки жизненного цикла
   onMounted(() => {
     console.log('Компонент смонтирован')
   })
   </script>
   ```

3. **Преобразование роутера**:
   - Файл `/src/router/index.ts` уже преобразован
   - Используйте его как пример для типизации маршрутов

### 3. Пошаговая стратегия для перехода

1. **Переходите от простых файлов к сложным**
   - Сначала типизируйте файлы без зависимостей
   - Затем файлы с меньшим количеством зависимостей
   - И только затем сложные компоненты

2. **Используйте постепенный подход**
   - Не пытайтесь перевести все файлы сразу
   - Внедряйте типы постепенно, не нарушая работающую функциональность

3. **Начните с хорошо определенных интерфейсов**
   - Типизируйте API запросы и ответы
   - Определите модели данных
   - Типизируйте пропсы и события компонентов

### 4. Решение распространенных проблем

1. **Ошибка: Can't resolve module**
   - Убедитесь, что пути импорта указаны правильно
   - Проверьте расширение файла (.ts вместо .js)

2. **Ошибка: Property does not exist on type**
   - Используйте интерфейсы для определения формы объектов
   - Используйте типы для уточнения формы props и state

3. **Ошибка при импорте .vue файлов**
   - Убедитесь, что shims-vue.d.ts присутствует и настроен правильно

## Рекомендации по работе с TypeScript и Vue

### 1. Используйте Composition API

```vue
<script setup lang="ts">
// Вместо Options API
</script>
```

### 2. Типизируйте пропсы компонентов

```vue
<script setup lang="ts">
// Определение пропсов с типами
const props = defineProps<{
  title: string
  count?: number // Необязательное поле
}>()
</script>
```

### 3. Типизируйте события

```vue
<script setup lang="ts">
// Определение событий с типами
const emit = defineEmits<{
  (e: 'update', value: string): void
  (e: 'delete', id: number): void
}>()
</script>
```

### 4. Используйте типы для Vuex

```typescript
// В хранилище
interface State {
  count: number
}

// В компоненте
import { useStore } from 'vuex'
import { State } from '@/store/types'

const store = useStore<State>()
```

### 5. Асинхронные операции

```typescript
async function fetchData(): Promise<User[]> {
  try {
    const response = await api.getUsers()
    return response.data
  } catch (error) {
    console.error(error)
    return []
  }
}
```

## Заключение

Перенос проекта на TypeScript предоставляет множество преимуществ в виде улучшенной поддержки IDE, раннего обнаружения ошибок и более чистой кодовой базы. Используйте это руководство как отправную точку для постепенной миграции.

Если у вас возникнут вопросы, обратитесь к официальной документации:
- [Vue 3 с TypeScript](https://vuejs.org/guide/typescript/overview.html)
- [Vuex с TypeScript](https://vuex.vuejs.org/guide/typescript-support.html)
- [Vue Router с TypeScript](https://router.vuejs.org/guide/advanced/typescript.html)
