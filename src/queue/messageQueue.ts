import { Queue, QueueOptions } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
};

const queueOptions: QueueOptions = {
  connection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3, // Initial simple backoff handled by BullMQ defaults
    backoff: {
      type: 'exponential',
      delay: 1000, 
    },
  },
};

export const birthdayMessageQueue = new Queue('birthdayMessageQueue', queueOptions);

export async function addGreetingJob(data: { userId: number; eventYear: number; eventType: string; emailData: any }) {
  await birthdayMessageQueue.add('sendGreeting', data, {
    jobId: `${data.eventType}-${data.userId}-${data.eventYear}` // Used for basic queue deduplication (idempotency within queue)
  });
}
