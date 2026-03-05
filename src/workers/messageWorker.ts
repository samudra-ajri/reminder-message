import { Worker, Job } from 'bullmq';
import axios from 'axios';
import { prisma } from '../utils/prisma';
import { MessageStatus, MessageType } from '../constants/message.constants';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
};

const externalEmailApiUrl = process.env.EXTERNAL_EMAIL_API_URL || 'https://email-service.digitalenvision.com.au/send';

export const messageWorker = new Worker(
  'birthdayMessageQueue',
  async (job: Job) => {
    const { userId, eventYear, eventType, emailData } = job.data;
    
    // Recovery & Idempotency check:
    // Try to record the message as PENDING or SENT. If it is already in the outbox matching the eventType + eventYear,
    // another job already handled it.
    let outboxMessage;
    try {
      outboxMessage = await prisma.outboxMessage.upsert({
        where: {
          userId_eventYear_eventType: {
            userId,
            eventYear,
            eventType: eventType,
          },
        },
        update: {}, // Don't update if exists
        create: {
          userId,
          eventYear,
          eventType,
          status: MessageStatus.PENDING,
        },
      });
      
      // If the message was already sent successfully, we don't try again
      if (outboxMessage.status === MessageStatus.SENT) {
        return;
      }
    } catch (e: any) {
      if (e.code === 'P2002') {
         // Race condition caught by UNIQUE constraint. Skip gracefully.
         return;
      }
      throw e;
    }

    try {
      // Execute external call
      const response = await axios.post(externalEmailApiUrl, {
        email: emailData.email,
        message: emailData.message,
      }, {
        timeout: 5000, // Handle timeout
      });

      if (response.status >= 200 && response.status < 300) {
        // Mark as sent
        await prisma.outboxMessage.update({
          where: { id: outboxMessage.id },
          data: { status: MessageStatus.SENT, sentAt: new Date() },
        });
      } else {
        throw new Error(`External API returned status ${response.status}`);
      }
    } catch (error: any) {
      // We do not change status to FAILED immediately, because BullMQ will retry due to exponential backoff.
      // The final failure status could be updated by a queue listener if needed.
      console.error(`Error sending message for user ${userId}:`, error.message);
      throw error; // Let BullMQ catch this and apply retry with backoff
    }
  },
  { connection }
);

messageWorker.on('completed', job => {
  console.log(`Job ${job.id} has completed successfully`);
});

messageWorker.on('failed', (job, err) => {
  console.log(`Job ${job?.id} has failed with ${err.message}`);
});
