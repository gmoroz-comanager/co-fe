<template>
  <div class="mb-6">
    <div class="text-caption font-weight-bold mb-1 text-medium-emphasis text-uppercase">Channel</div>
    <v-select
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :items="channelSelectItems"
      item-title="title"
      item-value="documentId"
      placeholder="Select Channel"
      variant="outlined"
      density="compact"
      color="primary"
      hide-details
      :loading="loading"
      bg-color="surface"
    >
      <!-- Custom item template -->
      <template v-slot:item="{ item, props: itemProps }">
        <v-list-item v-bind="itemProps" :title="undefined">
          <template v-slot:prepend>
            <!-- Color dot (clickable for real channels) -->
            <div 
              v-if="item.raw.documentId !== 'all'"
              class="channel-color-dot mr-3"
              :style="{ backgroundColor: getChannelColor(item.raw) }"
              @click.stop="openColorPicker(item.raw, $event)"
            ></div>
            <v-icon v-else size="small" class="mr-3">mdi-view-grid-outline</v-icon>
          </template>
          
          <v-list-item-title>{{ item.raw.title }}</v-list-item-title>
          
          <template v-slot:append>
            <!-- Pin icon (only for real channels) -->
            <v-btn
              v-if="item.raw.documentId !== 'all'"
              :icon="pinnedChannelId === item.raw.documentId ? 'mdi-pin' : 'mdi-pin-outline'"
              :color="pinnedChannelId === item.raw.documentId ? 'primary' : 'grey'"
              variant="text"
              size="x-small"
              @click.stop="togglePinChannel(item.raw.documentId)"
            ></v-btn>
          </template>
        </v-list-item>
      </template>
      
      <!-- Custom selection template -->
      <template v-slot:selection="{ item }">
        <div class="d-flex align-center">
          <div 
            v-if="item.raw.documentId !== 'all'"
            class="channel-color-dot mr-2"
            :style="{ backgroundColor: getChannelColor(item.raw) }"
          ></div>
          <v-icon v-else size="small" class="mr-2">mdi-view-grid-outline</v-icon>
          <span>{{ item.raw.title }}</span>
          <v-icon 
            v-if="pinnedChannelId && item.raw.documentId === 'all'" 
            size="x-small" 
            class="ml-2"
            color="primary"
          >mdi-pin</v-icon>
        </div>
      </template>
    </v-select>
    
    <!-- Pinned channel indicator when in All Channels view -->
    <div v-if="modelValue === 'all' && pinnedChannelId" class="mt-2 d-flex align-center text-caption">
      <v-icon size="x-small" color="primary" class="mr-1">mdi-pin</v-icon>
      <span class="text-medium-emphasis">New posts go to: </span>
      <span class="ml-1 font-weight-medium" :style="{ color: pinnedChannelColor }">
        {{ pinnedChannelTitle }}
      </span>
    </div>
  </div>
  
  <!-- Color Picker Menu -->
  <v-menu
    v-model="colorPickerOpen"
    :activator="colorPickerActivator || undefined"
    :close-on-content-click="false"
    location="end"
  >
    <v-card width="300">
      <v-card-title class="text-body-1">
        Channel Color
      </v-card-title>
      <v-card-text>
        <v-color-picker
          v-model="editingChannelColor"
          :swatches="colorSwatches"
          show-swatches
          hide-inputs
          mode="hexa"
        ></v-color-picker>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="colorPickerOpen = false">Cancel</v-btn>
        <v-btn color="primary" variant="flat" @click="saveChannelColor">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType } from 'vue';
import { TelegramChannel } from '../api/posting.service';
import { COLOR_SWATCHES } from '../composables/useChannelColors';

export default defineComponent({
  name: 'ChannelSelector',
  
  props: {
    modelValue: {
      type: String as PropType<string | null>,
      default: null,
    },
    channels: {
      type: Array as PropType<TelegramChannel[]>,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
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
  
  emits: ['update:modelValue', 'update:pinned-channel-id', 'color-change'],
  
  setup(props, { emit }) {
    // Color picker state
    const colorPickerOpen = ref(false);
    const colorPickerActivator = ref<HTMLElement | null>(null);
    const editingChannel = ref<TelegramChannel | null>(null);
    const editingChannelColor = ref('#1976D2');
    
    // Channel select items with "All Channels" option
    const channelSelectItems = computed(() => {
      const allOption = { documentId: 'all', title: 'All Channels' };
      return [allOption, ...props.channels];
    });
    
    // Pinned channel helpers
    const pinnedChannelTitle = computed(() => {
      if (!props.pinnedChannelId) return '';
      const channel = props.channels.find(c => c.documentId === props.pinnedChannelId);
      return channel?.title || '';
    });
    
    const pinnedChannelColor = computed(() => {
      if (!props.pinnedChannelId) return '#757575';
      const channel = props.channels.find(c => c.documentId === props.pinnedChannelId);
      return channel ? props.getChannelColor(channel) : '#757575';
    });
    
    // Toggle pin on a channel (only one can be pinned)
    const togglePinChannel = (channelId: string) => {
      if (props.pinnedChannelId === channelId) {
        emit('update:pinned-channel-id', null);
      } else {
        emit('update:pinned-channel-id', channelId);
      }
    };
    
    // Open color picker for a channel
    const openColorPicker = (channel: any, event: MouseEvent) => {
      if (!channel || channel.documentId === 'all') return;
      editingChannel.value = channel as TelegramChannel;
      editingChannelColor.value = props.getChannelColor(channel);
      colorPickerActivator.value = event.target as HTMLElement;
      colorPickerOpen.value = true;
    };
    
    // Save channel color
    const saveChannelColor = () => {
      if (!editingChannel.value) return;
      
      emit('color-change', {
        documentId: editingChannel.value.documentId,
        calendarColor: editingChannelColor.value,
      });
      
      colorPickerOpen.value = false;
      editingChannel.value = null;
    };
    
    return {
      channelSelectItems,
      pinnedChannelTitle,
      pinnedChannelColor,
      colorSwatches: COLOR_SWATCHES,
      colorPickerOpen,
      colorPickerActivator,
      editingChannelColor,
      togglePinChannel,
      openColorPicker,
      saveChannelColor,
    };
  },
});
</script>

<style scoped>
.channel-color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  flex-shrink: 0;
}
.channel-color-dot:hover {
  transform: scale(1.2);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
}
</style>

