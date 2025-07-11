import { formatDate, formatRelativeDate } from './formatters';

describe('formatters', () => {
  describe('formatDate', () => {
    it('should return "Never" for null or undefined dates', () => {
      expect(formatDate(null)).toBe('Never');
    });

    it('should format GMT date correctly', () => {
      const date = '2025-12-31T23:59:59.999Z';
      expect(formatDate(date)).toBe('Dec 31, 2025 23:59 +00');
    });

    it('should preserve timezone offset in formatted date', () => {
      const date = '2025-12-31T23:59:59+02:00';
      expect(formatDate(date)).toBe('Dec 31, 2025 23:59 +02:00');
    });

    it('should handle negative timezone offset', () => {
      const date = '2025-12-31T23:59:59-05:00';
      expect(formatDate(date)).toBe('Dec 31, 2025 23:59 -05:00');
    });

    it('should assume GMT for dates without timezone info', () => {
      const date = '2025-12-31T23:59:59';
      expect(formatDate(date)).toBe('Dec 31, 2025 23:59 +00');
    });
  });

  describe('formatRelativeDate', () => {
    it('should return "Just now" for a date less than a minute ago', () => {
      const date = new Date();
      expect(formatRelativeDate(date.toISOString())).toBe('Just now');
    });

    it('should return "5 minutes ago"', () => {
      const date = new Date();
      date.setMinutes(date.getMinutes() - 5);
      expect(formatRelativeDate(date.toISOString())).toBe('5 minutes ago');
    });

    it('should return "3 hours ago"', () => {
      const date = new Date();
      date.setHours(date.getHours() - 3);
      expect(formatRelativeDate(date.toISOString())).toBe('3 hours ago');
    });

    it('should return "2 days ago"', () => {
      const date = new Date();
      date.setDate(date.getDate() - 2);
      expect(formatRelativeDate(date.toISOString())).toBe('2 days ago');
    });

    it('should handle future dates correctly', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const result = formatRelativeDate(futureDate.toISOString());
      // The result should not be "Just now" for a future date
      expect(result).not.toBe('Just now');
      // It should contain "in" and "day" for a future date
      expect(result).toMatch(/in.*day/);
    });
  });
});
