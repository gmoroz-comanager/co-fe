import { computed, ComputedRef } from 'vue';
import { TelegramChannel } from '../api/posting.service';

// Default color palette for channels without saved colors
export const DEFAULT_COLORS = [
  '#1976D2', // Blue
  '#388E3C', // Green  
  '#F57C00', // Orange
  '#7B1FA2', // Purple
  '#C2185B', // Pink
  '#00796B', // Teal
  '#5D4037', // Brown
  '#455A64', // Blue Grey
];

// Color swatches for the color picker
export const COLOR_SWATCHES = [
  ['#1976D2', '#388E3C', '#F57C00'],
  ['#7B1FA2', '#C2185B', '#00796B'],
  ['#5D4037', '#455A64', '#E64A19'],
  ['#0097A7', '#689F38', '#FFA000'],
];

interface UseChannelColorsOptions {
  channels: ComputedRef<TelegramChannel[]>;
}

export function useChannelColors({ channels }: UseChannelColorsOptions) {
  /**
   * Get channel color from saved value or assign from default palette
   */
  const getChannelColor = (channel: any): string => {
    if (!channel || channel.documentId === 'all') return '#757575';
    if (channel.calendarColor) return channel.calendarColor;
    // Fallback: assign color based on index in channels list
    const index = channels.value.findIndex(c => c.documentId === channel.documentId);
    return DEFAULT_COLORS[Math.max(0, index) % DEFAULT_COLORS.length];
  };

  /**
   * Get Vuetify color name for status (used in v-chip, etc.)
   */
  const getStatusColor = (status: string | undefined): string => {
    switch (status) {
      case 'published': return 'success';
      case 'failed': return 'error';
      case 'scheduled': return 'primary';
      default: return 'grey';
    }
  };

  /**
   * Get actual hex color for status dot in calendar events
   */
  const getStatusDotColor = (status: string | undefined): string => {
    switch (status) {
      case 'published': return '#4CAF50'; // green
      case 'failed': return '#F44336'; // red
      case 'scheduled': return '#2196F3'; // blue
      case 'preview': return '#9E9E9E'; // grey for shadow events
      case 'loading': return '#9E9E9E'; // grey for loading state
      default: return '#9E9E9E';
    }
  };

  return {
    getChannelColor,
    getStatusColor,
    getStatusDotColor,
    colorSwatches: COLOR_SWATCHES,
  };
}

