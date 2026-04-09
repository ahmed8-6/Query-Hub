import type { Request, Response, NextFunction } from "express";
import { User } from "../models/user.model.js";
import { Question } from "../models/question.model.js";
import { Answer } from "../models/answer.model.js";
import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";

const banUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId as string)) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid user ID" });
    }
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }
    if (user.isBanned) {
      return res.status(400).json({
        status: "fail",
        message: "User is already banned",
      });
    }
    if (user.isAdmin) {
      return res.status(400).json({
        status: "fail",
        message: "You can't ban an admin",
      });
    }
    const { reason } = req.body;
    await User.findByIdAndUpdate(userId, {
      isBanned: true,
      banReason: reason,
      bannedAt: new Date(),
    });
    user = await User.findById(userId).select("-password");
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const unbanUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId as string)) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid user ID" });
    }
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }
    if (!user.isBanned) {
      return res.status(400).json({
        status: "fail",
        message: "User is already not banned",
      });
    }
    await User.findByIdAndUpdate(userId, {
      isBanned: false,
      banReason: null,
      bannedAt: null,
    });
    user = await User.findById(userId).select("-password");
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const changeUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId as string)) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid user ID" });
    }
    let user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }
    const { role } = req.body;
    switch (role) {
      case "admin":
        if (user.isAdmin) {
          return res.status(400).json({
            status: "fail",
            message: "User is already an admin",
          });
        } else {
          user.isAdmin = true;
        }
        break;
      case "user":
        if (!user.isAdmin) {
          return res.status(400).json({
            status: "fail",
            message: "User is already a regular user",
          });
        } else {
          user.isAdmin = false;
        }
    }
    await user.save();

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isBanned: false });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const totalQuestions = await Question.countDocuments();
    const openedQuestions = await Question.countDocuments({ status: "open" });
    const closedQuestions = await Question.countDocuments({ status: "closed" });
    const totalAnswers = await Answer.countDocuments();
    const totalComments = await Comment.countDocuments();
    res.status(200).json({
      status: "success",
      data: {
        totalUsers,
        activeUsers,
        bannedUsers,
        totalQuestions,
        openedQuestions,
        closedQuestions,
        totalAnswers,
        totalComments,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { banUser, unbanUser, changeUserRole, getDashboardStats };
