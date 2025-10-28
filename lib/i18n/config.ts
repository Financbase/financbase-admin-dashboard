/**
 * Internationalization configuration
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
