import { Router } from "express";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import passport from "passport";

const router = Router();

router.post("/register", register);

router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  login,
);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:id", resetPassword);

export default router;
