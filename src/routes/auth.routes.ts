import { Router } from "express";
import * as AuthController from "../controllers/auth.controller.js";

const router = Router();

router.post('auth/register', AuthController.register);
router.post('auth/login', AuthController.login);

export default router;