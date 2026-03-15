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
    // Determine which timezones are currently at exactly 9:00 AM
    // Optimize by only checking timezones that are actually used by users in the database
    const allTimezones = await this.userRepository.getDistinctTimezones()
    const targetConditionsMap: Record<
      string,
      { timezones: string[]; month: number; day: number }
    > = {}
    const timezonesAt9AM: string[] = []

    for (const tz of allTimezones) {
      const time = moment().tz(tz)
      if (time.hour() === 9 && time.minute() === 0) {
        timezonesAt9AM.push(tz)
        const month = time.month() + 1 // MongoDB $dateToParts uses 1-12
        const day = time.date()
        const key = `${month}-${day}`

        if (!targetConditionsMap[key]) {
          targetConditionsMap[key] = { timezones: [], month, day }
        }
        targetConditionsMap[key].timezones.push(tz)
      }
    }

    if (timezonesAt9AM.length === 0) {
      return
    }

    const targetConditions = Object.values(targetConditionsMap)

    // Only fetch users who match the timezone and local birthday criteria
    const users = await this.userRepository.findUsersWithBirthdayToday(
      timezonesAt9AM,
      targetConditions,
    )

    for (const user of users) {
      this.sendBirthdayMessage(user.email, user.name)
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
