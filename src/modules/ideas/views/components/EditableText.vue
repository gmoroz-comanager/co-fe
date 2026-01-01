<template>
  <div class="editable-text" :class="{ 'is-editing': isEditing }">
    <!-- View Mode -->
    <div v-if="!isEditing" class="view-mode">
      <slot name="display">
        <component
          :is="displayTag"
          :class="displayClass"
        >
          {{ modelValue || placeholder }}
        </component>
      </slot>
      <v-btn
        icon
        variant="text"
        size="small"
        color="grey"
        class="edit-btn"
        @click="startEditing"
      >
        <v-icon size="18">mdi-pencil</v-icon>
      </v-btn>
    </div>

    <!-- Edit Mode -->
    <div v-else class="edit-mode">
      <v-textarea
        v-if="multiline"
        v-model="editValue"
        :label="label"
        :placeholder="placeholder"
        :rows="rows"
        :auto-grow="autoGrow"
        variant="outlined"
        density="comfortable"
        hide-details
        autofocus
        class="edit-input"
        @keydown.esc="cancelEditing"
      />
      <v-text-field
        v-else
        v-model="editValue"
        :label="label"
        :placeholder="placeholder"
        variant="outlined"
        density="comfortable"
        hide-details
        autofocus
        class="edit-input"
        @keydown.enter="saveChanges"
        @keydown.esc="cancelEditing"
      />
      
      <div class="edit-actions">
        <v-btn
          icon
          variant="flat"
          size="small"
          color="success"
          :loading="saving"
          @click="saveChanges"
        >
          <v-icon>mdi-check</v-icon>
        </v-btn>
        <v-btn
          icon
          variant="flat"
          size="small"
          color="error"
          :disabled="saving"
          @click="attemptCancel"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <ConfirmationDialog
      v-model="showConfirmDialog"
      title="Discard Changes?"
      message="This is a draft. Are you sure you want to cancel? Your changes will be lost."
      confirm-text="Discard"
      cancel-text="Keep Editing"
      confirm-color="error"
      icon="mdi-alert"
      icon-color="warning"
      @confirm="confirmCancel"
      @cancel="showConfirmDialog = false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, PropType } from 'vue';
import { ConfirmationDialog } from '@/core/components';

export default defineComponent({
  name: 'EditableText',

  components: {
    ConfirmationDialog,
  },

  props: {
    modelValue: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: 'Enter text...',
    },
    multiline: {
      type: Boolean,
      default: false,
    },
    rows: {
      type: Number,
      default: 3,
    },
    autoGrow: {
      type: Boolean,
      default: true,
    },
    displayTag: {
      type: String as PropType<'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div'>,
      default: 'p',
    },
    displayClass: {
      type: String,
      default: '',
    },
    saving: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:modelValue', 'save', 'cancel'],

  setup(props, { emit }) {
    const isEditing = ref(false);
    const editValue = ref(props.modelValue);
    const showConfirmDialog = ref(false);

    // Sync editValue when modelValue changes externally
    watch(() => props.modelValue, (newVal) => {
      if (!isEditing.value) {
        editValue.value = newVal;
      }
    });

    const startEditing = () => {
      editValue.value = props.modelValue;
      isEditing.value = true;
    };

    const saveChanges = () => {
      if (editValue.value !== props.modelValue) {
        emit('update:modelValue', editValue.value);
        emit('save', editValue.value);
      }
      isEditing.value = false;
    };

    const attemptCancel = () => {
      if (editValue.value !== props.modelValue) {
        showConfirmDialog.value = true;
      } else {
        cancelEditing();
      }
    };

    const cancelEditing = () => {
      editValue.value = props.modelValue;
      isEditing.value = false;
      emit('cancel');
    };

    const confirmCancel = () => {
      showConfirmDialog.value = false;
      cancelEditing();
    };

    // Close editing when save completes
    watch(() => props.saving, (newVal, oldVal) => {
      if (oldVal && !newVal) {
        isEditing.value = false;
      }
    });

    return {
      isEditing,
      editValue,
      showConfirmDialog,
      startEditing,
      saveChanges,
      attemptCancel,
      cancelEditing,
      confirmCancel,
    };
  },
});
</script>

<style scoped>
.editable-text {
  position: relative;
}

.view-mode {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.view-mode .edit-btn {
  opacity: 0;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
}

.editable-text:hover .edit-btn {
  opacity: 1;
}

.edit-mode {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.edit-input {
  flex: 1;
}

.edit-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>

