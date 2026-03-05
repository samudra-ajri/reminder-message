import { TimezoneUtil } from '../../src/utils/timezone.util';
import { DateTime } from 'luxon';

describe('TimezoneUtil', () => {
  it('should return shouldSend=true when it is exactly 9:00 AM locally in New York', () => {
    // Let's mock the UTC time to an exact moment
    // 9:00 AM in New York (EST, UTC-5) would be 14:00 (2:00 PM) UTC during standard time.
    // Luxon handles standard/daylight gracefully. Assuming standard time here.
    const mockUtcDate = DateTime.fromObject({ year: 2026, month: 11, day: 1, hour: 14, minute: 0 }, { zone: 'utc' }).toJSDate();
    
    // Test New York
    const resultNY = TimezoneUtil.isTimeToSendBirthdayMessage('America/New_York', mockUtcDate);
    
    expect(resultNY.shouldSend).toBe(true);
    // Since it's Nov 1 in NY
    expect(resultNY.currentMonth).toBe(11);
    expect(resultNY.currentDay).toBe(1);
    expect(resultNY.currentYear).toBe(2026);
  });

  it('should return shouldSend=false when it is 8:59 AM locally in New York', () => {
    // 8:59 AM in New York is 13:59 UTC
    const mockUtcDate = DateTime.fromObject({ year: 2026, month: 11, day: 1, hour: 13, minute: 59 }, { zone: 'utc' }).toJSDate();
    
    const resultNY = TimezoneUtil.isTimeToSendBirthdayMessage('America/New_York', mockUtcDate);
    
    expect(resultNY.shouldSend).toBe(false);
  });

  it('should return shouldSend=true when it is past 9:00 AM (e.g. 11:30 AM) in Melbourne (Testing Recovery)', () => {
    // Melbourne is typically UTC+10 or UTC+11.
    // If it's Nov 1, Melbourne is UTC+11.
    // 11:30 AM in Melbourne is 00:30 UTC of the SAME day.
    const mockUtcDate = DateTime.fromObject({ year: 2026, month: 11, day: 1, hour: 0, minute: 30 }, { zone: 'utc' }).toJSDate();
    
    const resultMelbourne = TimezoneUtil.isTimeToSendBirthdayMessage('Australia/Melbourne', mockUtcDate);
    
    expect(resultMelbourne.shouldSend).toBe(true);
    expect(resultMelbourne.currentMonth).toBe(11);
    expect(resultMelbourne.currentDay).toBe(1);
  });

  it('should throw an error for invalid timezones', () => {
    expect(() => {
      TimezoneUtil.isTimeToSendBirthdayMessage('Invalid/Zone');
    }).toThrow('Invalid timezone: Invalid/Zone');
  });
});
