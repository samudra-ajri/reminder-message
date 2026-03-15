import { CronService } from "../src/services/cron.service"
import { UserRepository } from "../src/repositories/user.repository"
import moment from "moment-timezone"

// Mock UserRepository
jest.mock("../src/repositories/user.repository")

describe("Worker Functionality", () => {
  let cronService: CronService
  let userRepositoryMock: jest.Mocked<UserRepository>

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, "log").mockImplementation(() => {})

    userRepositoryMock = new UserRepository() as jest.Mocked<UserRepository>

    // Replace the repository in cronService with our mock
    cronService = new CronService()
    ;(cronService as any).userRepository = userRepositoryMock
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("should send happy birthday message to user at 9 AM local time on their birthday", async () => {
    // We will set the system time to exactly 9 AM in Jakarta
    const currentTime = moment.tz("Asia/Jakarta")
    const mockDate = currentTime
      .hour(9)
      .minute(0)
      .second(0)
      .millisecond(0)
      .toDate()

    const mockUser: any = {
      name: "Sam",
      email: "sam@example.com",
      birthday: mockDate,
      timezone: "Asia/Jakarta",
    }

    // Mock system time to be exactly 9 AM in Jakarta
    jest.useFakeTimers()
    jest.setSystemTime(mockDate)

    userRepositoryMock.getDistinctTimezones.mockResolvedValue(["Asia/Jakarta"])
    userRepositoryMock.findUsersWithBirthdayToday.mockResolvedValue([mockUser])

    await cronService.processBirthdays()

    expect(console.log).toHaveBeenCalledWith(
      "Sending Happy Birthday message to sam@example.com (Name: Sam)",
    )
    expect(console.log).toHaveBeenCalledWith('"Happy Birthday, Sam!"')

    // Verify repository was called correctly
    expect(userRepositoryMock.findUsersWithBirthdayToday).toHaveBeenCalled()

    jest.useRealTimers()
  })

  it("should NOT send message if there are no users at 9 AM", async () => {
    const currentTime = moment.tz("Asia/Jakarta")
    const mockDate = currentTime
      .hour(8) // System time is 8 AM in Jakarta
      .minute(0)
      .second(0)
      .millisecond(0)
      .toDate()

    jest.useFakeTimers()
    jest.setSystemTime(mockDate)

    userRepositoryMock.getDistinctTimezones.mockResolvedValue(["Asia/Jakarta"])
    // Return empty array to simulate database behavior when no users match
    userRepositoryMock.findUsersWithBirthdayToday.mockResolvedValue([])

    await cronService.processBirthdays()

    expect(console.log).not.toHaveBeenCalledWith(
      "Sending Happy Birthday message to sam@example.com (Name: Sam)",
    )

    jest.useRealTimers()
  })
})
