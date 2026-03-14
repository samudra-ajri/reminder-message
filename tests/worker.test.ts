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

    userRepositoryMock.findAll.mockResolvedValue([mockUser])

    // Mock Date.now inside processBirthdays
    jest.spyOn(Date, "now").mockImplementation(() => mockDate.getTime())

    await cronService.processBirthdays()

    expect(console.log).toHaveBeenCalledWith(
      "Sending Happy Birthday message to sam@example.com (Name: Sam)",
    )
    expect(console.log).toHaveBeenCalledWith('"Happy Birthday, Sam!"')
  })

  it("should NOT send message if it is not 9 AM", async () => {
    const currentTime = moment.tz("Asia/Jakarta")
    const mockDate = currentTime
      .hour(8)
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

    userRepositoryMock.findAll.mockResolvedValue([mockUser])

    jest.spyOn(Date, "now").mockImplementation(() => mockDate.getTime())

    await cronService.processBirthdays()

    expect(console.log).not.toHaveBeenCalledWith(
      "Sending Happy Birthday message to sam@example.com (Name: Sam)",
    )
  })
})
