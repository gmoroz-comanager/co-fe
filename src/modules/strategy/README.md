# Strategy Module

Модуль для управления стратегиями контента в приложении CoFlow.

## Структура модуля

```
src/modules/strategy/
├── api/
│   ├── strategy.service.ts    # API сервис для работы с content-strategy
│   └── index.ts              # Экспорт API
├── router/
│   └── index.ts              # Роуты модуля
├── store/
│   ├── strategy.store.ts     # Vuex store модуль
│   └── index.ts              # Экспорт store
└── views/
    ├── StrategyCreate.vue     # Основной компонент создания стратегии
    ├── StrategyCreateStep1.vue # Шаг 1: Основная информация
    ├── StrategyCreateStep2.vue # Шаг 2: Тон и стиль
    ├── StrategyCreateStep3.vue # Шаг 3: Лексика и ценности
    ├── StrategyCreateStep4.vue # Шаг 4: Настройки и цели
    ├── StrategiesList.vue     # Список стратегий
    └── StrategyDetail.vue    # Детальный просмотр стратегии
```

## Функциональность

### 4-шаговое создание стратегии

1. **Шаг 1: Основная информация**
   - Название стратегии
   - Тип персоны (эксперт, наставник, друг, учитель, вдохновитель)
   - Целевая аудитория
   - Языки контента

2. **Шаг 2: Тон и стиль**
   - Тип тона (спокойный/агрессивный)
   - Уровень формальности (неформальный/профессиональный/юмористический)
   - Длина предложений (короткие/средние/длинные)
   - Количество юмора (0-10)

3. **Шаг 3: Лексика и ценности**
   - Предпочитаемые слова и выражения
   - Слова и выражения, которых следует избегать
   - Основные ценности бренда
   - Темы, которых следует избегать

4. **Шаг 4: Настройки и цели**
   - Целевое количество постов в месяц
   - Социальные сети и каналы
   - Форматы призывов к действию
   - Основные цели стратегии
   - Примеры контента от пользователей
   - Дополнительные настройки (эмодзи, вопросы аудитории, сленг)

### Управление стратегиями

- **Список стратегий** с фильтрацией и поиском
- **Детальный просмотр** стратегии
- **Публикация/снятие с публикации** стратегий
- **Удаление** стратегий
- **Статистика** по стратегиям

## API

### ContentStrategyService

Основные методы:
- `getStrategies(filters)` - получение списка стратегий с фильтрами
- `getStrategy(id)` - получение стратегии по ID
- `createStrategy(data)` - создание новой стратегии
- `updateStrategy(id, data)` - обновление стратегии
- `deleteStrategy(id)` - удаление стратегии
- `publishStrategy(id)` - публикация стратегии
- `unpublishStrategy(id)` - снятие с публикации
- `countStrategies()` - подсчет статистики

## Store

### State
- `strategies` - массив стратегий
- `currentStrategy` - текущая стратегия
- `totalStrategies` - общее количество стратегий
- `publishedStrategies` - количество опубликованных стратегий
- `draftStrategies` - количество черновиков
- `loading` - состояние загрузки
- `error` - ошибки
- `filters` - фильтры для списка
- `pagination` - пагинация
- `creationData` - данные для создания стратегии
- `currentStep` - текущий шаг создания

### Actions
- `fetchStrategies()` - загрузка списка стратегий
- `fetchStrategy(id)` - загрузка стратегии по ID
- `createStrategy(data)` - создание стратегии
- `updateStrategy({id, data})` - обновление стратегии
- `deleteStrategy(id)` - удаление стратегии
- `publishStrategy(id)` - публикация стратегии
- `unpublishStrategy(id)` - снятие с публикации
- `updateFilters(filters)` - обновление фильтров
- `resetFilters()` - сброс фильтров
- `updateCreationData(data)` - обновление данных создания
- `setCurrentStep(step)` - установка текущего шага
- `resetCreationProcess()` - сброс процесса создания
- `saveStrategyFromCreationData()` - сохранение стратегии из данных создания

## Роуты

- `/strategies` - список стратегий
- `/strategies/:id` - детальный просмотр стратегии
- `/strategies/create` - создание стратегии (основной компонент)
- `/strategies/create/step1` - шаг 1 создания
- `/strategies/create/step2` - шаг 2 создания
- `/strategies/create/step3` - шаг 3 создания
- `/strategies/create/step4` - шаг 4 создания

## Интеграция

Модуль автоматически интегрирован в основное приложение:
- Роуты добавлены в основной роутер
- Store модуль зарегистрирован в основном store
- Все компоненты используют единую систему аутентификации

## Использование

```vue
<template>
  <div>
    <!-- Список стратегий -->
    <router-link to="/strategies">Стратегии</router-link>
    
    <!-- Создание стратегии -->
    <router-link to="/strategies/create">Создать стратегию</router-link>
  </div>
</template>

<script setup>
import { useStore } from 'vuex';

const store = useStore();

// Загрузка стратегий
store.dispatch('strategy/fetchStrategies');

// Получение данных
const strategies = computed(() => store.getters['strategy/allStrategies']);
const isLoading = computed(() => store.getters['strategy/isLoading']);
</script>
```

