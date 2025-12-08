/**
 * Format price for display in UI
 * 
 * IMPORTANT: Database stores prices in Rials, but we display in Tomans
 * - Input: Price in Rials (e.g., 976500 from database)
 * - Output: Formatted price in Tomans (e.g., "۹۷,۶۵۰ تومان")
 * 
 * @param price - Price in Rials (from database)
 * @param locale - Locale for formatting (default: 'fa')
 * @returns Formatted price string in Tomans
 */
export function formatPrice(
  price: number | string | null | undefined,
  locale: string = 'fa'
): string {
  if (price === null || price === undefined) return locale === 'fa' ? '0 تومان' : '0';
  
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) return locale === 'fa' ? '0 تومان' : '0';
  
  // Convert Rials to Tomans (divide by 10)
  const tomanPrice = Math.round(numPrice / 10);
  
  // Format based on locale
  if (locale === 'fa') {
    const formatted = new Intl.NumberFormat('fa-IR').format(tomanPrice);
    return `${formatted} تومان`;
  } else if (locale === 'ar') {
    const formatted = new Intl.NumberFormat('ar-SA').format(tomanPrice);
    return `${formatted} تومان`;
  } else {
    // For English, show in USD equivalent (very rough conversion)
    const formatted = new Intl.NumberFormat('en-US').format(tomanPrice);
    return `${formatted} تومان`;
  }
}

/**
 * Format price in Tomans (legacy function - use formatPrice instead)
 * @deprecated Use formatPrice() instead
 */
export function formatPriceToman(price: number | string | null | undefined): string {
  return formatPrice(price, 'fa');
}

/**
 * Convert Rials to Tomans (for display purposes)
 */
export function rialsToTomans(rials: number): number {
  return Math.round(rials / 10);
}

/**
 * Convert Tomans to Rials (for database storage)
 */
export function tomansToRials(tomans: number): number {
  return tomans * 10;
}

/**
 * Format date to Persian calendar
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return '-';
    
    return dateObj.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return '-';
  }
}

/**
 * Format date and time to Persian calendar
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return '-';
    
    return dateObj.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '-';
  }
}

/**
 * Format relative time (e.g., "2 ساعت پیش")
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    if (diffInSeconds < 0) return 'در آینده';
    
    if (diffInSeconds < 60) return 'همین الان';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} دقیقه پیش`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ساعت پیش`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} روز پیش`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} هفته پیش`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} ماه پیش`;
    
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} سال پیش`;
  } catch {
    return '-';
  }
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 بایت';
  
  const k = 1024;
  const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format phone number with proper spacing
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '-';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    // Iranian mobile: 09123456789 -> 0912 345 6789
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  } else if (cleaned.length === 13 && cleaned.startsWith('98')) {
    // International format: 989123456789 -> +98 912 345 6789
    return `+98 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  
  return phone;
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  
  return text.slice(0, maxLength) + '...';
}

/**
 * Format number with Persian digits
 */
export function formatNumber(num: number | string): string {
  const numStr = num.toString();
  return new Intl.NumberFormat('fa-IR').format(parseFloat(numStr));
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format currency with symbol
 */
export function formatCurrency(amount: number, currency: string = 'IRR'): string {
  const formatted = new Intl.NumberFormat('fa-IR').format(amount);
  
  switch (currency) {
    case 'IRR':
      return `${formatted} ریال`;
    case 'USD':
      return `$${formatted}`;
    case 'EUR':
      return `€${formatted}`;
    default:
      return `${formatted} ${currency}`;
  }
}
