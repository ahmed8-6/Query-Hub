import { User } from "../models/user.model.js";
import type { Request, Response, NextFunction } from "express";
import { compare, hash } from "bcrypt";
import { createToken } from "../utils/jwt.js";
import type { UserDocument } from "../models/user.model.js";
import { addToBlacklist } from "../utils/tokenBlacklist.js";
import passport from "passport";
import { sendEmail } from "../utils/email.js";

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
      email: email.toLowerCase(),
      password: hashedPassword,
    });
    await newUser.save();

    const otp = await sendEmail(
      newUser.email,
      "Email Verification Code",
      "Your email verification code is:",
    );

    const hashedOtp = await hash(otp, 10);

    newUser.otp = hashedOtp;
    newUser.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
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
      return res.status(404).json({
        status: "fail",
        message: "user not found",
      });
    }

    const otp = await sendEmail(
      user.email,
      "Password Reset Code",
      "Your password reset code is:",
    );

    const hashedOtp = await hash(otp, 10);

    user.otp = hashedOtp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset code sent to email",
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

const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { identifier, currentPassword, newPassword } = req.body;

  const user = await User.findOne({
    $or: [{ username: identifier }, { email: identifier.toLowerCase() }],
  });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const validPassword = await compare(currentPassword, user.password);
  if (!validPassword) {
    return res.status(404).json({
      success: false,
      message: "Wrong password",
    });
  }

  const hashedPassword = await hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
};

const verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
  const { identifier, otp } = req.body;
  try {
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier.toLowerCase() }],
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const isMatch = await compare(otp as string, user.otp as string);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }
    if (
      (user.otpExpiresAt?.toDateString() as string) < new Date().toDateString()
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }
    await User.findByIdAndUpdate(user._id, {
      otp: null,
      otpExpiresAt: null,
      verified: true,
    });
    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

export {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyOTP,
};
