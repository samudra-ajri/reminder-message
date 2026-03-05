import { prisma } from '../utils/prisma';
import { addGreetingJob } from '../queue/messageQueue';
import { TimezoneUtil } from '../utils/timezone.util';
import { MessageStatus, MessageType } from '../constants/message.constants';

export class CronService {
  async processBirthdaysAndSchedules() {
    console.log(`Running cron job at UTC: ${new Date().toISOString()}`);

    // Get all distinct timezones from our users
    const uniqueLocations = await prisma.user.findMany({
      select: { location: true },
      distinct: ['location'],
    });

    const now = new Date();

    for (const { location } of uniqueLocations) {
      try {
        const { shouldSend, currentMonth, currentDay, currentYear } = TimezoneUtil.isTimeToSendBirthdayMessage(location, now);

        if (shouldSend) {
          const usersToGreet = await prisma.$queryRaw<any[]>`
            SELECT u.id, u."firstName", u."lastName"
            FROM "User" u
            LEFT JOIN "OutboxMessage" o 
              ON u.id = o."userId" 
              AND o."eventYear" = ${currentYear} 
              AND o."eventType" = ${MessageType.BIRTHDAY}
              AND o.status = ${MessageStatus.SENT}
            WHERE u.location = ${location}
              AND EXTRACT(MONTH FROM u.birthday) = ${currentMonth}
              AND EXTRACT(DAY FROM u.birthday) = ${currentDay}
              AND o.id IS NULL
          `;

          for (const user of usersToGreet) {
            const fullName = `${user.firstName} ${user.lastName}`;
            const message = `Hey, ${fullName} it's your birthday`;
            
            await addGreetingJob({
              userId: user.id,
              eventYear: currentYear,
              eventType: MessageType.BIRTHDAY,
              emailData: { message }
            });
          }
        }
      } catch (error: any) {
        console.warn(`Error processing location ${location}:`, error.message);
      }
    }
  }
}
