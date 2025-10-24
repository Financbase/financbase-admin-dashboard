import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
export const locales = ['en', 'es', 'fr', 'de', 'pt', 'it', 'nl', 'sv', 'da', 'no'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  it: 'Italiano',
  nl: 'Nederlands',
  sv: 'Svenska',
  da: 'Dansk',
  no: 'Norsk',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  pt: '🇵🇹',
  it: '🇮🇹',
  nl: '🇳🇱',
  sv: '🇸🇪',
  da: '🇩🇰',
  no: '🇳🇴',
};

export const currencyCodes: Record<Locale, string> = {
  en: 'USD',
  es: 'EUR',
  fr: 'EUR',
  de: 'EUR',
  pt: 'EUR',
  it: 'EUR',
  nl: 'EUR',
  sv: 'SEK',
  da: 'DKK',
  no: 'NOK',
};

export const timezones: Record<Locale, string[]> = {
  en: ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'UTC'],
  es: ['Europe/Madrid', 'America/Mexico_City', 'America/Argentina/Buenos_Aires', 'UTC'],
  fr: ['Europe/Paris', 'Africa/Casablanca', 'UTC'],
  de: ['Europe/Berlin', 'Europe/Vienna', 'Europe/Zurich', 'UTC'],
  pt: ['Europe/Lisbon', 'America/Sao_Paulo', 'UTC'],
  it: ['Europe/Rome', 'Europe/Vatican', 'UTC'],
  nl: ['Europe/Amsterdam', 'UTC'],
  sv: ['Europe/Stockholm', 'UTC'],
  da: ['Europe/Copenhagen', 'UTC'],
  no: ['Europe/Oslo', 'UTC'],
};

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) notFound();

  return {
    messages: (await import(`./translations/${locale}.json`)).default,
    timeZone: 'UTC',
    now: new Date(),
  };
});
