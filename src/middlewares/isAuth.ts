import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthPayload } from "../types/auth.js";
import { isBlacklisted } from "../utils/tokenBlacklist.js";
export const isAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const header = req.headers.authorization;
  if (!header) {
    return res
      .status(401)
      .json({ message: "You have to login to view this page" });
  }
  const token = header.split(" ")[1] as string;
  if (isBlacklisted(token)) {
    res.status(401).json({
      success: false,
      message: "Token has been invalidated, please login again",
    });
    return;
  }
  const privateKey: string = process.env.JWT_SECRET as string;
  try {
    const decodedToken = jwt.verify(token, privateKey) as AuthPayload;
    req.user = decodedToken;
    next();
  } catch (error) {
    next(error);
  }
};
