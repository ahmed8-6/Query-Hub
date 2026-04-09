import type { Request, Response, NextFunction } from "express";
import { User } from "../models/user.model.js";
import { Question } from "../models/question.model.js";
import { Answer } from "../models/answer.model.js";
import type { UserDocument } from "../models/user.model.js";
import mongoose from "mongoose";
import ApiFeatures from "../utils/ApiFeatures.js";

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiFeatures = new ApiFeatures(User.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    apiFeatures.query = apiFeatures.query.select("-password");
    const users = await apiFeatures.query;
    res.status(200).json({
      status: "success",
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId as string)) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid user ID" });
    }
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }
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

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId as string)) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid user ID" });
    }
    const user = (await User.findById(userId)) as UserDocument;
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }
    const { username, email } = req.body;
    if (username) {
      user.username = username;
    }
    if (email) {
      user.email = email;
    }
    await user.save();
    res.status(200).json({
      status: "success",
      data: {
        userId,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId as string)) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid user ID" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }
    await User.findByIdAndDelete(userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const getUserQuestions = async (
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

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    const objectId = new mongoose.Types.ObjectId(userId as string);
    const apiFeatures = new ApiFeatures(
      Question.find({ author: objectId }),
      req.query,
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const questions = await apiFeatures.query;

    res.status(200).json({ status: "success", user, data: { questions } });
  } catch (error) {
    next(error);
  }
};

const getUserAnswers = async (
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

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    const objectId = new mongoose.Types.ObjectId(userId as string);
    const apiFeatures = new ApiFeatures(
      Answer.find({ author: objectId }),
      req.query,
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const answers = await apiFeatures.query;

    res.status(200).json({ status: "success", user, data: { answers } });
  } catch (error) {
    next(error);
  }
};

const getUserStats = async (
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

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }
    const author = new mongoose.Types.ObjectId(userId as string);
    const questions = await Question.find({ author }).countDocuments();
    const answers = await Answer.find({ author }).countDocuments();
    const comments = await Answer.find({ author }).countDocuments();

    res.status(200).json({
      status: "success",
      user,
      data: {
        questions,
        answers,
        comments,
      },
    });
  } catch (error) {
    next(error);
  }
};

export {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserQuestions,
  getUserAnswers,
  getUserStats,
};
