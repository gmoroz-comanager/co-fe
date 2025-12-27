/**
 * Centralized date formatting utilities
 * Consistent format: "day shortMonth year" (e.g., "27 Dec 2025")
 */

/**
 * Normalize input to Date object
 */
function toDate(input: Date | string | number): Date {
  if (input instanceof Date) return input;
  return new Date(input);
}

/**
 * Format date only: "27 Dec 2025"
 */
export function formatDate(input: Date | string | number): string {
  const date = toDate(input);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format date with time: "27 Dec 2025, 14:30"
 */
export function formatDateTime(input: Date | string | number): string {
  const date = toDate(input);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  const datePart = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  
  const timePart = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  return `${datePart}, ${timePart}`;
}

/**
 * Format date with weekday and time: "Sat, 27 Dec 2025, 14:30"
 */
export function formatDateTimeWithWeekday(input: Date | string | number): string {
  const date = toDate(input);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'short' });
  
  const datePart = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  
  const timePart = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  return `${weekday}, ${datePart}, ${timePart}`;
}

/**
 * Format calendar period based on view mode
 * - month: "December 2025"
 * - week: "Week of 27 Dec 2025"
 * - day: "Saturday, 27 December 2025"
 */
export function formatCalendarPeriod(
  input: Date | string | number,
  viewMode: 'day' | 'week' | 'month'
): string {
  const date = toDate(input);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  switch (viewMode) {
    case 'month':
      return date.toLocaleDateString('en-GB', {
        month: 'long',
        year: 'numeric',
      });
    
    case 'week': {
      const datePart = date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      return `Week of ${datePart}`;
    }
    
    case 'day':
      return date.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    
    default:
      return formatDate(date);
  }
}

