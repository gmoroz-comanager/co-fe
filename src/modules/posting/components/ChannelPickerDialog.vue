<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="400" persistent>
    <v-card>
      <v-card-title>Select Channel</v-card-title>
      <v-card-text>
        <div class="text-body-2 text-medium-emphasis mb-4">
          Choose which channel to schedule this post to:
        </div>
        <v-list density="compact">
          <v-list-item
            v-for="channel in channels"
            :key="channel.documentId"
            @click="$emit('select', channel.documentId)"
            class="channel-picker-item"
          >
            <template v-slot:prepend>
              <div 
                class="channel-color-dot mr-3"
                :style="{ backgroundColor: getChannelColor(channel) }"
              ></div>
            </template>
            <v-list-item-title>{{ channel.title }}</v-list-item-title>
            <template v-slot:append>
              <v-icon v-if="pinnedChannelId === channel.documentId" size="small" color="primary">mdi-pin</v-icon>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="$emit('cancel')">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { TelegramChannel } from '../api/posting.service';

export default defineComponent({
  name: 'ChannelPickerDialog',
  
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    channels: {
      type: Array as PropType<TelegramChannel[]>,
      required: true,
    },
    pinnedChannelId: {
      type: String as PropType<string | null>,
      default: null,
    },
    getChannelColor: {
      type: Function as PropType<(channel: any) => string>,
      required: true,
    },
  },
  
  emits: ['update:modelValue', 'select', 'cancel'],
});
</script>

<style scoped>
.channel-color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}
.channel-picker-item {
  cursor: pointer;
  transition: background-color 0.15s;
}
.channel-picker-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
}
</style>

