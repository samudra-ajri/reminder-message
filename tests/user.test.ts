import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"
import request from "supertest"
import app from "../src/app"
import { UserModel } from "../src/models/user.model"

let mongoServer: MongoMemoryServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  await mongoose.connect(uri)
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

beforeEach(async () => {
  await UserModel.deleteMany({})
})

describe("User API", () => {
  describe("POST /user", () => {
    it("should create a user with valid data", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        birthday: "1990-01-01T00:00:00.000Z",
        timezone: "Asia/Jakarta",
      }

      const res = await request(app).post("/user").send(userData)

      expect(res.status).toBe(201)
      expect(res.body.message).toBe("User created successfully")
      expect(res.body.user.name).toBe(userData.name)
      expect(res.body.user.email).toBe(userData.email)
    })

    it("should fail if email is invalid", async () => {
      const userData = {
        name: "John Doe",
        email: "invalid-email",
        birthday: "1990-01-01T00:00:00.000Z",
        timezone: "Asia/Jakarta",
      }

      const res = await request(app).post("/user").send(userData)

      expect(res.status).toBe(400)
      expect(res.body.error).toBeDefined()
    })

    it("should fail if birthday is not valid ISO 8601", async () => {
      const userData = {
        name: "John Doe",
        email: "john2@example.com",
        birthday: "01-01-1990",
        timezone: "Asia/Jakarta",
      }

      const res = await request(app).post("/user").send(userData)

      expect(res.status).toBe(400)
      expect(res.body.error).toBeDefined()
    })

    it("should fail if timezone is invalid", async () => {
      const userData = {
        name: "John Doe",
        email: "john3@example.com",
        birthday: "1990-01-01T00:00:00.000Z",
        timezone: "Invalid/Timezone",
      }

      const res = await request(app).post("/user").send(userData)

      expect(res.status).toBe(400)
      expect(res.body.error).toBe("Invalid timezone")
    })
  })

  describe("GET /user/:id", () => {
    it("should retrieve a user by id", async () => {
      const user = await UserModel.create({
        name: "Jane Doe",
        email: "jane@example.com",
        birthday: new Date("1995-05-05T00:00:00.000Z"),
        timezone: "America/New_York",
      })

      const res = await request(app).get(`/user/${user._id}`)

      expect(res.status).toBe(200)
      expect(res.body.name).toBe("Jane Doe")
    })
  })

  describe("PUT /user/:id", () => {
    it("should update user data", async () => {
      const user = await UserModel.create({
        name: "Mark",
        email: "mark@example.com",
        birthday: new Date("1995-05-05T00:00:00.000Z"),
        timezone: "America/New_York",
      })

      const res = await request(app)
        .put(`/user/${user._id}`)
        .send({ name: "Mark Updated" })

      expect(res.status).toBe(200)
      expect(res.body.user.name).toBe("Mark Updated")
    })
  })

  describe("DELETE /user/:id", () => {
    it("should delete user", async () => {
      const user = await UserModel.create({
        name: "Delete Me",
        email: "delete@example.com",
        birthday: new Date("1995-05-05T00:00:00.000Z"),
        timezone: "America/New_York",
      })

      const res = await request(app).delete(`/user/${user._id}`)

      expect(res.status).toBe(200)
      expect(res.body.message).toBe("User deleted successfully")

      const foundUser = await UserModel.findById(user._id)
      expect(foundUser).toBeNull()
    })
  })
})
