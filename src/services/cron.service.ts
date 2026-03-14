import cron from "node-cron"
import moment from "moment-timezone"
import { UserRepository } from "../repositories/user.repository"
import { connectDB } from "../utils/db"
import "dotenv/config"

export class CronService {
  private userRepository: UserRepository

  constructor() {
    this.userRepository = new UserRepository()
  }

  start() {
    console.log("Worker is starting, scheduling cron job every minute...")
    // Run every minute
    cron.schedule("* * * * *", async () => {
      try {
        await this.processBirthdays()
      } catch (error) {
        console.error("Error in cron job:", error)
      }
    })
  }

  async processBirthdays() {
    const users = await this.userRepository.findAll()

    for (const user of users) {
      const timezone = user.timezone
      if (!moment.tz.zone(timezone)) {
        continue
      }

      const userLocalTime = moment().tz(timezone)

      // Check if it's 9 AM (hour 9, minute 0)
      if (userLocalTime.hour() === 9 && userLocalTime.minute() === 0) {
        const userBirthday = moment(user.birthday).tz(timezone)

        if (
          userLocalTime.month() === userBirthday.month() &&
          userLocalTime.date() === userBirthday.date()
        ) {
          this.sendBirthdayMessage(user.email, user.name)
        }
      }
    }
  }

  private sendBirthdayMessage(email: string, name: string) {
    // Simulating sending an email or message
    console.log(`Sending Happy Birthday message to ${email} (Name: ${name})`)
    console.log(`"Happy Birthday, ${name}!"`)
  }
}

// If run as a standalone worker process
if (require.main === module) {
  ;(async () => {
    await connectDB()
    const cronService = new CronService()
    cronService.start()
  })()
}
