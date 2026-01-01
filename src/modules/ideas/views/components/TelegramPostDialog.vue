<template>
  <v-dialog :model-value="modelValue" max-width="500" @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title>Post to Telegram</v-card-title>
      <v-card-text>
        <p class="mb-4">Select a channel to post this idea.</p>
        <v-select
          v-model="selectedChannel"
          :items="channels"
          item-title="title"
          item-value="documentId"
          label="Select Channel"
          variant="outlined"
          :loading="channelsLoading"
          no-data-text="No channels found"
          @update:model-value="$emit('update:selectedChannel', $event)"
        ></v-select>
        <div
          v-if="channels.length === 0 && !channelsLoading"
          class="text-caption text-red mt-2"
        >
          No channels found.
          <router-link to="/posting/setup">Setup Telegram</router-link>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="$emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn
          color="blue"
          variant="elevated"
          :loading="publishing"
          :disabled="!selectedChannel"
          @click="$emit('post')"
        >
          Post
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

interface Channel {
  id: number;
  documentId: string;
  title: string;
}

export default defineComponent({
  name: 'TelegramPostDialog',

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    selectedChannel: {
      type: String as PropType<string | null>,
      default: null,
    },
    channels: {
      type: Array as PropType<Channel[]>,
      default: () => [],
    },
    channelsLoading: {
      type: Boolean,
      default: false,
    },
    publishing: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:modelValue', 'update:selectedChannel', 'post'],
});
</script>

