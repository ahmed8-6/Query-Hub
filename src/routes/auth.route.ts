import { Router } from "express";
import passport from "passport";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);

router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  login,
);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:userId", resetPassword);

export default router;
