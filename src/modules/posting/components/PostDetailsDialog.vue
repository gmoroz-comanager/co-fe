<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="400">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Scheduled Post</span>
        <v-btn icon="mdi-close" variant="text" size="small" @click="$emit('update:modelValue', false)"></v-btn>
      </v-card-title>
      <v-card-text>
        <div class="mb-4">
          <div class="text-caption text-medium-emphasis">Idea</div>
          <div class="text-body-1">{{ event?.title || event?.name || 'Scheduled Post' }}</div>
        </div>
        <div class="mb-4">
          <div class="text-caption text-medium-emphasis">Channel</div>
          <div class="text-body-1 d-flex align-center">
            <v-icon size="small" class="mr-2" color="primary">mdi-telegram</v-icon>
            {{ event?.extendedProps?.channel?.title || 'Unknown Channel' }}
          </div>
        </div>
        <div class="mb-4">
          <div class="text-caption text-medium-emphasis">Scheduled Time</div>
          <div class="text-body-1">
            {{ formattedTime }}
          </div>
        </div>
        <div class="mb-4">
          <div class="text-caption text-medium-emphasis">Status</div>
          <v-chip size="small" :color="statusColor" label class="text-uppercase">
            {{ event?.extendedProps?.status || 'scheduled' }}
          </v-chip>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn 
          color="error" 
          variant="text" 
          :loading="deleting"
          @click="onDelete"
        >
          Delete Post
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType } from 'vue';
import { CalendarEvent } from '../composables/useCalendarEvents';

export default defineComponent({
  name: 'PostDetailsDialog',
  
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    event: {
      type: Object as PropType<CalendarEvent | null>,
      default: null,
    },
    getStatusColor: {
      type: Function as PropType<(status: string | undefined) => string>,
      required: true,
    },
  },
  
  emits: ['update:modelValue', 'delete'],
  
  setup(props, { emit }) {
    const deleting = ref(false);
    
    // Format the event time for display
    const formattedTime = computed(() => {
      const timestamp = props.event?.start;
      if (!timestamp) return 'Not set';
      
      let date: Date;
      if (typeof timestamp === 'number') {
        date = new Date(timestamp);
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
      } else {
        return 'Invalid time';
      }
      
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    });
    
    // Get status color
    const statusColor = computed(() => {
      return props.getStatusColor(props.event?.extendedProps?.status);
    });
    
    // Handle delete
    const onDelete = async () => {
      if (!props.event) return;
      if (!confirm('Are you sure you want to delete this scheduled post?')) return;
      
      deleting.value = true;
      try {
        emit('delete', props.event.id);
      } finally {
        deleting.value = false;
      }
    };
    
    return {
      deleting,
      formattedTime,
      statusColor,
      onDelete,
    };
  },
});
</script>

