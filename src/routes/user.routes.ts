import { Router } from "express"
import { UserController } from "../controllers/user.controller"

const router = Router()
const userController = new UserController()

router.post("/user", userController.createUser)
router.get("/user/:id", userController.getUser)
router.put("/user/:id", userController.updateUser)
router.delete("/user/:id", userController.deleteUser)

export default router
