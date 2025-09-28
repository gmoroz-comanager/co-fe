<template>
  <v-btn
    :color="color"
    :variant="variant"
    :size="size"
    :disabled="disabled || loading"
    :loading="loading"
    :block="block"
    :rounded="rounded"
    :prepend-icon="prependIcon"
    :append-icon="appendIcon"
    :class="classes"
    @click="onClick"
  >
    <slot></slot>
  </v-btn>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

/**
 * BaseButton component - A standardized button component that extends Vuetify's v-btn
 * with consistent styling and behavior across the application.
 */
export default defineComponent({
  name: 'BaseButton',
  
  props: {
    /**
     * Button color - uses Vuetify's color system
     * @default 'primary'
     */
    color: {
      type: String,
      default: 'primary'
    },
    
    /**
     * Button variant - uses Vuetify's variant system
     * @default 'elevated'
     */
    variant: {
      type: String,
      default: 'elevated',
      validator: (value: string) => {
        return ['text', 'flat', 'elevated', 'tonal', 'outlined', 'plain'].includes(value);
      }
    },
    
    /**
     * Button size
     * @default 'default'
     */
    size: {
      type: String,
      default: 'default',
      validator: (value: string) => {
        return ['x-small', 'small', 'default', 'large', 'x-large'].includes(value);
      }
    },
    
    /**
     * Whether the button is disabled
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false
    },
    
    /**
     * Whether the button is in a loading state
     * @default false
     */
    loading: {
      type: Boolean,
      default: false
    },
    
    /**
     * Whether the button should take up the full width of its container
     * @default false
     */
    block: {
      type: Boolean,
      default: false
    },
    
    /**
     * Whether the button should have rounded corners
     * @default undefined
     */
    rounded: {
      type: [Boolean, String],
      default: undefined
    },
    
    /**
     * Icon to display before the button content
     * @default undefined
     */
    prependIcon: {
      type: String,
      default: undefined
    },
    
    /**
     * Icon to display after the button content
     * @default undefined
     */
    appendIcon: {
      type: String,
      default: undefined
    },
    
    /**
     * Additional CSS classes to apply to the button
     * @default ''
     */
    classes: {
      type: String,
      default: ''
    }
  },
  
  emits: ['click'],
  
  setup(props, { emit }) {
    /**
     * Handle button click event
     * @param event - The click event
     */
    const onClick = (event: Event) => {
      if (!props.disabled && !props.loading) {
        emit('click', event);
      }
    };
    
    return {
      onClick
    };
  }
});
</script>
