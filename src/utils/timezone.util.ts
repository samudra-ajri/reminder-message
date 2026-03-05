import { DateTime } from 'luxon';

export class TimezoneUtil {
  /**
   * Checks if it is past or exactly 9:00 AM today for a given timezone.
   * Also returns the local date details to help query birthdays.
   */
  static isTimeToSendBirthdayMessage(location: string, nowUtc: Date = new Date()): {
    shouldSend: boolean;
    currentMonth: number;
    currentDay: number;
    currentYear: number;
  } {
    const localTime = DateTime.fromJSDate(nowUtc).setZone(location);
    
    if (!localTime.isValid) {
      throw new Error(`Invalid timezone: ${location}`);
    }

    return {
      shouldSend: localTime.hour >= 9, // 9 a.m.
      currentMonth: localTime.month,
      currentDay: localTime.day,
      currentYear: localTime.year,
    };
  }
}
