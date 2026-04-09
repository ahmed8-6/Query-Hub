import { Router } from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { getAllUsers, getUserStats } from "../controllers/user.controller.js";
import {
  deleteQuestion,
  closeQuestion,
  reopenQuestion,
} from "../controllers/question.controller.js";
import { deleteAnswer } from "../controllers/answer.controller.js";
import { deleteComment } from "../controllers/comment.controller.js";
import {
  banUser,
  unbanUser,
  changeUserRole,
  getDashboardStats,
} from "../controllers/admin.controller.js";

const router = Router({ mergeParams: true });

router.get("/users", getAllUsers);
router.patch("/users/:userId/ban", isAuth, isAdmin, banUser);
router.patch("/users/:userId/unban", isAuth, isAdmin, unbanUser);
router.patch("/users/:userId/role", isAuth, isAdmin, changeUserRole);
router.delete("/questions/:questionId", isAuth, isAdmin, deleteQuestion);
router.put("/questions/:questionId/close", isAuth, isAdmin, closeQuestion);
router.put("/questions/:questionId/reopen", isAuth, isAdmin, reopenQuestion);
router.delete("/answers/:answerId", isAuth, isAdmin, deleteAnswer);
router.delete("/comments/:commentId", isAuth, isAdmin, deleteComment);
router.get("/users/:userId/stats", isAuth, isAdmin, getUserStats);
router.get("/dashboard", isAuth, isAdmin, getDashboardStats);

export default router;
