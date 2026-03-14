import { Request, Response } from "express"
import { UserService } from "../services/user.service"
import Joi from "joi"

const createUserSchema = Joi.object({
  name: Joi.string().min(1).required().messages({
    "string.empty": "Name is required",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email address",
    "any.required": "Email is required",
  }),
  birthday: Joi.string().isoDate().required().messages({
    "string.isoDate": "Birthday must be a valid ISO 8601 date",
    "any.required": "Birthday is required",
  }),
  timezone: Joi.string().min(1).required().messages({
    "string.empty": "Timezone is required",
    "any.required": "Timezone is required",
  }),
})

const updateUserSchema = Joi.object({
  name: Joi.string().min(1).optional(),
  email: Joi.string().email().optional(),
  birthday: Joi.string().isoDate().optional().messages({
    "string.isoDate": "Birthday must be a valid ISO 8601 date",
  }),
  timezone: Joi.string().min(1).optional(),
})

export class UserController {
  private userService: UserService

  constructor() {
    this.userService = new UserService()
  }

  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, value } = createUserSchema.validate(req.body, {
        abortEarly: false,
      })
      if (error) {
        res.status(400).json({ error: error.details.map((err) => err.message) })
        return
      }
      const user = await this.userService.createUser(value)
      res.status(201).json({ message: "User created successfully", user })
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  }

  getUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      const user = await this.userService.getUserById(id as string)
      if (!user) {
        res.status(404).json({ error: "User not found" })
        return
      }
      res.status(200).json(user)
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  }

  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, value } = updateUserSchema.validate(req.body, {
        abortEarly: false,
      })
      if (error) {
        res.status(400).json({ error: error.details.map((err) => err.message) })
        return
      }
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      const user = await this.userService.updateUser(id as string, value)
      if (!user) {
        res.status(404).json({ error: "User not found" })
        return
      }
      res.status(200).json({ message: "User updated successfully", user })
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  }

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      const user = await this.userService.deleteUser(id as string)
      if (!user) {
        res.status(404).json({ error: "User not found" })
        return
      }
      res.status(200).json({ message: "User deleted successfully" })
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  }
}
