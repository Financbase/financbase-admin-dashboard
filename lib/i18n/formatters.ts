import { Locale, currencyCodes, timezones } from './config';

export interface CurrencyFormatOptions {
  locale: Locale;
  currency: string;
  amount: number;
  showSymbol?: boolean;
  showCode?: boolean;
  precision?: number;
}

export interface DateFormatOptions {
  locale: Locale;
  date: Date;
  format?: 'short' | 'medium' | 'long' | 'full';
  timezone?: string;
  showTime?: boolean;
}

export interface NumberFormatOptions {
  locale: Locale;
  value: number;
  type?: 'decimal' | 'currency' | 'percent';
  precision?: number;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export class I18nFormatters {
  /**
   * Format currency based on locale
   */
  static formatCurrency(options: CurrencyFormatOptions): string {
    const {
      locale,
      currency,
      amount,
      showSymbol = true,
      showCode = false,
      precision = 2,
    } = options;

    try {
      const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency || currencyCodes[locale],
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      });

      let formatted = formatter.format(amount);

      if (!showSymbol) {
        // Remove currency symbol but keep the number
        formatted = formatted.replace(/[^\d.,\s-]/g, '').trim();
      }

      if (showCode) {
        formatted += ` ${currency || currencyCodes[locale]}`;
      }

      return formatted;
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `${amount.toFixed(precision)} ${currency || currencyCodes[locale]}`;
    }
  }

  /**
   * Format date based on locale and timezone
   */
  static formatDate(options: DateFormatOptions): string {
    const {
      locale,
      date,
      format = 'medium',
      timezone = 'UTC',
      showTime = false,
    } = options;

    try {
      const formatOptions: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
      };

      switch (format) {
        case 'short':
          formatOptions.dateStyle = 'short';
          if (showTime) formatOptions.timeStyle = 'short';
          break;
        case 'medium':
          formatOptions.dateStyle = 'medium';
          if (showTime) formatOptions.timeStyle = 'medium';
          break;
        case 'long':
          formatOptions.dateStyle = 'long';
          if (showTime) formatOptions.timeStyle = 'long';
          break;
        case 'full':
          formatOptions.dateStyle = 'full';
          if (showTime) formatOptions.timeStyle = 'full';
          break;
      }

      const formatter = new Intl.DateTimeFormat(locale, formatOptions);
      return formatter.format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return date.toLocaleDateString(locale);
    }
  }

  /**
   * Format number based on locale
   */
  static formatNumber(options: NumberFormatOptions): string {
    const {
      locale,
      value,
      type = 'decimal',
      precision = 2,
      minimumFractionDigits = 0,
      maximumFractionDigits = precision,
    } = options;

    try {
      const formatOptions: Intl.NumberFormatOptions = {
        minimumFractionDigits,
        maximumFractionDigits,
      };

      if (type === 'currency') {
        formatOptions.style = 'currency';
        formatOptions.currency = currencyCodes[locale];
      } else if (type === 'percent') {
        formatOptions.style = 'percent';
      }

      const formatter = new Intl.NumberFormat(locale, formatOptions);
      return formatter.format(value);
    } catch (error) {
      console.error('Error formatting number:', error);
      return value.toLocaleString(locale);
    }
  }

  /**
   * Format relative time (e.g., "2 hours ago", "in 3 days")
   */
  static formatRelativeTime(
    locale: Locale,
    date: Date,
    now: Date = new Date()
  ): string {
    try {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
      
      const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);
      const diffInWeeks = Math.floor(diffInDays / 7);
      const diffInMonths = Math.floor(diffInDays / 30);
      const diffInYears = Math.floor(diffInDays / 365);

      if (Math.abs(diffInYears) >= 1) {
        return rtf.format(diffInYears, 'year');
      } else if (Math.abs(diffInMonths) >= 1) {
        return rtf.format(diffInMonths, 'month');
      } else if (Math.abs(diffInWeeks) >= 1) {
        return rtf.format(diffInWeeks, 'week');
      } else if (Math.abs(diffInDays) >= 1) {
        return rtf.format(diffInDays, 'day');
      } else if (Math.abs(diffInHours) >= 1) {
        return rtf.format(diffInHours, 'hour');
      } else if (Math.abs(diffInMinutes) >= 1) {
        return rtf.format(diffInMinutes, 'minute');
      } else {
        return rtf.format(diffInSeconds, 'second');
      }
    } catch (error) {
      console.error('Error formatting relative time:', error);
      return date.toLocaleDateString(locale);
    }
  }

  /**
   * Format file size based on locale
   */
  static formatFileSize(locale: Locale, bytes: number): string {
    try {
      const formatter = new Intl.NumberFormat(locale, {
        style: 'unit',
        unit: 'byte',
        unitDisplay: 'short',
      });

      if (bytes < 1024) {
        return formatter.format(bytes);
      } else if (bytes < 1024 * 1024) {
        return formatter.format(bytes / 1024) + ' KB';
      } else if (bytes < 1024 * 1024 * 1024) {
        return formatter.format(bytes / (1024 * 1024)) + ' MB';
      } else if (bytes < 1024 * 1024 * 1024 * 1024) {
        return formatter.format(bytes / (1024 * 1024 * 1024)) + ' GB';
      } else {
        return formatter.format(bytes / (1024 * 1024 * 1024 * 1024)) + ' TB';
      }
    } catch (error) {
      console.error('Error formatting file size:', error);
      return `${bytes} bytes`;
    }
  }

  /**
   * Format duration based on locale
   */
  static formatDuration(locale: Locale, seconds: number): string {
    try {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;

      const parts: string[] = [];

      if (hours > 0) {
        parts.push(`${hours}h`);
      }
      if (minutes > 0) {
        parts.push(`${minutes}m`);
      }
      if (remainingSeconds > 0 || parts.length === 0) {
        parts.push(`${remainingSeconds}s`);
      }

      return parts.join(' ');
    } catch (error) {
      console.error('Error formatting duration:', error);
      return `${seconds}s`;
    }
  }

  /**
   * Format percentage based on locale
   */
  static formatPercentage(locale: Locale, value: number, precision: number = 1): string {
    try {
      const formatter = new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      });

      return formatter.format(value / 100);
    } catch (error) {
      console.error('Error formatting percentage:', error);
      return `${value.toFixed(precision)}%`;
    }
  }

  /**
   * Get available timezones for a locale
   */
  static getAvailableTimezones(locale: Locale): string[] {
    return timezones[locale] || ['UTC'];
  }

  /**
   * Get currency code for a locale
   */
  static getCurrencyCode(locale: Locale): string {
    return currencyCodes[locale] || 'USD';
  }

  /**
   * Convert timezone
   */
  static convertTimezone(
    date: Date,
    fromTimezone: string,
    toTimezone: string
  ): Date {
    try {
      // Create a date in the source timezone
      const sourceDate = new Date(date.toLocaleString('en-US', { timeZone: fromTimezone }));
      
      // Convert to target timezone
      const targetDate = new Date(sourceDate.toLocaleString('en-US', { timeZone: toTimezone }));
      
      return targetDate;
    } catch (error) {
      console.error('Error converting timezone:', error);
      return date;
    }
  }

  /**
   * Get timezone offset
   */
  static getTimezoneOffset(timezone: string): number {
    try {
      const now = new Date();
      const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
      const target = new Date(utc.toLocaleString('en-US', { timeZone: timezone }));
      return (target.getTime() - utc.getTime()) / 60000;
    } catch (error) {
      console.error('Error getting timezone offset:', error);
      return 0;
    }
  }

  /**
   * Format timezone name
   */
  static formatTimezoneName(locale: Locale, timezone: string): string {
    try {
      const formatter = new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        timeZoneName: 'long',
      });

      const parts = formatter.formatToParts(new Date());
      const timeZoneName = parts.find(part => part.type === 'timeZoneName');
      
      return timeZoneName?.value || timezone;
    } catch (error) {
      console.error('Error formatting timezone name:', error);
      return timezone;
    }
  }

  /**
   * Format list of items
   */
  static formatList(locale: Locale, items: string[]): string {
    try {
      const formatter = new Intl.ListFormat(locale, {
        style: 'long',
        type: 'conjunction',
      });

      return formatter.format(items);
    } catch (error) {
      console.error('Error formatting list:', error);
      return items.join(', ');
    }
  }

  /**
   * Format plural forms
   */
  static formatPlural(
    locale: Locale,
    count: number,
    singular: string,
    plural: string
  ): string {
    try {
      const formatter = new Intl.PluralRules(locale);
      const rule = formatter.select(count);
      
      switch (rule) {
        case 'one':
          return `${count} ${singular}`;
        default:
          return `${count} ${plural}`;
      }
    } catch (error) {
      console.error('Error formatting plural:', error);
      return count === 1 ? `${count} ${singular}` : `${count} ${plural}`;
    }
  }
}
