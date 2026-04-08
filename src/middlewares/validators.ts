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

const questionValidator = [
  check("title")
    .notEmpty()
    .withMessage("Enter question title")
    .isLength({ min: 15, max: 150 })
    .withMessage(
      "title length must be at least 15 characters and 100 at most characters.",
    ),

  check("body")
    .notEmpty()
    .withMessage("Enter a question body")
    .isLength({ min: 15 })
    .withMessage("question body length must be at least 15 characters."),

  check("tags")
    .isArray({ min: 1 })
    .withMessage("tags must be an array and at least has one tag."),
];

const answerValidator = [
  check("body")
    .notEmpty()
    .withMessage("Enter an answer")
    .isLength({ min: 15 })
    .withMessage("answer length must be at least 15 characters."),
];

const commentValidator = [
  check("body")
    .notEmpty()
    .withMessage("Enter a comment")
    .isLength({ min: 15 })
    .withMessage("comment length must be at least 15 characters."),
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

export {
  loginValidator,
  registerValidator,
  questionValidator,
  answerValidator,
  commentValidator,
  validate,
};
