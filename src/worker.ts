import { messageWorker } from './workers/messageWorker';

console.log('Starting Message Worker...');

// Attach error handlers
messageWorker.on('error', err => {
  console.error('Worker error:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing worker...');
  await messageWorker.close();
  process.exit(0);
});
