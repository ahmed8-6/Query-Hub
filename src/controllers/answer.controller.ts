import type { Request, Response, NextFunction } from "express";
import { Answer } from "../models/answer.model.js";
import mongoose from "mongoose";
import ApiFeatures from "../utils/ApiFeatures.js";
import type { AuthPayload } from "../types/auth.js";
import { Question } from "../models/question.model.js";

const getAnswers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiFeatures = new ApiFeatures(Answer.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const answers = await apiFeatures.query;
    res.status(200).json({
      status: "success",
      data: {
        answers,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { body } = req.body;
    const user = req.user as AuthPayload;
    const userId = user.userId;
    if (!mongoose.Types.ObjectId.isValid(userId as string)) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid user ID" });
    }
    const author = new mongoose.Types.ObjectId(userId);

    const { questionId } = req.params;
    let question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        status: "fail",
        message: "Question not found",
      });
    }

    const newAnswer = new Answer({
      body,
      author,
      question: questionId,
    });
    await newAnswer.save();

    question.answers.push(newAnswer._id);
    await question.save();

    res.status(201).json({
      status: "success",
      message: "Answer created successfully",
      data: {
        newAnswer,
      },
    });
  } catch (error) {
    next(error);
  }
};

const editAnswer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { answerId } = req.params;
    const { body } = req.body;
    const user = req.user as AuthPayload;
    const userId = user.userId;
    if (!mongoose.Types.ObjectId.isValid(userId as string)) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid user ID" });
    }

    let answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({
        status: "fail",
        message: "Answer not found",
      });
    }

    if (answer.author.toString() !== userId) {
      return res.status(403).json({
        status: "fail",
        message: "You can only edit your answers",
      });
    }
    answer.body = body;
    await answer.save();
    res.status(200).json({
      status: "success",
      data: {
        answer,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { questionId, answerId } = req.params;
    const user = req.user as AuthPayload;
    const userId = user.userId;
    if (!mongoose.Types.ObjectId.isValid(userId as string)) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid user ID" });
    }

    let answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({
        status: "fail",
        message: "Answer not found",
      });
    }

    let question = await Question.findById(questionId);
    if (!question) {
      return res
        .status(404)
        .json({ status: "fail", message: "Question not found" });
    }

    if (answer.author.toString() !== userId && !user.isAdmin) {
      return res.status(403).json({
        status: "fail",
        message: "You don't have the permission to delete this answer",
      });
    }

    await Answer.findByIdAndDelete(answer);

    question.answers = question?.answers.filter(
      (ans) => ans.toString() !== answerId,
    );
    await question.save();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const voteAnswer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { answerId } = req.params;
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

    let answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({
        status: "fail",
        message: "answer not found",
      });
    }

    const author = answer.author;
    if (author.toString() === userId) {
      return res.status(400).json({
        status: "fail",
        message: "You can not vote to yourself",
      });
    }

    let update: Record<string, any> = {};
    let action: string;

    if (type === "upvote") {
      const upvotes = answer.votes?.upvotes.map((id: mongoose.Types.ObjectId) =>
        id.toString(),
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
      const downvotes = answer.votes?.downvotes.map(
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

    const updated = await Answer.findByIdAndUpdate(answerId, update, {
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

const acceptAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { questionId, answerId } = req.params;
    const user = req.user as AuthPayload;
    const { userId } = user;

    if (!mongoose.Types.ObjectId.isValid(userId as string)) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid user ID" });
    }

    let answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({
        status: "fail",
        message: "Answer not found",
      });
    }

    let question = await Question.findById(questionId);
    if (!question) {
      return res
        .status(404)
        .json({ status: "fail", message: "Question not found" });
    }

    if (question.author.toString() !== userId) {
      return res.status(403).json({
        status: "fail",
        message: "You don not have the permission to accept answer for ",
      });
    }

    answer.isAccepted = true;
    await answer.save();
    question.acceptedAnswer = new mongoose.Types.ObjectId(answerId as string);
    await question.save();

    res.status(200).json({
      status: "success",
      answer,
    });
  } catch (error) {
    next(error);
  }
};

const getAnswerVotes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { questionId, answerId } = req.params;
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        status: "fail",
        message: "Question not found",
      });
    }

    let answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({
        status: "fail",
        message: "Answer not found",
      });
    }

    const upvotes = answer.votes?.upvotes;
    const downvotes = answer.votes?.downvotes;

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
  getAnswers,
  createAnswer,
  editAnswer,
  deleteAnswer,
  voteAnswer,
  acceptAnswer,
  getAnswerVotes,
};
