import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import type { Request, Response, NextFunction } from "express";
import passport from "./config/passport.js";
import authRouter from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import questionRoute from "./routes/question.route.js";
import { Question } from "./models/question.model.js";
import answerRoutes from "./routes/answer.routes.js";
import commentRoutes from "./routes/comment.routes.js";
dotenv.config();

mongoose
  .connect(process.env.DB_LOCAL as string)
  .then(async () => {
    console.log(`server connected to database`);
    await Question.syncIndexes();
  })
  .catch((error) => {
    console.log(`failed to connect to database`, error);
  });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

app.use("/api/auth", authRouter);
app.use("/api/users", userRoute);
app.use("/api/questions", questionRoute);
app.use("/api/questions/:questionId/answers", answerRoutes);
app.use("/api/comments", commentRoutes);

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(501).json({
    status: "error",
    message: error.message,
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`server is listening on port ${port}`));
