import { check, validationResult } from "express-validator";
import type { Request, Response, NextFunction } from "express";

const loginValidator = [
  check("identifier").notEmpty().withMessage("Enter your email or username."),

  check("password")
    .notEmpty()
    .withMessage("Enter your password")
    .isLength({ min: 8, max: 64 })
    .withMessage("Password length must be between 8 and 64 characters."),
];

const registerValidator = [
  check("username")
    .notEmpty()
    .withMessage("Enter your username.")
    .isLength({ min: 2, max: 50 })
    .withMessage("username length must be between 2 and 50 characters."),

  check("email")
    .notEmpty()
    .withMessage("Enter your email.")
    .isEmail()
    .withMessage("Invalid email."),

  check("password")
    .notEmpty()
    .withMessage("Enter your password.")
    .isLength({ min: 8, max: 64 })
    .withMessage("Password length must be between 8 and 64 characters."),
];

const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      errors: errors.array(),
    });
  }
  next();
};

export { loginValidator, registerValidator, validate };
