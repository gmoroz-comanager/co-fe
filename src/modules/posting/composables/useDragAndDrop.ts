import { ref, computed, Ref, onUnmounted } from 'vue';
import { TelegramChannel } from '../api/posting.service';
import { scheduleService } from '../api/schedule.service';
import { CalendarEvent } from './useCalendarEvents';
import { formatDateTimeWithWeekday } from '@/core/helpers/dateFormat';

export interface TimeSlot {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

export interface PendingDropData {
  idea: any;
  time: Date;
}

interface UseDragAndDropOptions {
  calendarContainer: Ref<HTMLElement | null>;
  viewMode: Ref<'month' | 'week' | 'day'>;
  focus: Ref<Date>;
  selectedChannelId: Ref<string | null>;
  pinnedChannelId: Ref<string | null>;
  channels: Ref<TelegramChannel[]>;
  shadowEvent: Ref<CalendarEvent | null>;
  getChannelColor: (channel: any) => string;
  addLoadingEvent: (idea: any, targetDate: Date, channel: TelegramChannel | null) => string;
  removeLoadingEvent: (loadingEventId: string) => void;
  fetchEvents: () => Promise<void>;
  showErrorToast: (message: string) => void;
}

/**
 * Round time to 15-minute intervals
 */
export const roundTime = (time: number, down = true): number => {
  const roundTo = 15; // minutes
  const roundDownTime = roundTo * 60 * 1000;
  return down
    ? time - (time % roundDownTime)
    : time + (roundDownTime - (time % roundDownTime));
};

/**
 * Convert VCalendar tms object to timestamp
 */
export const toTime = (tms: TimeSlot): number => {
  return new Date(tms.year, tms.month - 1, tms.day, tms.hour, tms.minute).getTime();
};

export function useDragAndDrop({
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
}: UseDragAndDropOptions) {
  // Drag state
  const draggedIdea = ref<any>(null);
  const lastTimeSlot = ref<TimeSlot | null>(null);
  const isDragging = ref(false);
  const dragGhostStyle = ref({ left: '0px', top: '0px' });

  // Channel picker dialog state (for two-step creation)
  const channelPickerDialogOpen = ref(false);
  const pendingDropData = ref<PendingDropData | null>(null);

  // Computed: formatted drop target time for display on ghost
  const dropTargetTime = computed(() => {
    if (!lastTimeSlot.value) return null;
    const { year, month, day, hour, minute } = lastTimeSlot.value;
    const d = new Date(year, month - 1, day, hour, minute);
    return formatDateTimeWithWeekday(d);
  });

  /**
   * Calculate time from mouse position over calendar
   * Uses element inspection to find which day column cursor is over
   */
  const calculateTimeFromPosition = (e: MouseEvent): Date | null => {
    if (!calendarContainer.value || viewMode.value === 'month') return null;

    const container = calendarContainer.value;
    const containerRect = container.getBoundingClientRect();

    // Check if mouse is over the calendar container
    if (
      e.clientX < containerRect.left ||
      e.clientX > containerRect.right ||
      e.clientY < containerRect.top ||
      e.clientY > containerRect.bottom
    ) {
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
          const dayNum = parseInt(header.textContent?.trim() || '0');

          if (dayNum > 0) {
            // Calculate which month this day belongs to
            const current = new Date(focus.value);
            const year = current.getFullYear();
            const month = current.getMonth();

            // Try current month first
            targetDate = new Date(year, month, dayNum);

            // If the date is too far from focus, adjust month
            const diffDays = Math.abs(
              (targetDate.getTime() - current.getTime()) / (1000 * 60 * 60 * 24)
            );
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
        const colIndex = Math.max(
          0,
          Math.min(dayColumns.length - 1, Math.floor(relativeX / colWidth))
        );

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
      const firstIntervalScrollTop = firstIntervalRect.top - containerTop + scrollTop;

      // Mouse Y in scroll coordinates
      const mouseScrollY = e.clientY - containerTop + scrollTop;

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

  /**
   * Handle mousedown on an idea card to start dragging
   */
  const onIdeaMouseDown = (e: MouseEvent, idea: any) => {
    // Prevent text selection
    e.preventDefault();

    // Start external drag
    draggedIdea.value = idea;
    isDragging.value = true;

    // Set initial ghost position
    dragGhostStyle.value = {
      left: `${e.clientX + 10}px`,
      top: `${e.clientY + 10}px`,
    };

    // Add grabbing cursor to body
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';

    // Add global mouse listeners
    document.addEventListener('mousemove', onGlobalMouseMove);
    document.addEventListener('mouseup', onGlobalMouseUp);
  };

  /**
   * Handle global mouse move during drag
   */
  const onGlobalMouseMove = (e: MouseEvent) => {
    if (!isDragging.value || !draggedIdea.value) return;

    // Update ghost position
    dragGhostStyle.value = {
      left: `${e.clientX + 10}px`,
      top: `${e.clientY + 10}px`,
    };

    // Calculate time from mouse position
    const targetTime = calculateTimeFromPosition(e);

    if (targetTime && !isNaN(targetTime.getTime())) {
      // Store for drop
      lastTimeSlot.value = {
        year: targetTime.getFullYear(),
        month: targetTime.getMonth() + 1,
        day: targetTime.getDate(),
        hour: targetTime.getHours(),
        minute: targetTime.getMinutes(),
      };

      // Update shadow event
      const startTime = targetTime.getTime();
      const endTime = startTime + 30 * 60 * 1000; // 30 min duration

      shadowEvent.value = {
        id: 'shadow-event',
        name: `📍 ${draggedIdea.value.title}`,
        title: `📍 ${draggedIdea.value.title}`,
        start: startTime,
        end: endTime,
        color: 'indigo-lighten-3',
        timed: true,
        isShadow: true,
        extendedProps: {
          status: 'preview',
          channel: null,
        },
      };
    } else {
      // Mouse is outside calendar
      shadowEvent.value = null;
      lastTimeSlot.value = null;
    }
  };

  /**
   * Handle global mouse up to complete the drag
   */
  const onGlobalMouseUp = async (e: MouseEvent) => {
    // Cleanup global listeners
    document.removeEventListener('mousemove', onGlobalMouseMove);
    document.removeEventListener('mouseup', onGlobalMouseUp);

    // Reset cursor
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    // If we have a valid drop position, create the post
    if (draggedIdea.value && lastTimeSlot.value && selectedChannelId.value) {
      const time = roundTime(toTime(lastTimeSlot.value));
      const targetDate = new Date(time);
      const currentIdea = draggedIdea.value;

      // Determine target channel
      let targetChannelId: string | null = null;

      if (selectedChannelId.value === 'all') {
        // In "All Channels" view
        if (pinnedChannelId.value) {
          // Use pinned channel directly
          targetChannelId = pinnedChannelId.value;
        } else {
          // Show channel picker dialog (two-step creation)
          pendingDropData.value = {
            idea: draggedIdea.value,
            time: targetDate,
          };
          channelPickerDialogOpen.value = true;

          // Reset drag state but don't create post yet
          resetDragState();
          return;
        }
      } else {
        // Specific channel selected
        targetChannelId = selectedChannelId.value;
      }

      // Create post with loading placeholder
      if (targetChannelId) {
        // Clear visual drag state immediately before async call
        shadowEvent.value = null;
        isDragging.value = false;
        draggedIdea.value = null;
        lastTimeSlot.value = null;
        
        await createScheduledPost(currentIdea, targetDate, targetChannelId);
        return; // Already cleaned up
      }
    }

    // Reset remaining state (only if no post was created)
    resetDragState();
  };

  /**
   * Create a scheduled post with loading placeholder
   */
  const createScheduledPost = async (
    idea: any,
    targetDate: Date,
    channelId: string
  ) => {
    const channel = channels.value.find(c => c.documentId === channelId) || null;
    const loadingEventId = addLoadingEvent(idea, targetDate, channel);

    try {
      await scheduleService.createScheduledPost({
        idea: idea.documentId,
        scheduledAt: targetDate.toISOString(),
        channel: channelId,
        status: 'scheduled',
      });

      // Success - fetch real events (replaces loading placeholder)
      await fetchEvents();
    } catch (err) {
      console.error('Failed to create scheduled post:', err);

      // Remove loading placeholder
      removeLoadingEvent(loadingEventId);

      // Show error toast
      showErrorToast('Failed to schedule post. Please try again.');
    }
  };

  /**
   * Confirm channel selection from the picker dialog
   */
  const confirmChannelSelection = async (channelId: string) => {
    if (!pendingDropData.value) return;

    const { idea, time } = pendingDropData.value;

    // Close dialog first
    channelPickerDialogOpen.value = false;

    // Create the post
    await createScheduledPost(idea, time, channelId);

    // Clear pending data
    pendingDropData.value = null;
  };

  /**
   * Cancel channel selection
   */
  const cancelChannelSelection = () => {
    channelPickerDialogOpen.value = false;
    pendingDropData.value = null;
  };

  /**
   * Reset all drag state
   */
  const resetDragState = () => {
    isDragging.value = false;
    draggedIdea.value = null;
    shadowEvent.value = null;
    lastTimeSlot.value = null;
  };

  /**
   * Handle VCalendar mouse events (for potential internal event dragging)
   */
  const onCalendarMouseDown = (tms: any) => {
    // Placeholder for internal event dragging
  };

  const onCalendarMouseMove = (tms: any) => {
    // Only update shadow if we're dragging an idea from sidebar
    if (!draggedIdea.value) return;
    
    // Validate tms structure
    if (!tms || typeof tms.year !== 'number' || typeof tms.month !== 'number') return;

    lastTimeSlot.value = tms;

    const time = roundTime(toTime(tms));
    
    // Guard against NaN
    if (isNaN(time)) return;
    
    const startTime = time;
    const endTime = time + 30 * 60 * 1000;

    shadowEvent.value = {
      id: 'shadow-event',
      name: draggedIdea.value.title,
      title: draggedIdea.value.title,
      start: startTime,
      end: endTime,
      color: 'grey',
      timed: true,
      isShadow: true,
      extendedProps: {
        status: 'preview',
        channel: null,
      },
    };
  };

  const onCalendarMouseUp = async (tms: any) => {
    // Placeholder for internal drag completion
  };

  const onCalendarMouseLeave = () => {
    // Clear shadow when mouse leaves calendar (but keep draggedIdea)
    if (draggedIdea.value) {
      shadowEvent.value = null;
      lastTimeSlot.value = null;
    }
  };

  // Cleanup on unmount
  onUnmounted(() => {
    document.removeEventListener('mousemove', onGlobalMouseMove);
    document.removeEventListener('mouseup', onGlobalMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });

  return {
    // State
    draggedIdea,
    isDragging,
    dragGhostStyle,
    dropTargetTime,
    lastTimeSlot,
    channelPickerDialogOpen,
    pendingDropData,
    // Methods
    onIdeaMouseDown,
    onCalendarMouseDown,
    onCalendarMouseMove,
    onCalendarMouseUp,
    onCalendarMouseLeave,
    confirmChannelSelection,
    cancelChannelSelection,
    resetDragState,
    // Utilities
    roundTime,
    toTime,
  };
}

