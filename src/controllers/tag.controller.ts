import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import ApiFeatures from "../utils/ApiFeatures.js";
import type { AuthPayload } from "../types/auth.js";
import { Tag } from "../models/tag.model.js";
import { Question } from "../models/question.model.js";

const getTags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiFeatures = new ApiFeatures(Tag.find(), req.query)
      .search()
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tags = await apiFeatures.query;
    // const tags = await Tag.find();

    res.status(200).json({
      status: "success",
      data: { tags },
    });
  } catch (error) {
    next(error);
  }
};

const createTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;
    const user = req.user as AuthPayload;
    const userId = user.userId;
    if (!mongoose.Types.ObjectId.isValid(userId as string)) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid user ID" });
    }
    const tag = await Tag.findOne({ name });
    if (tag) {
      return res.status(400).json({
        status: "fail",
        message: "Tag already exists",
      });
    }
    const newTag = new Tag({
      name,
      description,
      createdBy: new mongoose.Types.ObjectId(userId),
    });
    await newTag.save();
    res.status(201).json({
      status: "success",
      data: {
        newTag,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTagByName = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const name: string = req.params.name as string;
    const tag = await Tag.findOne({ name });
    if (!tag) {
      return res.status(404).json({
        status: "fail",
        message: "Tag not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        tag,
      },
    });
  } catch (error) {
    next(error);
  }
};

const editTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newName: string = req.body.name;
    const newDescription: string = req.body.description;
    const name: string = req.params.name as string;
    let tag = await Tag.findOne({ name });
    if (!tag) {
      return res.status(404).json({
        status: "fail",
        message: "Tag not found",
      });
    }
    const user = req.user as AuthPayload;
    const userId = user.userId;
    if (!mongoose.Types.ObjectId.isValid(userId as string)) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid user ID" });
    }
    if (newName) {
      if (newName.length < 15 && newName.length > 100) {
        return res.status(400).json({
          status: "fail",
          message:
            "Name length must be between at least 15 characters and 100 at most characters.",
        });
      }
      tag.name = newName;
    }
    if (newDescription) {
      if (newDescription.length < 15 && newDescription.length > 100) {
        return res.status(400).json({
          status: "fail",
          message: "Description length must be between at least 15 characters.",
        });
      }
      tag.description = newDescription;
    }
    await tag.save();
    res.status(200).json({
      status: "success",
      data: {
        tag,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const name: string = req.params.name as string;
    let tag = await Tag.findOne({ name });
    if (!tag) {
      return res.status(404).json({
        status: "fail",
        message: "Tag not found",
      });
    }
    const user = req.user as AuthPayload;
    const userId = user.userId;
    if (!mongoose.Types.ObjectId.isValid(userId as string)) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid user ID" });
    }

    await Tag.findOneAndDelete({ name });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const getQuestionsByTag = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const name: string = req.params.name as string;
  let tag = await Tag.findOne({ name });
  if (!tag) {
    return res.status(404).json({
      status: "fail",
      message: "Tag not found",
    });
  }
  const apiFeatures = new ApiFeatures(
    Question.find({ tags: name.toLowerCase() }),
    req.query,
  )
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
};
export {
  getTags,
  createTag,
  getTagByName,
  editTag,
  deleteTag,
  getQuestionsByTag,
};
