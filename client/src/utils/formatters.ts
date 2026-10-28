import i18n from '../i18n';

/**
 * Format currency amount with Indian digit grouping (e.g. ₹1,25,000)
 */
export const formatCurrency = (amount: number | string | undefined | null, customLang?: string): string => {
  const num = typeof amount === 'number' ? amount : Number(amount) || 0;
  try {
    const lang = customLang || i18n.language || 'en';
    const locale = lang === 'hi' ? 'hi-IN' : lang === 'ml' ? 'ml-IN' : 'en-IN';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `₹${num.toLocaleString('en-IN')}`;
  }
};

/**
 * Format numbers with locale-appropriate grouping
 */
export const formatNumber = (num: number | string | undefined | null, customLang?: string): string => {
  const n = typeof num === 'number' ? num : Number(num) || 0;
  try {
    const lang = customLang || i18n.language || 'en';
    const locale = lang === 'hi' ? 'hi-IN' : lang === 'ml' ? 'ml-IN' : 'en-IN';
    return new Intl.NumberFormat(locale).format(n);
  } catch {
    return n.toLocaleString('en-IN');
  }
};

/**
 * Format dates per locale
 */
export const formatDate = (
  date: string | Date | undefined | null,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    const lang = i18n.language || 'en';
    const locale = lang === 'hi' ? 'hi-IN' : lang === 'ml' ? 'ml-IN' : 'en-IN';
    return new Intl.DateTimeFormat(locale, options || {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return String(date);
  }
};

/**
 * Format times per locale
 */
export const formatTime = (date: string | Date | undefined | null): string => {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    const lang = i18n.language || 'en';
    const locale = lang === 'hi' ? 'hi-IN' : lang === 'ml' ? 'ml-IN' : 'en-IN';
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return String(date);
  }
};
