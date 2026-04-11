import { User } from "../models/user.model.js";
import type { Request, Response, NextFunction } from "express";
import { hash } from "bcrypt";
import { createToken } from "../utils/jwt.js";
import type { UserDocument } from "../models/user.model.js";
import nodemailer from "nodemailer";
import { addToBlacklist } from "../utils/tokenBlacklist.js";
import passport from "passport";

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email already in use" });
    }
    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: "Username already in use" });
    }
    const hashedPassword = await hash(password, 10);
    const newUser = new User({
      username: username,
      email: email,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({
      status: "success",
      message: "User created successfully",
      user: { id: newUser._id, username: newUser.username },
    });
  } catch (error) {
    next(error);
  }
};

const login = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "local",
    { session: false },
    (err: Error, user: UserDocument, info: { message: string }) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({
          status: "fail",
          message: info?.message || "Auth failed",
        });
      }

      if (user.isBanned) {
        return res.status(403).json({
          status: "fail",
          message: `Your account has been banned. Reason: ${user.banReason}`,
        });
      }

      const token = createToken(user);

      res.status(200).json({
        status: "success",
        token,
        data: {
          userId: user._id,
          username: user.username,
          email: user.email,
        },
      });
    },
  )(req, res, next);
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(400).json({ success: false, message: "No token provided" });
      return;
    }

    addToBlacklist(token);

    res
      .status(200)
      .json({ status: "success", message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const identifier = req.body.username || req.body.email;
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });
    if (!user) {
      res.status(404).json({
        status: "fail",
        message: "user not found",
      });
    }
    const email = user?.email;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
    });
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Reset Password",
      text: `Your code verification to reset password is: ${code}`,
    };

    transporter.sendMail(mailOptions, function (error, success) {
      if (error) {
        return res.status(500).json({
          status: "fail",
          message: error.message,
        });
      }
      res.status(200).json({
        status: "success",
        message: "Email sent successfully",
        messageId: success.messageId,
      });
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { password } = req.body;
    const { userId } = req.params;
    const user = (await User.findById(userId)) as UserDocument;
    const hashedPassword = await hash(password, 10);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({
      status: "success",
      data: {
        userId,
        username: user.username,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { register, login, logout, forgotPassword, resetPassword };
