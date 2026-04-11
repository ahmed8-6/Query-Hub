import { Router } from "express";
import passport from "passport";
import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import {
  loginValidator,
  registerValidator,
  validate,
} from "../middlewares/validators.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = Router();

router.post("/register", registerValidator, validate, register);

router.post("/login", loginValidator, validate, login);

router.post("/logout", isAuth, logout);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:userId", resetPassword);

export default router;
