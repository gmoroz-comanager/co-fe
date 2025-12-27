import { ref, computed, Ref, ComputedRef } from 'vue';
import { scheduleService } from '../api/schedule.service';
import { TelegramChannel } from '../api/posting.service';

export interface CalendarEvent {
  id: string;
  name: string;
  title: string;
  start: number;
  end: number;
  color: string;
  timed: boolean;
  isLoading?: boolean;
  isShadow?: boolean;
  extendedProps: {
    status: string;
    channel: {
      id: number;
      documentId: string;
      title: string;
      calendarColor?: string;
    } | null;
  };
}

interface UseCalendarEventsOptions {
  selectedChannelId: Ref<string | null>;
  focus: Ref<Date>;
  channels: ComputedRef<TelegramChannel[]>;
  getChannelColor: (channel: any) => string;
}

export function useCalendarEvents({
  selectedChannelId,
  focus,
  channels,
  getChannelColor,
}: UseCalendarEventsOptions) {
  // Events state
  const events = ref<CalendarEvent[]>([]);
  const shadowEvent = ref<CalendarEvent | null>(null);

  // Toast notification state
  const toastVisible = ref(false);
  const toastMessage = ref('');
  const toastColor = ref<'error' | 'success' | 'warning'>('error');

  // Combined events for display (events + shadow)
  const displayEvents = computed(() => {
    if (shadowEvent.value) {
      return [...events.value, shadowEvent.value];
    }
    return events.value;
  });

  /**
   * Fetch scheduled posts from the server
   */
  const fetchEvents = async () => {
    if (!selectedChannelId.value) return;

    let current = focus.value;
    if (!current) {
      current = new Date();
      focus.value = current;
    } else {
      // Ensure it is a Date object (VCalendar might emit ISO strings)
      current = new Date(current);
    }

    // Fetch roughly 3-month range
    const start = new Date(current.getFullYear(), current.getMonth() - 1, 1).toISOString();
    const end = new Date(current.getFullYear(), current.getMonth() + 2, 0).toISOString();

    try {
      const result = await scheduleService.getScheduledPosts(start, end);

      // Filter based on selected channel (or show all)
      const isAllChannels = selectedChannelId.value === 'all';
      const posts = isAllChannels
        ? result.data
        : result.data.filter((p: any) =>
            !p.channel || p.channel.documentId === selectedChannelId.value
          );

      events.value = posts.map((post: any) => {
        const startTime = new Date(post.scheduledAt).getTime();
        const endTime = startTime + 30 * 60 * 1000; // 30 min duration

        // Get channel color for event background
        let eventColor = '#1976D2';
        if (post.channel) {
          const channel = channels.value.find(c => c.documentId === post.channel.documentId);
          if (channel) {
            eventColor = getChannelColor(channel);
          }
        }

        return {
          id: post.documentId,
          name: post.idea?.title || 'Scheduled Post',
          title: post.idea?.title || 'Scheduled Post',
          start: startTime,
          end: endTime,
          color: eventColor,
          timed: true,
          extendedProps: {
            status: post.status,
            channel: post.channel
              ? {
                  id: post.channel.id,
                  documentId: post.channel.documentId,
                  title: post.channel.title,
                  calendarColor: post.channel.calendarColor,
                }
              : null,
          },
        };
      });
    } catch (e) {
      console.error('Failed to fetch events', e);
      showErrorToast('Failed to load scheduled posts');
    }
  };

  /**
   * Add a loading placeholder event (optimistic UI)
   */
  const addLoadingEvent = (
    idea: any,
    targetDate: Date,
    channel: TelegramChannel | null
  ): string => {
    const loadingEventId = `loading-${Date.now()}`;
    const channelColor = channel ? getChannelColor(channel) : '#1976D2';

    const loadingEvent: CalendarEvent = {
      id: loadingEventId,
      name: idea.title,
      title: idea.title,
      start: targetDate.getTime(),
      end: targetDate.getTime() + 30 * 60 * 1000,
      color: channelColor,
      timed: true,
      isLoading: true,
      extendedProps: {
        status: 'loading',
        channel: channel
          ? {
              id: channel.id,
              documentId: channel.documentId,
              title: channel.title,
            }
          : null,
      },
    };

    events.value = [...events.value, loadingEvent];
    return loadingEventId;
  };

  /**
   * Remove a loading placeholder event
   */
  const removeLoadingEvent = (loadingEventId: string) => {
    events.value = events.value.filter(e => e.id !== loadingEventId);
  };

  /**
   * Clear all events
   */
  const clearEvents = () => {
    events.value = [];
  };

  /**
   * Show error toast notification
   */
  const showErrorToast = (message: string) => {
    toastMessage.value = message;
    toastColor.value = 'error';
    toastVisible.value = true;
  };

  /**
   * Show success toast notification
   */
  const showSuccessToast = (message: string) => {
    toastMessage.value = message;
    toastColor.value = 'success';
    toastVisible.value = true;
  };

  return {
    // State
    events,
    shadowEvent,
    displayEvents,
    // Toast
    toastVisible,
    toastMessage,
    toastColor,
    // Methods
    fetchEvents,
    addLoadingEvent,
    removeLoadingEvent,
    clearEvents,
    showErrorToast,
    showSuccessToast,
  };
}

