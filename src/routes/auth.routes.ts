import { Router } from "express";
import passport from "passport";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import {
  loginValidator,
  registerValidator,
  validate,
} from "../middlewares/validators.js";
import { isBanned } from "../middlewares/isBanned.js";

const router = Router();

router.post("/register", registerValidator, validate, register);

router.post(
  "/login",
  loginValidator,
  validate,
  passport.authenticate("local", { session: false }),
  isBanned,
  login,
);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:userId", resetPassword);

export default router;
