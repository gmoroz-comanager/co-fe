<template>
  <div class="d-flex fill-height bg-background">
    <!-- Sidebar -->
    <v-sheet 
      width="300" 
      class="d-flex flex-column border-e"
      elevation="0"
    >
      <div class="pa-4 border-b">
        <div class="text-h6 font-weight-bold">Scheduling</div>
      </div>

      <div class="pa-4 flex-grow-1 overflow-y-auto custom-scrollbar">
        <!-- Channel Selector -->
        <ChannelSelector
          v-model="selectedChannelId"
          v-model:pinned-channel-id="pinnedChannelId"
          :channels="channels"
          :loading="loadingChannels"
          :get-channel-color="getChannelColor"
          @color-change="onChannelColorChange"
        />

        <!-- Ideas Sidebar -->
        <IdeasSidebar
          v-model:search="search"
          :ideas="ideas"
          :loading="loadingIdeas"
          :is-dragging="isDragging"
          :dragged-idea-id="draggedIdea?.documentId"
          @drag-start="onIdeaMouseDown"
        />
      </div>
    </v-sheet>

    <!-- Main Calendar Area -->
    <div class="d-flex flex-column flex-grow-1" style="height: calc(100vh - var(--app-bar-height)); overflow: hidden;">
      <!-- Toolbar -->
      <CalendarToolbar
        v-model:view-mode="viewMode"
        v-model:focus="focus"
        @navigate="onNavigate"
      />

      <!-- Calendar Container -->
      <div 
        ref="calendarContainer" 
        class="flex-grow-1 calendar-scroll-container position-relative bg-white"
      >
        <div v-if="!selectedChannelId" class="d-flex fill-height align-center justify-center text-medium-emphasis">
          <div class="text-center">
            <v-icon size="64" class="mb-4 text-disabled">mdi-calendar-blank-outline</v-icon>
            <div class="text-h6 font-weight-regular">Select a channel to view schedule</div>
          </div>
        </div>
        
        <v-calendar
          v-else
          ref="calendar"
          v-model="focus"
          :events="displayEvents"
          :type="viewMode"
          :weekdays="[1, 2, 3, 4, 5, 6, 0]"
          :first-day-of-week="1"
          color="primary"
          event-color="color"
          style="min-height: 100%;"
          @click:event="onEventClick"
          @click:date="onDateClick"
          @mousedown:time="onCalendarMouseDown"
          @mousemove:time="onCalendarMouseMove"
          @mouseup:time="onCalendarMouseUp"
          @mouseleave.native="onCalendarMouseLeave"
        >
          <!-- Custom event rendering with status dot -->
          <template v-slot:event="{ event }">
            <div 
              class="calendar-event-content d-flex align-center px-1"
              :style="{ backgroundColor: event.color, borderRadius: '4px' }"
            >
              <!-- Loading spinner or status dot -->
              <v-progress-circular
                v-if="event.isLoading"
                indeterminate
                size="10"
                width="2"
                color="white"
                class="mr-1"
              ></v-progress-circular>
              <span 
                v-else
                class="status-dot mr-1"
                :style="{ backgroundColor: getStatusDotColor(event.extendedProps?.status) }"
              ></span>
              <!-- Event title -->
              <span class="event-title text-truncate text-white text-caption">
                {{ event.name || event.title }}
              </span>
            </div>
          </template>
          
          <!-- Current time indicator -->
          <template v-slot:day-body="{ date, week }">
            <div
              class="v-current-time"
              :class="{ first: date === week[0].date }"
              :style="{ top: nowY }"
            ></div>
          </template>
        </v-calendar>
      </div>
    </div>

    <!-- Drag Ghost -->
    <div 
      v-if="isDragging && draggedIdea"
      class="drag-ghost"
      :style="dragGhostStyle"
    >
      <v-card elevation="8" class="pa-3" style="width: 240px;" :color="dropTargetTime ? 'primary' : 'surface'">
        <div class="font-weight-medium text-body-2 text-truncate" :class="{ 'text-white': dropTargetTime }">
          {{ draggedIdea.title }}
        </div>
        <div class="text-caption mt-1" :class="dropTargetTime ? 'text-white' : 'text-primary'">
          <v-icon size="x-small" class="mr-1">mdi-calendar-clock</v-icon>
          <template v-if="dropTargetTime">
            {{ dropTargetTime }}
          </template>
          <template v-else>
            Drop on calendar to schedule
          </template>
        </div>
      </v-card>
    </div>

    <!-- Channel Picker Dialog -->
    <ChannelPickerDialog
      v-model="channelPickerDialogOpen"
      :channels="channels"
      :pinned-channel-id="pinnedChannelId"
      :get-channel-color="getChannelColor"
      @select="confirmChannelSelection"
      @cancel="cancelChannelSelection"
    />

    <!-- Post Details Dialog -->
    <PostDetailsDialog
      v-model="detailsDialogOpen"
      :event="selectedEvent"
      :get-status-color="getStatusColor"
      @delete="deletePost"
    />
    
    <!-- Toast/Snackbar for notifications -->
    <v-snackbar
      v-model="toastVisible"
      :color="toastColor"
      :timeout="4000"
      location="bottom right"
    >
      {{ toastMessage }}
      <template v-slot:actions>
        <v-btn variant="text" @click="toastVisible = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import { useStore } from 'vuex';
import { TelegramChannel } from '../api/posting.service';
import { scheduleService } from '../api/schedule.service';

// Components
import ChannelSelector from '../components/ChannelSelector.vue';
import IdeasSidebar from '../components/IdeasSidebar.vue';
import CalendarToolbar from '../components/CalendarToolbar.vue';
import PostDetailsDialog from '../components/PostDetailsDialog.vue';
import ChannelPickerDialog from '../components/ChannelPickerDialog.vue';

// Composables
import { useChannelColors } from '../composables/useChannelColors';
import { useCalendarEvents, CalendarEvent } from '../composables/useCalendarEvents';
import { useDragAndDrop } from '../composables/useDragAndDrop';

export default defineComponent({
  name: 'PostingCalendar',
  
  components: {
    ChannelSelector,
    IdeasSidebar,
    CalendarToolbar,
    PostDetailsDialog,
    ChannelPickerDialog,
  },
  
  setup() {
    const store = useStore();
    
    // Refs
    const calendarContainer = ref<HTMLElement | null>(null);
    const calendar = ref<any>(null);
    const search = ref('');
    const focus = ref(new Date());
    const selectedChannelId = ref<string | null>(null);
    const viewMode = ref<'month' | 'week' | 'day'>('week');
    const pinnedChannelId = ref<string | null>(null);
    
    // Dialogs
    const detailsDialogOpen = ref(false);
    const selectedEvent = ref<CalendarEvent | null>(null);
    
    // Current time indicator
    const nowY = ref('-10px');
    let timeUpdateInterval: any = null;
    
    // Store getters
    // Filter ideas to show only readyToPublish and planned (with polishedBody)
    const ideas = computed(() => 
      store.getters['ideas/allIdeas'].filter((i: any) => 
        i.polishedBody && (i.work_status === 'readyToPublish' || i.work_status === 'planned')
      )
    );
    const loadingIdeas = computed(() => store.getters['ideas/isLoading']);
    const channels = computed(() => store.getters['posting/channels'] as TelegramChannel[]);
    const loadingChannels = computed(() => store.getters['posting/isLoading']);
    
    // Initialize composables
    const { getChannelColor, getStatusColor, getStatusDotColor } = useChannelColors({ channels });
    
    const {
      events,
      shadowEvent,
      displayEvents,
      toastVisible,
      toastMessage,
      toastColor,
      fetchEvents,
      addLoadingEvent,
      removeLoadingEvent,
      clearEvents,
      showErrorToast,
    } = useCalendarEvents({
      selectedChannelId,
      focus,
      channels,
      getChannelColor,
    });
    
    // Callback after post created - refresh ideas to update statuses
    const refreshIdeas = async () => {
      await store.dispatch('ideas/fetchIdeas');
    };
    
    const {
      draggedIdea,
      isDragging,
      dragGhostStyle,
      dropTargetTime,
      channelPickerDialogOpen,
      onIdeaMouseDown,
      onCalendarMouseDown,
      onCalendarMouseMove,
      onCalendarMouseUp,
      onCalendarMouseLeave,
      confirmChannelSelection,
      cancelChannelSelection,
    } = useDragAndDrop({
      calendarContainer,
      viewMode,
      focus,
      selectedChannelId,
      pinnedChannelId,
      channels,
      shadowEvent,
      getChannelColor,
      addLoadingEvent,
      removeLoadingEvent,
      fetchEvents,
      showErrorToast,
      onPostCreated: refreshIdeas,
    });
    
    // Current time indicator functions
    const updateNowY = () => {
      if (calendar.value?.timeToY && calendar.value?.times?.now) {
        nowY.value = calendar.value.timeToY(calendar.value.times.now) + 'px';
      }
    };
    
    const getCurrentTime = () => {
      if (calendar.value?.times?.now) {
        return calendar.value.times.now.hour * 60 + calendar.value.times.now.minute;
      }
      return new Date().getHours() * 60 + new Date().getMinutes();
    };
    
    const scrollToCurrentTime = () => {
      const time = getCurrentTime();
      const first = Math.max(0, time - (time % 30) - 30);
      calendar.value?.scrollToTime?.(first);
    };
    
    // Event handlers
    const onChannelColorChange = async ({ documentId, calendarColor }: { documentId: string; calendarColor: string }) => {
      try {
        await store.dispatch('posting/updateChannelColor', { documentId, calendarColor });
        await fetchEvents();
      } catch (err) {
        console.error('Failed to update channel color:', err);
        showErrorToast('Failed to update channel color');
      }
    };
    
    const onNavigate = () => {
      // Fetch events when navigation occurs
      fetchEvents();
    };
    
    const onDateClick = (day: any) => {
      if (day.date) {
        focus.value = new Date(day.date);
      }
      viewMode.value = 'day';
    };
    
    const onEventClick = (nativeEvent: Event, eventInfo: any) => {
      const eventData = eventInfo?.event;
      if (!eventData) return;
      
      // Skip shadow events and loading events
      if (eventData.isShadow || eventData.isLoading) return;
      
      // Find the original event from our events array by id
      const originalEvent = events.value.find(e => e.id === eventData.id);
      
      if (originalEvent) {
        selectedEvent.value = originalEvent;
      } else {
        selectedEvent.value = {
          id: eventData.id || 'unknown',
          title: eventData.name || eventData.title || 'Scheduled Post',
          name: eventData.name || eventData.title || 'Scheduled Post',
          start: eventData.start,
          end: eventData.end,
          color: eventData.color || 'primary',
          timed: true,
          extendedProps: eventData.extendedProps || { status: 'scheduled', channel: null },
        };
      }
      
      detailsDialogOpen.value = true;
    };
    
    const deletePost = async (postId: string) => {
      try {
        await scheduleService.deleteScheduledPost(postId);
        detailsDialogOpen.value = false;
        // Refresh events and ideas (idea status may change back to readyToPublish)
        await Promise.all([
          fetchEvents(),
          store.dispatch('ideas/fetchIdeas'),
        ]);
      } catch (e) {
        console.error('Failed to delete post:', e);
        showErrorToast('Failed to delete post');
      }
    };
    
    // Initialization
    onMounted(async () => {
      await Promise.all([
        store.dispatch('ideas/fetchIdeas'),
        store.dispatch('posting/fetchChannels'),
      ]);
      
      // Default to "all" channels view
      if (!selectedChannelId.value) {
        selectedChannelId.value = 'all';
      }
      
      // If there's only one channel, pin it by default
      if (channels.value.length === 1) {
        pinnedChannelId.value = channels.value[0].documentId;
      }
      
      // Setup current time indicator
      nextTick(() => {
        updateNowY();
        scrollToCurrentTime();
      });
      
      // Update time indicator every minute
      timeUpdateInterval = setInterval(() => {
        calendar.value?.updateTimes?.();
        updateNowY();
      }, 60000);
    });
    
    // Watchers
    watch(selectedChannelId, async (newId) => {
      if (newId) {
        await fetchEvents();
      } else {
        clearEvents();
      }
    });
    
    watch(focus, () => {
      fetchEvents();
    });
    
    watch(viewMode, () => {
      nextTick(() => {
        updateNowY();
        scrollToCurrentTime();
      });
    });
    
    // Cleanup
    onUnmounted(() => {
      if (timeUpdateInterval) {
        clearInterval(timeUpdateInterval);
      }
    });
    
    return {
      // Refs
      calendarContainer,
      calendar,
      search,
      focus,
      selectedChannelId,
      viewMode,
      pinnedChannelId,
      // Store data
      ideas,
      loadingIdeas,
      channels,
      loadingChannels,
      // Events
      displayEvents,
      // Dialogs
      detailsDialogOpen,
      selectedEvent,
      channelPickerDialogOpen,
      // Drag state
      draggedIdea,
      isDragging,
      dragGhostStyle,
      dropTargetTime,
      // Toast
      toastVisible,
      toastMessage,
      toastColor,
      // Current time
      nowY,
      // Methods
      getChannelColor,
      getStatusColor,
      getStatusDotColor,
      onChannelColorChange,
      onNavigate,
      onDateClick,
      onEventClick,
      deletePost,
      onIdeaMouseDown,
      onCalendarMouseDown,
      onCalendarMouseMove,
      onCalendarMouseUp,
      onCalendarMouseLeave,
      confirmChannelSelection,
      cancelChannelSelection,
    };
  },
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e0e0e0;
  border-radius: 3px;
}
.calendar-scroll-container {
  overflow-y: auto;
  scroll-behavior: smooth;
}
.drag-ghost {
  position: fixed;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.95;
  transform: rotate(2deg);
  transition: none;
}

/* Current time indicator */
.v-current-time {
  height: 2px;
  background-color: #ea4335;
  position: absolute;
  left: -1px;
  right: 0;
  pointer-events: none;
  z-index: 1;
}
.v-current-time.first::before {
  content: '';
  position: absolute;
  background-color: #ea4335;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-top: -5px;
  margin-left: -6.5px;
}

/* Calendar event content */
.calendar-event-content {
  width: 100%;
  height: 100%;
  min-height: 20px;
  padding: 2px 4px;
}

/* Status dot in events */
.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1px solid white;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
}

.event-title {
  font-size: 11px;
  line-height: 1.2;
}
</style>
