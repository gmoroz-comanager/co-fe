<template>
  <v-container fluid class="calendar-container">
    <v-row>
      <!-- Sidebar: Polished Ideas (Draggable) -->
      <v-col cols="12" md="3" class="ideas-sidebar">
        <div class="text-h6 mb-4">Polished Ideas</div>
        <div class="text-caption mb-2 text-grey">Drag these to the calendar to schedule</div>
        
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search"
          density="compact"
          variant="outlined"
          hide-details
          class="mb-4"
        ></v-text-field>

        <div v-if="loadingIdeas" class="text-center py-4">
           <v-progress-circular indeterminate size="24"></v-progress-circular>
        </div>

        <div ref="externalEventsRef" id="external-events" v-else>
          <v-card
            v-for="idea in filteredIdeas"
            :key="idea.documentId"
            class="fc-event mb-2 cursor-move"
            variant="outlined"
            :data-event='JSON.stringify({ title: idea.title, id: idea.documentId, extendedProps: { type: "idea", ideaId: idea.documentId } })'
          >
            <v-card-text class="pa-2">
              <div class="font-weight-medium text-truncate">{{ idea.title }}</div>
              <div class="text-caption text-grey">{{ formatDate(idea.createdAt) }}</div>
            </v-card-text>
          </v-card>
          
          <div v-if="filteredIdeas.length === 0" class="text-center text-grey pa-4">
            No polished ideas found.
          </div>
        </div>
      </v-col>

      <!-- Main: Calendar -->
      <v-col cols="12" md="9">
        <FullCalendar 
            ref="calendarRef"
            :options="calendarOptions" 
            class="demo-app-calendar"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch, nextTick } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import { useStore } from 'vuex';
import { scheduleService } from '../api/schedule.service';

export default defineComponent({
  name: 'PostingCalendar',
  components: {
    FullCalendar
  },
  setup() {
    const store = useStore();
    const calendarRef = ref(null);
    const search = ref('');
    const externalEventsRef = ref<HTMLElement | null>(null);
    let draggableInstance: Draggable | null = null;

    // Ideas Logic
    const ideas = computed(() => store.getters['ideas/allIdeas'].filter((i: any) => i.polishedBody)); // Only polished
    const loadingIdeas = computed(() => store.getters['ideas/isLoading']);
    
    const filteredIdeas = computed(() => {
        if (!search.value) return ideas.value;
        const q = search.value.toLowerCase();
        return ideas.value.filter((i: any) => i.title.toLowerCase().includes(q));
    });

    const initDraggable = () => {
        if (externalEventsRef.value && !draggableInstance) {
            draggableInstance = new Draggable(externalEventsRef.value, {
                itemSelector: '.fc-event',
                eventData: function(eventEl) {
                    return JSON.parse(eventEl.getAttribute('data-event') || '{}');
                }
            });
        }
    };

    // Watch for loading to finish to init draggable
    watch(loadingIdeas, (newVal) => {
        if (!newVal) {
            nextTick(() => {
                initDraggable();
            });
        }
    });

    // Also watch filtered ideas in case the list is rebuilt
    watch(filteredIdeas, () => {
        nextTick(() => {
             // Re-init if element was destroyed/recreated (e.g. v-if toggle)
             initDraggable();
        });
    });

    // Calendar Logic
    const calendarOptions = ref({
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'timeGridWeek',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      editable: true,
      droppable: true, // this allows things to be dropped onto the calendar
      slotDuration: '00:30:00', // 30 minutes slots
      snapDuration: '00:30:00',
      height: 'auto',
      events: async (info: any, successCallback: any, failureCallback: any) => {
          try {
              const result = await scheduleService.getScheduledPosts(info.startStr, info.endStr);
              const events = result.data.map((post: any) => ({
                  id: post.documentId,
                  title: post.idea?.title || 'Scheduled Post',
                  start: post.scheduledAt,
                  extendedProps: {
                      type: 'scheduled',
                      channelId: post.channel?.documentId
                  },
                  backgroundColor: post.status === 'published' ? '#4CAF50' : '#2196F3'
              }));
              successCallback(events);
          } catch (e) {
              failureCallback(e);
          }
      },
      eventReceive: async (info: any) => {
          // Handle drop from external
          const { ideaId } = info.event.extendedProps;
          const start = info.event.startStr;
          
          try {
              // Default to first channel for now, or prompt user
              // For drag-n-drop speed, maybe just schedule and let user configure later?
              // Or default to "Draft Schedule"
              
              // We need a channel. Let's grab the first one from store or null
              const channels = store.getters['posting/channels'];
              const channelId = channels.length > 0 ? channels[0].documentId : null;

              if (!channelId) {
                  alert('Please connect a Telegram Channel first in Setup.');
                  info.revert();
                  return;
              }

              // Create new post (middleware handles owner, we handle the rest)
              const newPost = await scheduleService.createScheduledPost({
                  idea: ideaId,
                  scheduledAt: start,
                  channel: channelId,
                  status: 'scheduled'
              });
              
              // Update event ID from backend
              info.event.setProp('id', newPost.data.documentId);
              info.event.setProp('backgroundColor', '#2196F3');

          } catch (e) {
              console.error('Failed to schedule:', e);
              info.revert();
          }
      },
      eventDrop: async (info: any) => {
          // Handle internal move
          try {
              await scheduleService.updateScheduledPost(info.event.id, {
                  scheduledAt: info.event.startStr
              });
          } catch (e) {
              console.error('Failed to update schedule:', e);
              info.revert();
          }
      },
      eventClick: (info: any) => {
          // TODO: Open edit dialog
          if (confirm('Delete this scheduled post?')) {
              scheduleService.deleteScheduledPost(info.event.id).then(() => {
                  info.event.remove();
              });
          }
      }
    });

    onMounted(() => {
        store.dispatch('ideas/fetchIdeas'); // Ensure we have ideas
        store.dispatch('posting/fetchChannels'); // Ensure we have channels

        // Try init immediately in case data is already there
        nextTick(() => {
            initDraggable();
        });
    });

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString();
    };

    return {
      calendarOptions,
      calendarRef,
      filteredIdeas,
      loadingIdeas,
      search,
      formatDate,
      externalEventsRef
    };
  }
});
</script>

<style scoped>
.calendar-container {
    height: calc(100vh - 64px);
}
.ideas-sidebar {
    height: 100%;
    overflow-y: auto;
    border-right: 1px solid #e0e0e0;
}
.cursor-move {
    cursor: move;
}
</style>

