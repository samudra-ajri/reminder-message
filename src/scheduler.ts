import cron from 'node-cron';
import { CronService } from './services/cron.service';

const cronService = new CronService();

console.log('Starting Cron Scheduler...');

// Run at the top of every hour (0 * * * *)
cron.schedule('0 * * * *', async () => {
  try {
    await cronService.processBirthdaysAndSchedules();
  } catch (error) {
    console.error('Error executing cron job:', error);
  }
});

// Since the application might start at an arbitrary time, optionally run it immediately once:
setTimeout(async () => {
    try {
        await cronService.processBirthdaysAndSchedules();
    } catch (error) {
        console.error('Error executing initial cron job:', error);
    }
}, 5000);

// Keep the process alive
process.on('SIGINT', () => {
    console.log('Scheduler shutting down');
    process.exit(0);
});
