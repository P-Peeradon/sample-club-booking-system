/**
 * Utility functions for locale, timezone, and date formatting.
 */

/**
 * Formats a given date string based on the user's locale and timezone.
 * @param dateString The date string to format
 * @param locale The user's locale (e.g. 'en-US')
 * @param timezone The user's timezone (e.g. 'America/Los_Angeles')
 * @returns The formatted date string
 */
export const formatDate = (dateString: string, locale: string, timezone: string): string => {
  try {
    return new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(dateString));
  } catch (error) {
    console.error("Date formatting error:", error);
    // Fallback to basic string if timezone or locale is invalid
    return new Date(dateString).toLocaleString();
  }
};
