import { UserModel, IUser } from "../models/user.model"

export class UserRepository {
  async create(data: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(data)
    return await user.save()
  }

  async findById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id)
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email })
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, data, { new: true })
  }

  async delete(id: string): Promise<IUser | null> {
    return await UserModel.findByIdAndDelete(id)
  }

  async findAll(): Promise<IUser[]> {
    return await UserModel.find()
  }

  async getDistinctTimezones(): Promise<string[]> {
    return await UserModel.distinct("timezone")
  }

  async findUsersWithBirthdayToday(
    timezonesAt9AM: string[],
    targetConditions: { timezones: string[]; month: number; day: number }[],
  ): Promise<IUser[]> {
    if (timezonesAt9AM.length === 0 || targetConditions.length === 0) {
      return []
    }

    const orConditions = targetConditions.map((condition) => ({
      timezone: { $in: condition.timezones },
      "localBirthday.month": condition.month,
      "localBirthday.day": condition.day,
    }))

    return await UserModel.aggregate([
      {
        $match: {
          timezone: { $in: timezonesAt9AM },
        },
      },
      {
        $addFields: {
          localBirthday: {
            $dateToParts: { date: "$birthday", timezone: "$timezone" },
          },
        },
      },
      {
        $match: {
          $or: orConditions,
        },
      },
    ])
  }
}
