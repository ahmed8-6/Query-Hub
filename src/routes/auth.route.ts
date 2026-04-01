import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import passport from "passport";

const router = Router();

router.post("/register", register);

router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  login,
);

export default router;
