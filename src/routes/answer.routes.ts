import { Router } from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  getAnswers,
  createAnswer,
  editAnswer,
  deleteAnswer,
  voteAnswer,
  acceptAnswer,
  getAnswerVotes,
} from "../controllers/answer.controller.js";
import { getComments, addComment } from "../controllers/comment.controller.js";
import {
  answerValidator,
  commentValidator,
  validate,
} from "../middlewares/validators.js";

const router = Router({ mergeParams: true });

router.get("/", getAnswers);
router.post("/", isAuth, answerValidator, validate, createAnswer);
router.put("/:answerId", isAuth, answerValidator, validate, editAnswer);
router.delete("/:answerId", isAuth, deleteAnswer);
router.post("/:answerId/vote", isAuth, voteAnswer);
router.post("/:answerId/accept", isAuth, acceptAnswer);
router.get("/:answerId/votes", getAnswerVotes);
router.get("/:answerId/comments", getComments);
router.post(
  "/:answerId/comments",
  isAuth,
  commentValidator,
  validate,
  addComment,
);

export default router;
