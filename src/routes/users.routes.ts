import { Router } from "express";
import * as UsersController from "../controllers/users.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// Just add authenticate before every protected route

router.get('/users/me', authenticate, UsersController.getThisUserProfile);
router.get('/users/:id', authenticate, UsersController.getUserProfile);

export default router;