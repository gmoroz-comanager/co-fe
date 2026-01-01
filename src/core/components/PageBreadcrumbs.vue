<template>
  <nav class="page-breadcrumbs">
    <template v-for="(item, index) in items" :key="index">
      <!-- Clickable item (with route) -->
      <v-btn
        v-if="item.to && !item.disabled"
        variant="text"
        size="small"
        :prepend-icon="item.icon"
        @click="navigate(item.to)"
      >
        {{ item.title }}
      </v-btn>

      <!-- Non-clickable item (disabled or no route) -->
      <span
        v-else
        class="breadcrumb-item"
        :class="{ 'current-page': index === items.length - 1 }"
      >
        <v-icon v-if="item.icon" :icon="item.icon" size="small" class="mr-1" />
        {{ item.title }}
      </span>

      <!-- Divider (not after the last item) -->
      <v-icon
        v-if="index < items.length - 1"
        size="small"
        class="mx-1"
      >
        mdi-chevron-right
      </v-icon>
    </template>
  </nav>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useRouter } from 'vue-router';
import type { BreadcrumbItem } from './types';

export default defineComponent({
  name: 'PageBreadcrumbs',

  props: {
    items: {
      type: Array as PropType<BreadcrumbItem[]>,
      required: true,
      default: () => [],
    },
  },

  setup() {
    const router = useRouter();

    const navigate = (to: string) => {
      router.push(to);
    };

    return {
      navigate,
    };
  },
});
</script>

<style scoped>
.page-breadcrumbs {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  font-size: 14px;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  color: #666;
}

.current-page {
  font-weight: 500;
}
</style>

