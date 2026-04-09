import type { Request, Response, NextFunction } from "express";
import { Question } from "../models/question.model.js";
import mongoose from "mongoose";
import ApiFeatures from "../utils/ApiFeatures.js";
import type { AuthPayload } from "../types/auth.js";

const getQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const apiFeatures = new ApiFeatures(Question.find(), req.query)
      .search(["title", "body"])
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const questions = await apiFeatures.query;
    res.status(200).json({
      status: "success",
      data: {
        questions,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { title, body, tags } = req.body;
    const user = req.user as AuthPayload;
    const userId = user.userId;
    if (!mongoose.Types.ObjectId.isValid(userId as string)) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid user ID" });
    }
    const author = new mongoose.Types.ObjectId(userId);
    const newQuestion = new Question({
      title,
      body,
      author,
      tags,
    });
    await newQuestion.save();
    res.status(201).json({
      status: "success",
      message: "Question created successfully",
      data: {
        newQuestion,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getQuestionById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { questionId } = req.params;
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        status: "fail",
        message: "Question not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        question,
      },
    });
  } catch (error) {
    next(error);
  }
};

const editQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { questionId } = req.params;
    const { title, body, tags } = req.body;
    if (!title && !body && !tags) {
      return res.status(400).json({
        status: "fail",
        message: "You have to make a change on the question",
      });
    }
    const user = req.user as AuthPayload;
    const userId = user.userId;
    if (!mongoose.Types.ObjectId.isValid(userId as string)) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid user ID" });
    }

    let question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        status: "fail",
        message: "Question not found",
      });
    }

    if (question.author.toString() !== userId) {
      return res.status(403).json({
        status: "fail",
        message: "You can only edit your questions",
      });
    }
    if (title) {
      if (title.length < 15 && title.length > 100) {
        return res.status(400).json({
          status: "fail",
          message:
            "title length must be between at least 15 characters and 100 at most characters.",
        });
      }
      question.title = title;
    }
    if (body) {
      if (body.length < 15 && body.length > 100) {
        return res.status(400).json({
          status: "fail",
          message: "body length must be between at least 15 characters.",
        });
      }
      question.body = body;
    }
    if (tags) {
      if (tags.length < 1) {
        return res.status(400).json({
          status: "fail",
          message: "tags must be an array and at least has one tag.",
        });
      }
      question.tags = tags;
    }
    await question.save();
    res.status(200).json({
      status: "success",
      data: {
        question,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { questionId } = req.params;
    const user = req.user as AuthPayload;
    const userId = user.userId;
    if (!mongoose.Types.ObjectId.isValid(userId as string)) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid user ID" });
    }

    let question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        status: "fail",
        message: "Question not found",
      });
    }

    if (question.author.toString() !== userId && !user.isAdmin) {
      return res.status(403).json({
        status: "fail",
        message: "You don't have the permission to delete this questions",
      });
    }

    await Question.findByIdAndDelete(questionId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const voteQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { questionId } = req.params;
    const { type } = req.body;
    const user = req.user as AuthPayload;
    const { userId } = user;

    if (!mongoose.Types.ObjectId.isValid(userId as string)) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid user ID" });
    }

    if (!["upvote", "downvote"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Vote type must be upvote or downvote",
      });
    }

    let question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        status: "fail",
        message: "Question not found",
      });
    }

    const author = question.author;
    if (author.toString() === userId) {
      return res.status(400).json({
        status: "fail",
        message: "You can not vote to yourself",
      });
    }

    let update: Record<string, any> = {};
    let action: string;

    if (type === "upvote") {
      const upvotes = question.votes?.upvotes.map(
        (id: mongoose.Types.ObjectId) => id.toString(),
      );
      const alreadyUpvoted = upvotes?.includes(userId);
      if (alreadyUpvoted) {
        update = {
          $pull: { "votes.upvotes": new mongoose.Types.ObjectId(userId) },
        };
        action = "unvoted";
      } else {
        update = {
          $addToSet: { "votes.upvotes": new mongoose.Types.ObjectId(userId) },
          $pull: { "votes.downvotes": new mongoose.Types.ObjectId(userId) },
        };
        action = "upvoted";
      }
    } else {
      const downvotes = question.votes?.downvotes.map(
        (id: mongoose.Types.ObjectId) => id.toString(),
      );
      const alreadyDownvoted = downvotes?.includes(userId);
      if (alreadyDownvoted) {
        update = {
          $pull: { "votes.downvotes": new mongoose.Types.ObjectId(userId) },
        };
        action = "unvoted";
      } else {
        update = {
          $addToSet: { "votes.downvotes": new mongoose.Types.ObjectId(userId) },
          $pull: { "votes.upvotes": new mongoose.Types.ObjectId(userId) },
        };
        action = "downvoted";
      }
    }

    const updated = await Question.findByIdAndUpdate(questionId, update, {
      new: true,
    });

    res.status(200).json({
      status: "success",
      data: {
        action,
        upvotes: updated!.votes?.upvotes.length,
        downvotes: updated!.votes?.downvotes.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

const closeQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { questionId } = req.params;
    const user = req.user as AuthPayload;
    const { userId } = user;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId as string)) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid user ID" });
    }

    let question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        status: "fail",
        message: "Question not found",
      });
    }

    if (question.author.toString() !== userId && !user.isAdmin) {
      return res.status(403).json({
        status: "fail",
        message: "You don't have the permission to close this questions",
      });
    }

    question.status = "closed";
    question.closedReason = reason;
    await question.save();

    res.status(200).json({
      status: "success",
      data: {
        question,
      },
    });
  } catch (error) {
    next(error);
  }
};

const reopenQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { questionId } = req.params;
    const user = req.user as AuthPayload;
    const { userId } = user;

    if (!mongoose.Types.ObjectId.isValid(userId as string)) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid user ID" });
    }

    let question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        status: "fail",
        message: "Question not found",
      });
    }

    if (question.author.toString() !== userId && !user.isAdmin) {
      return res.status(403).json({
        status: "fail",
        message: "You don't have the permission to reopen this questions",
      });
    }

    question.status = "open";
    await question.save();

    res.status(200).json({
      status: "success",
      data: {
        question,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getQuestionVotes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { questionId } = req.params;
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        status: "fail",
        message: "Question not found",
      });
    }

    const upvotes = question.votes?.upvotes;
    const downvotes = question.votes?.downvotes;
    res.status(200).json({
      status: "success",
      data: {
        upvotes: upvotes?.length,
        downvotes: downvotes?.length,
        totalVotes: (upvotes?.length as number) + (downvotes?.length as number),
        score: (upvotes?.length as number) - (downvotes?.length as number),
      },
    });
  } catch (error) {
    next(error);
  }
};

export {
  getQuestions,
  createQuestion,
  getQuestionById,
  editQuestion,
  deleteQuestion,
  voteQuestion,
  closeQuestion,
  reopenQuestion,
  getQuestionVotes,
};
