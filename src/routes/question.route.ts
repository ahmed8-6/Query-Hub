import { Router } from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  getQuestions,
  createQuestion,
  getQuestionById,
  editQuestion,
  deleteQuestion,
  voteQuestion,
  closeQuestion,
  reopenQuestion,
  getQuestionVotes,
} from "../controllers/question.controller.js";
import { questionValidator, validate } from "../middlewares/validators.js";
const router = Router();

router.get("/", getQuestions);
router.get("/search", getQuestions);
router.post("/", isAuth, questionValidator, validate, createQuestion);
router.get("/:questionId", getQuestionById);
router.put("/:questionId", isAuth, editQuestion);
router.delete("/:questionId", isAuth, deleteQuestion);
router.post("/:questionId/vote", isAuth, voteQuestion);
router.post("/:questionId/close", isAuth, closeQuestion);
router.post("/:questionId/reopen", isAuth, reopenQuestion);
router.get("/:questionId/votes", getQuestionVotes);

export default router;
