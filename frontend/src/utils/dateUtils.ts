// Safe date formatter utility
import { format as dateFnsFormat } from 'date-fns';
import { de } from 'date-fns/locale';

export const safeFormatDate = (
  date: string | Date | null | undefined,
  formatStr: string = 'dd.MM.yyyy',
  fallback: string = '-'
): string => {
  if (!date) return fallback;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date:', date);
      return fallback;
    }
    
    return dateFnsFormat(dateObj, formatStr, { locale: de });
  } catch (error) {
    console.error('Error formatting date:', date, error);
    return fallback;
  }
};
