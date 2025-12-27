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
        <div class="mb-6">
          <div class="text-caption font-weight-bold mb-1 text-medium-emphasis text-uppercase">Channel</div>
          <v-select
            v-model="selectedChannelId"
            :items="channels"
            item-title="title"
            item-value="documentId"
            placeholder="Select Channel"
            variant="outlined"
            density="compact"
            color="primary"
            hide-details
            :loading="loadingChannels"
            bg-color="surface"
          ></v-select>
        </div>

        <!-- Ideas Source -->
        <div>
          <div class="d-flex align-center justify-space-between mb-2">
            <div class="text-caption font-weight-bold text-medium-emphasis text-uppercase">Polished Ideas</div>
            <v-chip size="x-small" color="primary" variant="flat">{{ filteredIdeas.length }}</v-chip>
          </div>
          
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search ideas..."
            density="compact"
            variant="outlined"
            hide-details
            class="mb-4"
            bg-color="surface"
          ></v-text-field>

          <div v-if="loadingIdeas" class="d-flex justify-center py-4">
             <v-progress-circular indeterminate size="24" color="primary"></v-progress-circular>
          </div>

          <div v-else class="d-flex flex-column gap-2">
            <v-card
              v-for="idea in filteredIdeas"
              :key="idea.documentId"
              class="idea-card"
              :class="{ 'idea-dragging': isDragging && draggedIdea?.documentId === idea.documentId }"
              elevation="1"
              border
              @mousedown="onIdeaMouseDown($event, idea)"
            >
              <v-card-text class="pa-3">
                <div class="font-weight-medium text-body-2 text-truncate mb-1">{{ idea.title }}</div>
                <div class="d-flex align-center justify-space-between">
                  <div class="text-caption text-medium-emphasis">{{ formatDate(idea.createdAt) }}</div>
                  <v-icon size="small" color="grey-lighten-1">mdi-drag-vertical</v-icon>
                </div>
              </v-card-text>
            </v-card>
            
            <div v-if="filteredIdeas.length === 0" class="text-center text-medium-emphasis pa-4 text-body-2">
              No polished ideas found
            </div>
          </div>
        </div>
      </div>
    </v-sheet>

    <!-- Main Calendar Area -->
    <div class="d-flex flex-column flex-grow-1" style="height: calc(100vh - var(--app-bar-height)); overflow: hidden;">
      <!-- Toolbar -->
      <v-toolbar density="compact" color="surface" class="border-b px-2" flat>
        <v-btn-group density="compact" variant="outlined" class="mr-4">
          <v-btn size="small" @click="changeView('prev')">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn size="small" @click="changeView('today')">Today</v-btn>
          <v-btn size="small" @click="changeView('next')">
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </v-btn-group>

        <div class="text-subtitle-1 font-weight-bold mr-4">
          {{ currentPeriodLabel }}
        </div>

        <v-spacer></v-spacer>

        <v-btn-toggle
          v-model="viewMode"
          density="compact"
          mandatory
          variant="outlined"
          color="primary"
        >
          <v-btn value="day" size="small">Day</v-btn>
          <v-btn value="week" size="small">Week</v-btn>
          <v-btn value="month" size="small">Month</v-btn>
        </v-btn-toggle>
      </v-toolbar>

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

    <!-- Drag Ghost (floating element that follows cursor) -->
    <div 
      v-if="isDragging && draggedIdea"
      ref="dragGhost"
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

    <!-- Post Details/Delete Dialog -->
    <v-dialog v-model="detailsDialogOpen" max-width="400">
        <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
                <span>Scheduled Post</span>
                <v-btn icon="mdi-close" variant="text" size="small" @click="detailsDialogOpen = false"></v-btn>
            </v-card-title>
            <v-card-text>
                <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">Idea</div>
                    <div class="text-body-1">{{ selectedEvent?.title || selectedEvent?.name || 'Scheduled Post' }}</div>
                </div>
                <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">Channel</div>
                    <div class="text-body-1 d-flex align-center">
                        <v-icon size="small" class="mr-2" color="primary">mdi-telegram</v-icon>
                        {{ selectedEvent?.extendedProps?.channel?.title || 'Unknown Channel' }}
                    </div>
                </div>
                <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">Scheduled Time</div>
                    <div class="text-body-1">
                        {{ formatEventTime(selectedEvent?.start) }}
                    </div>
                </div>
                <div class="mb-4">
                    <div class="text-caption text-medium-emphasis">Status</div>
                    <v-chip size="small" :color="getStatusColor(selectedEvent?.extendedProps?.status)" label class="text-uppercase">
                        {{ selectedEvent?.extendedProps?.status || 'scheduled' }}
                    </v-chip>
                </div>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn 
                    color="error" 
                    variant="text" 
                    :loading="deleting"
                    @click="deletePost"
                >
                    Delete Post
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import { useStore } from 'vuex';
import { scheduleService } from '../api/schedule.service';

export default defineComponent({
  name: 'PostingCalendar',
  
  setup() {
    const store = useStore();
    
    // Refs
    const calendarContainer = ref<HTMLElement | null>(null);
    const calendar = ref<any>(null);
    const search = ref('');
    const focus = ref(new Date());
    const selectedChannelId = ref<string | null>(null);
    const viewMode = ref<'month' | 'week' | 'day'>('week');
    
    // Dialogs
    const detailsDialogOpen = ref(false);
    const selectedEvent = ref<any>(null);
    const deleting = ref(false);

    // State
    const events = ref<any[]>([]);
    
    // External drag state (from sidebar)
    const draggedIdea = ref<any>(null);
    const shadowEvent = ref<any>(null);
    const lastTimeSlot = ref<any>(null);
    const isDragging = ref(false);
    const dragGhostStyle = ref({ left: '0px', top: '0px' });
    
    // Current time indicator
    const nowY = ref('-10px');
    let timeUpdateInterval: any = null;
    
    // Computed: formatted drop target time for display
    const dropTargetTime = computed(() => {
        if (!lastTimeSlot.value) return null;
        const { year, month, day, hour, minute } = lastTimeSlot.value;
        const d = new Date(year, month - 1, day, hour, minute);
        return d.toLocaleString(undefined, { 
            weekday: 'short',
            month: 'short', 
            day: 'numeric',
            hour: '2-digit', 
            minute: '2-digit' 
        });
    });

    // Combined events for display
    const displayEvents = computed(() => {
        if (shadowEvent.value) {
            return [...events.value, shadowEvent.value];
        }
        return events.value;
    });

    // Getters
    const ideas = computed(() => store.getters['ideas/allIdeas'].filter((i: any) => i.polishedBody));
    const loadingIdeas = computed(() => store.getters['ideas/isLoading']);
    const channels = computed(() => store.getters['posting/channels']);
    const loadingChannels = computed(() => store.getters['posting/isLoading']);

    const filteredIdeas = computed(() => {
        if (!search.value) return ideas.value;
        const q = search.value.toLowerCase();
        return ideas.value.filter((i: any) => i.title.toLowerCase().includes(q));
    });

    const currentPeriodLabel = computed(() => {
        if (!focus.value) return '';
        const d = new Date(focus.value);
        if (isNaN(d.getTime())) return '';
        
        if (viewMode.value === 'month') return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
        if (viewMode.value === 'day') return d.toLocaleDateString(undefined, { dateStyle: 'full' });
        return `Week of ${d.toLocaleDateString()}`;
    });

    // Formatting
    const formatDate = (date: string) => new Date(date).toLocaleDateString();
    const formatTime = (timestamp: any) => {
        // Handle both timestamps (numbers) and Date objects
        const d = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    const formatEventTime = (timestamp: any): string => {
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
            minute: '2-digit'
        });
    };

    const getEventColorClass = (event: any) => {
        // Return class based on status if needed
        return '';
    };
    
    const getStatusColor = (status: string | undefined): string => {
        switch (status) {
            case 'published': return 'success';
            case 'failed': return 'error';
            case 'scheduled': return 'primary';
            default: return 'grey';
        }
    };

    // Actions
    const changeView = (action: 'prev' | 'next' | 'today' | 'day') => {
        let d = focus.value ? new Date(focus.value) : new Date();
        
        if (action === 'day') {
             viewMode.value = 'day';
             return;
        }

        if (action === 'today') {
            focus.value = new Date();
        } else if (action === 'prev') {
            if (viewMode.value === 'week') d.setDate(d.getDate() - 7);
            else if (viewMode.value === 'day') d.setDate(d.getDate() - 1);
            else if (viewMode.value === 'month') d.setMonth(d.getMonth() - 1);
            focus.value = d;
        } else if (action === 'next') {
            if (viewMode.value === 'week') d.setDate(d.getDate() + 7);
            else if (viewMode.value === 'day') d.setDate(d.getDate() + 1);
            else if (viewMode.value === 'month') d.setMonth(d.getMonth() + 1);
            focus.value = d;
        }
    };

    const deletePost = async () => {
        if (!selectedEvent.value) return;
        if (!confirm('Are you sure you want to delete this scheduled post?')) return;
        
        deleting.value = true;
        try {
            await scheduleService.deleteScheduledPost(selectedEvent.value.id);
            detailsDialogOpen.value = false;
            await fetchEvents();
        } catch (e) {
            console.error('Failed to delete post:', e);
            alert('Failed to delete post');
        } finally {
            deleting.value = false;
        }
    };

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

    // Initialization
    onMounted(async () => {
        await Promise.all([
            store.dispatch('ideas/fetchIdeas'),
            store.dispatch('posting/fetchChannels')
        ]);
        
        if (channels.value.length > 0 && !selectedChannelId.value) {
            selectedChannelId.value = channels.value[0].documentId;
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

    watch(selectedChannelId, async (newId) => {
        if (newId) await fetchEvents();
        else events.value = [];
    });

    watch(focus, () => {
        fetchEvents(); // Fetch when date changes
    });

    watch(viewMode, () => {
        // When switching views, scroll to current time
        nextTick(() => {
            updateNowY();
            scrollToCurrentTime();
        });
    });

    const fetchEvents = async () => {
        if (!selectedChannelId.value) return;
        
        let current = focus.value;
        if (!current) {
            current = new Date();
            focus.value = current;
        } else {
             // Ensure it is a Date object (VCalendar might emit ISO strings?)
             current = new Date(current);
        }

        // Fetch roughly month range
        const start = new Date(current.getFullYear(), current.getMonth() - 1, 1).toISOString();
        const end = new Date(current.getFullYear(), current.getMonth() + 2, 0).toISOString();
        
        try {
            const result = await scheduleService.getScheduledPosts(start, end);
            const posts = result.data.filter((p: any) => 
                !p.channel || p.channel.documentId === selectedChannelId.value
            );

            events.value = posts.map((post: any) => {
                const startTime = new Date(post.scheduledAt).getTime();
                const endTime = startTime + 30 * 60 * 1000; // 30 min duration
                return {
                    id: post.documentId,
                    name: post.idea?.title || 'Scheduled Post',  // VCalendar uses 'name' not 'title'
                    title: post.idea?.title || 'Scheduled Post', // Keep for our template
                    start: startTime,
                    end: endTime,
                    color: post.status === 'published' ? 'success' : 'primary',
                    timed: true,
                    extendedProps: {
                        status: post.status,
                        channel: post.channel ? {
                            id: post.channel.id,
                            documentId: post.channel.documentId,
                            title: post.channel.title
                        } : null
                    }
                };
            });
        } catch (e) {
            console.error('Failed to fetch events', e);
        }
    };

    // ========== Helper Functions ==========
    
    // Round time to 15-minute intervals
    const roundTime = (time: number, down = true): number => {
        const roundTo = 15; // minutes
        const roundDownTime = roundTo * 60 * 1000;
        return down
            ? time - time % roundDownTime
            : time + (roundDownTime - (time % roundDownTime));
    };
    
    // Convert VCalendar tms object to timestamp
    const toTime = (tms: { year: number; month: number; day: number; hour: number; minute: number }): number => {
        return new Date(tms.year, tms.month - 1, tms.day, tms.hour, tms.minute).getTime();
    };
    
    // ========== External Drag (from Sidebar) ==========
    
    // Calculate time from mouse position over calendar
    // Uses element inspection to find which day column cursor is over
    const calculateTimeFromPosition = (e: MouseEvent): Date | null => {
        if (!calendarContainer.value || viewMode.value === 'month') return null;
        
        const container = calendarContainer.value;
        const containerRect = container.getBoundingClientRect();
        
        // Check if mouse is over the calendar container
        if (e.clientX < containerRect.left || e.clientX > containerRect.right ||
            e.clientY < containerRect.top || e.clientY > containerRect.bottom) {
            return null;
        }
        
      
        
        // Get all day header elements to find which day we're over
        const dayHeaders = container.querySelectorAll('.v-calendar-weekly__head-weekday');
        let targetDate = new Date(focus.value);
        let foundDay = false;
        
        if (viewMode.value === 'week' && dayHeaders.length > 0) {
            // Each header has the day number, find which column cursor is in
            for (let i = 0; i < dayHeaders.length; i++) {
                const header = dayHeaders[i] as HTMLElement;
                const rect = header.getBoundingClientRect();
                
                if (e.clientX >= rect.left && e.clientX < rect.right) {
                    // Found the column! Get the date from the header
                    // Header contains day number, we need to calculate full date
                    const dayNum = parseInt(header.textContent?.trim() || '0');
                    
                    if (dayNum > 0) {
                        // Calculate which month this day belongs to
                        const current = new Date(focus.value);
                        const year = current.getFullYear();
                        const month = current.getMonth();
                        
                        // Try current month first
                        targetDate = new Date(year, month, dayNum);
                        
                        // If the date is too far from focus, adjust month
                        const diffDays = Math.abs((targetDate.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
                        if (diffDays > 15) {
                            // Wrong month, try adjacent
                            if (dayNum > 15) {
                                targetDate = new Date(year, month - 1, dayNum);
                            } else {
                                targetDate = new Date(year, month + 1, dayNum);
                            }
                        }
                        foundDay = true;
                    }
                    break;
                }
            }
        }
        
        // Fallback for day view or if headers not found
        if (!foundDay && viewMode.value === 'day') {
            targetDate = new Date(focus.value);
            foundDay = true;
        }
        
        if (!foundDay) {
            // Last resort fallback using column position
            const dayColumns = container.querySelectorAll('.v-calendar-daily__day');
            if (dayColumns.length > 0) {
                const firstCol = dayColumns[0] as HTMLElement;
                const firstColRect = firstCol.getBoundingClientRect();
                const colWidth = firstCol.offsetWidth;
                const relativeX = e.clientX - firstColRect.left;
                const colIndex = Math.max(0, Math.min(dayColumns.length - 1, Math.floor(relativeX / colWidth)));
                
                // Calculate date: focus is somewhere in the week, find Monday
                const current = new Date(focus.value);
                const dayOfWeek = current.getDay(); // 0=Sun
                const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                const monday = new Date(current);
                monday.setDate(current.getDate() + mondayOffset);
                
                targetDate = new Date(monday);
                targetDate.setDate(monday.getDate() + colIndex);
            }
        }
        
        // === CALCULATE TIME (VERTICAL) ===
        const intervals = container.querySelectorAll('.v-calendar-daily__interval');
        let hours = 12; // default noon
        let minutes = 0;
        
        if (intervals.length > 0) {
            const firstInterval = intervals[0] as HTMLElement;
            const intervalHeight = firstInterval.offsetHeight;
            
            // Get the position of the first interval relative to container
            const firstIntervalRect = firstInterval.getBoundingClientRect();
            
            // Mouse position relative to container top, plus scroll
            const scrollTop = container.scrollTop;
            const containerTop = containerRect.top;
            
            // The first interval's top in scroll coordinates
            const firstIntervalScrollTop = (firstIntervalRect.top - containerTop) + scrollTop;
            
            // Mouse Y in scroll coordinates
            const mouseScrollY = (e.clientY - containerTop) + scrollTop;
            
            // Position within the time grid
            const relativeY = mouseScrollY - firstIntervalScrollTop;
            
            // Each interval = 1 hour, calculate exact time
            const hoursExact = Math.max(0, Math.min(23.99, relativeY / intervalHeight));
            hours = Math.floor(hoursExact);
            minutes = Math.floor((hoursExact - hours) * 60);
        }
        
        targetDate.setHours(hours, minutes, 0, 0);
        return new Date(roundTime(targetDate.getTime()));
    };
    
    const onIdeaMouseDown = (e: MouseEvent, idea: any) => {
        // Prevent text selection
        e.preventDefault();
        
        // Start external drag
        draggedIdea.value = idea;
        isDragging.value = true;
        
        // Set initial ghost position
        dragGhostStyle.value = {
            left: `${e.clientX + 10}px`,
            top: `${e.clientY + 10}px`
        };
        
        // Add grabbing cursor to body
        document.body.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
        
        // Add global mouse listeners
        document.addEventListener('mousemove', onGlobalMouseMove);
        document.addEventListener('mouseup', onGlobalMouseUp);
    };
    
    const onGlobalMouseMove = (e: MouseEvent) => {
        if (!isDragging.value || !draggedIdea.value) return;
        
        // Update ghost position
        dragGhostStyle.value = {
            left: `${e.clientX + 10}px`,
            top: `${e.clientY + 10}px`
        };
        
        // Calculate time from mouse position
        const targetTime = calculateTimeFromPosition(e);
        
        if (targetTime) {
            // Store for drop
            lastTimeSlot.value = {
                year: targetTime.getFullYear(),
                month: targetTime.getMonth() + 1,
                day: targetTime.getDate(),
                hour: targetTime.getHours(),
                minute: targetTime.getMinutes()
            };
            
            // Update shadow event - match format of regular events (timestamps for timed events)
            const startTime = targetTime.getTime();
            const endTime = startTime + 30 * 60 * 1000; // 30 min duration
            
            shadowEvent.value = {
                id: 'shadow-event',
                name: `📍 ${draggedIdea.value.title}`,
                title: `📍 ${draggedIdea.value.title}`,
                start: startTime,
                end: endTime,
                color: 'indigo-lighten-3',  // More visible color
                timed: true,
                isShadow: true,
                extendedProps: {
                    status: 'preview'
                }
            };
        } else {
            // Mouse is outside calendar
            shadowEvent.value = null;
            lastTimeSlot.value = null;
        }
    };
    
    const onGlobalMouseUp = async (e: MouseEvent) => {
        // Cleanup global listeners
        document.removeEventListener('mousemove', onGlobalMouseMove);
        document.removeEventListener('mouseup', onGlobalMouseUp);
        
        // Reset cursor
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        
        // If we have a valid drop position, create the post
        if (draggedIdea.value && lastTimeSlot.value && selectedChannelId.value) {
            try {
                const time = roundTime(toTime(lastTimeSlot.value));
                const targetDate = new Date(time);
                
                await scheduleService.createScheduledPost({
                    idea: draggedIdea.value.documentId,
                    scheduledAt: targetDate.toISOString(),
                    channel: selectedChannelId.value,
                    status: 'scheduled'
                });
                
                await fetchEvents();
            } catch (err) {
                console.error('Failed to create scheduled post:', err);
            }
        }
        
        // Reset state
        isDragging.value = false;
        draggedIdea.value = null;
        shadowEvent.value = null;
        lastTimeSlot.value = null;
    };
    
    // ========== VCalendar Mouse Events ==========
    
    const onCalendarMouseDown = (tms: any) => {
        // If we're not dragging an external idea, ignore
        // This could be used for internal event dragging later
    };
    
    const onCalendarMouseMove = (tms: any) => {
        // Only update shadow if we're dragging an idea from sidebar
        if (!draggedIdea.value) return;
        
        lastTimeSlot.value = tms;
        
        const time = roundTime(toTime(tms));
        const start = new Date(time);
        const end = new Date(time + 30 * 60 * 1000); // 30 min duration
        
        shadowEvent.value = {
            id: 'shadow-event',
            title: draggedIdea.value.title,
            start: start,
            end: end,
            color: 'grey',
            isShadow: true
        };
    };
    
    const onCalendarMouseUp = async (tms: any) => {
        // If dragging from sidebar, the global mouseup handles creation
        // This is for potential internal drag completion
    };
    
    const onCalendarMouseLeave = () => {
        // Clear shadow when mouse leaves calendar (but keep draggedIdea)
        if (draggedIdea.value) {
            shadowEvent.value = null;
            lastTimeSlot.value = null;
        }
    };
    
    const onDateClick = (day: any) => {
        // When clicking on a date, switch to day view
        if (day.date) {
            focus.value = new Date(day.date);
        }
        viewMode.value = 'day';
    };

    const onEventClick = (nativeEvent: Event, eventInfo: any) => {
        // VCalendar click:event passes two arguments:
        // 1. Event (native browser event)
        // 2. Object with { event, eventParsed, day, start, end, timed, ... }
        
        const eventData = eventInfo?.event;
        if (!eventData) return;
        
        // Skip shadow events
        if (eventData.isShadow) return;
        
        // Find the original event from our events array by id
        const originalEvent = events.value.find(e => e.id === eventData.id);
        
        if (originalEvent) {
            selectedEvent.value = originalEvent;
        } else {
            // Fallback: construct from eventData
            selectedEvent.value = {
                id: eventData.id || 'unknown',
                title: eventData.name || eventData.title || 'Scheduled Post',
                name: eventData.name || eventData.title || 'Scheduled Post',
                start: eventData.start,
                end: eventData.end,
                color: eventData.color || 'primary',
                extendedProps: eventData.extendedProps || { status: 'scheduled' }
            };
        }
        
        detailsDialogOpen.value = true;
    };
    
    // Cleanup on unmount
    onUnmounted(() => {
        document.removeEventListener('mousemove', onGlobalMouseMove);
        document.removeEventListener('mouseup', onGlobalMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        
        // Clear time update interval
        if (timeUpdateInterval) {
            clearInterval(timeUpdateInterval);
        }
    });

    return {
        calendarContainer,
        calendar,
        search,
        focus,
        selectedChannelId,
        displayEvents,
        ideas,
        filteredIdeas,
        loadingIdeas,
        channels,
        loadingChannels,
        viewMode,
        currentPeriodLabel,
        detailsDialogOpen,
        selectedEvent,
        deleting,
        isDragging,
        draggedIdea,
        dragGhostStyle,
        dropTargetTime,
        nowY,
        formatDate,
        formatTime,
        formatEventTime,
        getEventColorClass,
        getStatusColor,
        changeView,
        deletePost,
        onIdeaMouseDown,
        onCalendarMouseDown,
        onCalendarMouseMove,
        onCalendarMouseUp,
        onCalendarMouseLeave,
        onDateClick,
        onEventClick
    };
  }
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
    /* Smooth scrolling */
    scroll-behavior: smooth; 
}
.gap-2 {
    gap: 8px;
}
.lh-1 {
    line-height: 1.2;
}
.opacity-80 {
    opacity: 0.8;
}
.idea-card {
    transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
    user-select: none;
    cursor: grab;
}
.idea-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
}
.idea-card:active {
    cursor: grabbing;
}
.idea-dragging {
    opacity: 0.4;
    transform: scale(0.98);
}
.shadow-event {
    background-color: rgba(var(--v-theme-primary), 0.3) !important;
    border: 2px dashed rgb(var(--v-theme-primary)) !important;
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
</style>
