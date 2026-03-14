import "dotenv/config"
import { connectDB } from "./utils/db"
import { CronService } from "./services/cron.service"

const startWorker = async () => {
  try {
    await connectDB()
    const cronService = new CronService()
    cronService.start()
    console.log("Birthday Message Worker started successfully.")
  } catch (error) {
    console.error("Failed to start worker:", error)
    process.exit(1)
  }
}

startWorker()
