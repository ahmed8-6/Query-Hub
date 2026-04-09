import type { Request, Response, NextFunction } from "express";
import { User, type UserDocument } from "../models/user.model.js";

export const isBanned = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userPayload = req.user as UserDocument;
  const user = await User.findById(userPayload._id);
  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "User not found",
    });
  }
  if (user.isBanned) {
    res.status(403).json({
      status: "fail",
      message: `Your account has been banned. Reason: ${user.banReason}`,
    });
    return;
  }
  next();
};
