import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import type { UserDocument } from "../models/user.model.js";
dotenv.config();

export const createToken = async (user: UserDocument) => {
  const privateKey: string = process.env.JWT_SECRET as string;
  const token = jwt.sign(
    { userId: user._id, username: user.username },
    privateKey,
    { expiresIn: "1d" },
  );
  return token;
};
