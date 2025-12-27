<template>
  <v-toolbar density="compact" color="surface" class="border-b px-2" flat>
    <v-btn-group density="compact" variant="outlined" class="mr-4">
      <v-btn size="small" @click="navigate('prev')">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <v-btn size="small" @click="navigate('today')">Today</v-btn>
      <v-btn size="small" @click="navigate('next')">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </v-btn-group>

    <div class="text-subtitle-1 font-weight-bold mr-4">
      {{ periodLabel }}
    </div>

    <v-spacer></v-spacer>

    <v-btn-toggle
      :model-value="viewMode"
      @update:model-value="$emit('update:viewMode', $event)"
      density="compact"
      mandatory
      variant="outlined"
      color="primary"
    >
      <v-btn value="day" size="small">Day</v-btn>
      <v-btn value="week" size="small">Week</v-btn>
      <v-btn value="month" size="small">Month</v-btn>
    </v-btn-toggle>
  </v-toolbar>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';

export default defineComponent({
  name: 'CalendarToolbar',
  
  props: {
    viewMode: {
      type: String as PropType<'month' | 'week' | 'day'>,
      required: true,
    },
    focus: {
      type: Date,
      required: true,
    },
  },
  
  emits: ['update:viewMode', 'update:focus', 'navigate'],
  
  setup(props, { emit }) {
    // Computed period label based on view mode
    const periodLabel = computed(() => {
      if (!props.focus) return '';
      const d = new Date(props.focus);
      if (isNaN(d.getTime())) return '';
      
      if (props.viewMode === 'month') {
        return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      }
      if (props.viewMode === 'day') {
        return d.toLocaleDateString(undefined, { dateStyle: 'full' });
      }
      return `Week of ${d.toLocaleDateString()}`;
    });
    
    // Navigate to prev/next/today
    const navigate = (action: 'prev' | 'next' | 'today') => {
      let d = props.focus ? new Date(props.focus) : new Date();
      
      if (action === 'today') {
        emit('update:focus', new Date());
      } else if (action === 'prev') {
        if (props.viewMode === 'week') d.setDate(d.getDate() - 7);
        else if (props.viewMode === 'day') d.setDate(d.getDate() - 1);
        else if (props.viewMode === 'month') d.setMonth(d.getMonth() - 1);
        emit('update:focus', d);
      } else if (action === 'next') {
        if (props.viewMode === 'week') d.setDate(d.getDate() + 7);
        else if (props.viewMode === 'day') d.setDate(d.getDate() + 1);
        else if (props.viewMode === 'month') d.setMonth(d.getMonth() + 1);
        emit('update:focus', d);
      }
      
      emit('navigate', action);
    };
    
    return {
      periodLabel,
      navigate,
    };
  },
});
</script>

