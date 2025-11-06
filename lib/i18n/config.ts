/**
 * Internationalization configuration
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


export const i18nConfig = {
  defaultLocale: 'en',
  locales: ['en', 'es', 'fr', 'de', 'pt', 'ja', 'ko', 'zh'],
  localeDetection: true,
  fallbackLocale: 'en'
};

export const supportedLocales = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' }
];

// Export the arrays separately for easier imports
export const locales = i18nConfig.locales;
export const localeNames = supportedLocales.reduce((acc, locale) => {
  acc[locale.code] = locale.name;
  return acc;
}, {} as Record<string, string>);
export const localeFlags = supportedLocales.reduce((acc, locale) => {
  acc[locale.code] = locale.flag;
  return acc;
}, {} as Record<string, string>);

// Export Locale type
export type Locale = (typeof i18nConfig.locales)[number];

// Currency codes
export const currencyCodes = [
  'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD', 'CHF', 'HKD', 'SGD',
  'INR', 'KRW', 'MXN', 'BRL', 'ZAR', 'RUB', 'NZD', 'SEK', 'NOK', 'DKK',
  'PLN', 'CZK', 'HUF', 'ILS', 'CLP', 'PHP', 'AED', 'SAR', 'MYR', 'THB',
  'IDR', 'VND', 'TRY', 'ARS', 'COP', 'PEN', 'EGP', 'PKR', 'BDT', 'LKR'
] as const;

// Timezones
export const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'America/Honolulu',
  'America/Toronto',
  'America/Vancouver',
  'America/Mexico_City',
  'America/Sao_Paulo',
  'America/Buenos_Aires',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Rome',
  'Europe/Madrid',
  'Europe/Amsterdam',
  'Europe/Brussels',
  'Europe/Vienna',
  'Europe/Zurich',
  'Europe/Stockholm',
  'Europe/Oslo',
  'Europe/Copenhagen',
  'Europe/Warsaw',
  'Europe/Prague',
  'Europe/Budapest',
  'Europe/Athens',
  'Europe/Istanbul',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Riyadh',
  'Asia/Karachi',
  'Asia/Dhaka',
  'Asia/Kolkata',
  'Asia/Colombo',
  'Asia/Kathmandu',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Kuala_Lumpur',
  'Asia/Jakarta',
  'Asia/Manila',
  'Asia/Hong_Kong',
  'Asia/Taipei',
  'Asia/Seoul',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Beijing',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Brisbane',
  'Australia/Perth',
  'Pacific/Auckland',
  'Pacific/Honolulu'
] as const;
