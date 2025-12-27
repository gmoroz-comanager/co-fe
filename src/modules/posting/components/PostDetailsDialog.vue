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
          @click="showDeleteConfirm = true"
        >
          Delete Post
        </v-btn>
      </v-card-actions>
    </v-card>
    
    <!-- Delete Confirmation Dialog -->
    <ConfirmationDialog
      v-model="showDeleteConfirm"
      title="Delete Scheduled Post"
      message="Are you sure you want to delete this scheduled post? This action cannot be undone."
      confirm-text="Delete"
      confirm-color="error"
      icon="mdi-delete-alert"
      icon-color="error"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType } from 'vue';
import { CalendarEvent } from '../composables/useCalendarEvents';
import { ConfirmationDialog } from '@/core/components';

export default defineComponent({
  name: 'PostDetailsDialog',
  
  components: {
    ConfirmationDialog,
  },
  
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
    const showDeleteConfirm = ref(false);
    
    // Format the event time for display
    const formattedTime = computed(() => {
      const timestamp = props.event?.start;
      if (!timestamp) return 'Not set';
      
      const date = new Date(timestamp);
      
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
    
    // Handle delete confirmation
    const confirmDelete = async () => {
      if (!props.event) return;
      
      deleting.value = true;
      try {
        emit('delete', props.event.id);
        showDeleteConfirm.value = false;
      } finally {
        deleting.value = false;
      }
    };
    
    return {
      deleting,
      showDeleteConfirm,
      formattedTime,
      statusColor,
      confirmDelete,
    };
  },
});
</script>

