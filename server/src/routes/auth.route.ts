import express from "express";
import {
  signup,
  login,
  getCurrentUser,
  logout,
} from "../controllers/auth.controller";

import { protect } from "../middleware/auth.middleware";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getCurrentUser);
router.post("/logout", logout);
export default router;