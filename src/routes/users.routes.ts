import { Router } from "express";
import * as UsersController from "../controllers/users.controller.js";

const router = Router();

router.get('/users/:id', UsersController.getUserProfile);
router.patch('/users/me', UsersController.updateUserProfileFields);

export default router;