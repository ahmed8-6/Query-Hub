import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import type { Request, Response, NextFunction } from "express";
import passport from "./config/passport.js";
import authRouter from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
dotenv.config();

mongoose
  .connect(process.env.DB_LOCAL as string)
  .then(() => {
    console.log(`server connected to database`);
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

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(501).json({
    status: "error",
    message: error.message,
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`server is listening on port ${port}`));
