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
}
