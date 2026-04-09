import { Router } from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserQuestions,
  getUserAnswers,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/", getAllUsers);
router.get("/:userId", getUserById);
router.put("/:userId", isAuth, updateUser);
router.delete("/:userId", isAuth, deleteUser);
router.get("/:userId/questions", isAuth, getUserQuestions);
router.get("/:userId/answers", isAuth, getUserAnswers);

export default router;
