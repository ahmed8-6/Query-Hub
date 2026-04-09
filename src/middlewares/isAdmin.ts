import type { Request, Response, NextFunction } from "express";
import type { AuthPayload } from "../types/auth.js";

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user as AuthPayload;
  if (user.isAdmin) next();
  else {
    res.status(403).json({
      status: "fail",
      message: "you don't have the access to view this page",
    });
  }
};
