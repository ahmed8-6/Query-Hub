import type { Request, Response, NextFunction } from "express";
import { Answer } from "../models/answer.model.js";
import mongoose from "mongoose";
import ApiFeatures from "../utils/ApiFeatures.js";
import type { AuthPayload } from "../types/auth.js";
import { Question } from "../models/question.model.js";
import { Comment } from "../models/comment.model.js";

const getComments = async (req: Request, res: Response, next: NextFunction) => {
  const { questionId, answerId } = req.params;
  let targetId: string = "";
  if (answerId) {
    let answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({
        status: "fail",
        message: "answer not found",
      });
    }
    targetId = answerId as string;
  } else {
    let question = await Question.findById(questionId);
    if (!question) {
      return res
        .status(404)
        .json({ status: "fail", message: "Question not found" });
    }
    targetId = questionId as string;
  }

  const apiFeatures = new ApiFeatures(
    Comment.find({ targetId: new mongoose.Types.ObjectId(targetId) }),
    req.query,
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const comments = await apiFeatures.query;

  res.status(200).json({
    status: "success",
    data: { comments },
  });
};

const addComment = async (req: Request, res: Response, next: NextFunction) => {
  const { questionId, answerId } = req.params;
  let targetType: string = "";
  let targetId: string = "";
  if (answerId) {
    let answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({
        status: "fail",
        message: "answer not found",
      });
    }
    targetType = "Answer";
    targetId = answerId as string;
  } else {
    let question = await Question.findById(questionId);
    if (!question) {
      return res
        .status(404)
        .json({ status: "fail", message: "Question not found" });
    }
    targetType = "Question";
    targetId = questionId as string;
  }

  const user = req.user as AuthPayload;
  const userId = user.userId;
  if (!mongoose.Types.ObjectId.isValid(userId as string)) {
    return res.status(400).json({ status: "fail", message: "Invalid user ID" });
  }
  const { body } = req.body;
  const author = new mongoose.Types.ObjectId(userId);
  const newComment = new Comment({
    body,
    author,
    targetType,
    targetId: new mongoose.Types.ObjectId(targetId),
  });

  await newComment.save();

  res.status(201).json({
    status: "success",
    data: {
      newComment,
    },
  });
};

const editComment = async (req: Request, res: Response, next: NextFunction) => {
  const { commentId } = req.params;
  const { body } = req.body;

  const user = req.user as AuthPayload;
  const userId = user.userId;
  if (!mongoose.Types.ObjectId.isValid(userId as string)) {
    return res.status(400).json({ status: "fail", message: "Invalid user ID" });
  }

  let comment = await Comment.findById(commentId);
  if (!comment) {
    return res.status(404).json({
      status: "fail",
      message: "Comment not found",
    });
  }

  if (comment.author.toString() !== userId) {
    return res.status(403).json({
      status: "fail",
      message: "You can only edit your comments",
    });
  }

  comment.body = body;
  await comment.save();

  res.status(201).json({
    status: "success",
    data: { comment },
  });
};

const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { commentId } = req.params;

  const user = req.user as AuthPayload;
  const userId = user.userId;
  if (!mongoose.Types.ObjectId.isValid(userId as string)) {
    return res.status(400).json({ status: "fail", message: "Invalid user ID" });
  }

  let comment = await Comment.findById(commentId);
  if (!comment) {
    return res.status(404).json({
      status: "fail",
      message: "Comment not found",
    });
  }

  if (comment.author.toString() !== userId) {
    return res.status(403).json({
      status: "fail",
      message: "You can only delete your comments",
    });
  }

  await Comment.findByIdAndDelete(commentId);

  res.status(204).send();
};

export { getComments, addComment, editComment, deleteComment };
