export const locales = ['en', 'zh', 'fj'] as const;
export type Locale = (typeof locales)[number];

export const timezones = [
  'America/Los_Angeles', // Los Angeles (Default)
  'Asia/Shanghai',       // Beijing
  'America/New_York',    // Washington DC
  'Pacific/Fiji',        // Suva
] as const;

export type Timezone = (typeof timezones)[number];

export const defaultLocale: Locale = 'en';
export const defaultTimezone: Timezone = 'America/Los_Angeles';

export interface AppConfig {
  locale: Locale;
  timezone: Timezone;
}
