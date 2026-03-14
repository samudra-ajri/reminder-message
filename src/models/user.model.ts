import mongoose, { Schema, Document } from "mongoose"

export interface IUser extends Document {
  name: string
  email: string
  birthday: Date
  timezone: string
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    birthday: { type: Date, required: true },
    timezone: { type: String, required: true },
  },
  {
    timestamps: true,
  },
)

export const UserModel = mongoose.model<IUser>("User", UserSchema)
