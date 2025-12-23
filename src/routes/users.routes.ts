import { Router } from "express";
import { getUserProfile } from "../controllers/users.controller.js";

const router = Router();

router.get("/users/:id", getUserProfile);

export default router;