import { format, parseISO, isValid } from 'date-fns';

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Never';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Invalid date';
    
    return format(date, 'MMM dd, yyyy HH:mm');
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
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return format(date, 'MMM dd, yyyy');
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
