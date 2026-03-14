import { UserRepository } from "../repositories/user.repository"
import { IUser } from "../models/user.model"
import moment from "moment-timezone"

export class UserService {
  private userRepository: UserRepository

  constructor() {
    this.userRepository = new UserRepository()
  }

  async createUser(data: {
    name: string
    email: string
    birthday: string
    timezone: string
  }): Promise<IUser> {
    const existingUser = await this.userRepository.findByEmail(data.email)
    if (existingUser) {
      throw new Error("Email already exists")
    }

    if (!moment.tz.zone(data.timezone)) {
      throw new Error("Invalid timezone")
    }

    const birthdayDate = new Date(data.birthday)
    if (isNaN(birthdayDate.getTime())) {
      throw new Error("Invalid birthday date")
    }

    return await this.userRepository.create({
      name: data.name,
      email: data.email,
      birthday: birthdayDate,
      timezone: data.timezone,
    })
  }

  async getUserById(id: string): Promise<IUser | null> {
    return await this.userRepository.findById(id)
  }

  async updateUser(
    id: string,
    data: Partial<{
      name: string
      email: string
      birthday: string
      timezone: string
    }>,
  ): Promise<IUser | null> {
    if (data.email) {
      const existingUser = await this.userRepository.findByEmail(data.email)
      if (existingUser && existingUser._id.toString() !== id) {
        throw new Error("Email already exists")
      }
    }

    if (data.timezone && !moment.tz.zone(data.timezone)) {
      throw new Error("Invalid timezone")
    }

    const updateData: any = { ...data }
    if (data.birthday) {
      const birthdayDate = new Date(data.birthday)
      if (isNaN(birthdayDate.getTime())) {
        throw new Error("Invalid birthday date")
      }
      updateData.birthday = birthdayDate
    }

    return await this.userRepository.update(id, updateData)
  }

  async deleteUser(id: string): Promise<IUser | null> {
    return await this.userRepository.delete(id)
  }

  async getAllUsers(): Promise<IUser[]> {
    return await this.userRepository.findAll()
  }
}
