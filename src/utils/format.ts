/**
 * Formats a number as currency based on the user's locale.
 * @param amount The number to format.
 * @param currency The currency code (e.g., 'USD', 'EUR', 'ZAR').
 * @param locale The locale string (e.g., 'en-US', 'en-ZA').
 */
export const formatCurrency = (
  amount: number, 
  currency: string = 'USD', 
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formats a date based on the user's locale.
 * @param date The date to format.
 * @param locale The locale string.
 */
export const formatDate = (
  date: Date | string | number, 
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat(locale, options).format(d);
};

/**
 * Formats a number with suffixes (K, M, B).
 */
export const formatCompactNumber = (number: number, locale: string = 'en-US'): string => {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(number);
};
