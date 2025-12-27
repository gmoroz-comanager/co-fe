<template>
  <v-dialog
    v-model="internalOpen"
    max-width="400"
    :persistent="persistent"
    :z-index="2100"
  >
    <v-card>
      <v-card-title class="text-h6 d-flex align-center">
        <v-icon
          v-if="icon"
          :color="iconColor"
          class="mr-2"
        >{{ icon }}</v-icon>
        {{ title }}
      </v-card-title>
      
      <v-card-text class="text-body-1">
        {{ message }}
      </v-card-text>
      
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          @click="onCancel"
        >
          {{ cancelText }}
        </v-btn>
        <v-btn
          :color="confirmColor"
          variant="flat"
          :loading="loading"
          @click="onConfirm"
        >
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, watch, PropType } from 'vue';

export default defineComponent({
  name: 'ConfirmationDialog',
  
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      default: 'Confirm Action',
    },
    message: {
      type: String,
      default: 'Are you sure you want to proceed?',
    },
    confirmText: {
      type: String,
      default: 'Confirm',
    },
    cancelText: {
      type: String,
      default: 'Cancel',
    },
    confirmColor: {
      type: String,
      default: 'primary',
    },
    icon: {
      type: String as PropType<string | null>,
      default: null,
    },
    iconColor: {
      type: String,
      default: 'warning',
    },
    loading: {
      type: Boolean,
      default: false,
    },
    persistent: {
      type: Boolean,
      default: false,
    },
  },
  
  emits: ['update:modelValue', 'confirm', 'cancel'],
  
  setup(props, { emit }) {
    const internalOpen = ref(props.modelValue);
    
    watch(() => props.modelValue, (val) => {
      internalOpen.value = val;
    });
    
    watch(internalOpen, (val) => {
      emit('update:modelValue', val);
    });
    
    const onConfirm = () => {
      emit('confirm');
    };
    
    const onCancel = () => {
      internalOpen.value = false;
      emit('cancel');
    };
    
    return {
      internalOpen,
      onConfirm,
      onCancel,
    };
  },
});
</script>

