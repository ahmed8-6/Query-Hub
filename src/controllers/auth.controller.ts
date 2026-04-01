import { User } from "../models/user.model.js";
import type { Request, Response, NextFunction } from "express";
import { hash } from "bcrypt";
import { createToken } from "../utils/jwt.js";
import type { UserDocument } from "../models/user.model.js";

const register = async (req: Request, res: Response, next: NextFunction) => {
  const { username, email, password } = req.body;
  let user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({ message: "Email already in use" });
  }
  user = await User.findOne({ username });
  if (user) {
    return res.status(400).json({ message: "Username already in use" });
  }
  const hashedPassword = await hash(password, 10);
  const newUser = new User({
    username: username,
    email: email,
    password: hashedPassword,
  });
  await newUser.save();
  res.status(201).json({
    status: "success",
    message: "User created successfully",
    user: { id: newUser._id, username: newUser.username },
  });
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as UserDocument;
  const token = await createToken(user);
  res.json({
    status: "success",
    data: { id: user._id, token: token },
  });
};

export { register, login };
