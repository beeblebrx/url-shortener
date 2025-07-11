import { parseISO, isValid, formatDistanceToNowStrict } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Never';

  try {
    // Extract timezone from the original string
    const timezoneMatch = dateString.match(/([+-]\d{2}:?\d{2}|Z)$/);
    
    if (timezoneMatch) {
      const date = parseISO(dateString);
      if (!isValid(date)) return 'Invalid date';
      
      const tz = timezoneMatch[1];
      if (tz === 'Z') {
        // UTC timezone - format in UTC and show +00
        return formatInTimeZone(date, 'UTC', 'MMM dd, yyyy HH:mm') + ' +00';
      } else {
        // Offset timezone - format in that timezone and append the original offset
        return formatInTimeZone(date, tz, 'MMM dd, yyyy HH:mm') + ' ' + tz;
      }
    }
    
    // No timezone info - treat as UTC by appending Z and parsing
    const utcDateString = dateString + 'Z';
    const date = parseISO(utcDateString);
    if (!isValid(date)) return 'Invalid date';
    
    return formatInTimeZone(date, 'UTC', 'MMM dd, yyyy HH:mm') + ' +00';
  } catch (error) {
    return 'Invalid date';
  }
};

export const formatRelativeDate = (dateString: string | null): string => {
  if (!dateString) return 'Never';

  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Invalid date';

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds >= 0 && diffInSeconds < 60) {
      return 'Just now';
    }

    return formatDistanceToNowStrict(date, { addSuffix: true });
  } catch (error) {
    return 'Invalid date';
  }
};

export const isExpired = (expiresAt: string | null, isPermanent: boolean): boolean => {
  if (isPermanent || !expiresAt) return false;
  
  try {
    const expireDate = parseISO(expiresAt);
    if (!isValid(expireDate)) return false;
    
    return new Date() > expireDate;
  } catch (error) {
    return false;
  }
};

export const truncateUrl = (url: string, maxLength: number = 50): string => {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength - 3) + '...';
};

export const formatClickCount = (count: number): string => {
  if (count === 0) return 'No clicks';
  if (count === 1) return '1 click';
  if (count < 1000) return `${count} clicks`;
  if (count < 1000000) return `${(count / 1000).toFixed(1)}k clicks`;
  return `${(count / 1000000).toFixed(1)}M clicks`;
};
