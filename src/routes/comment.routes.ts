import { Router } from "express";
import { isAuth } from "../middlewares/isAuth.js";

import {
  editComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import { commentValidator, validate } from "../middlewares/validators.js";

const router = Router();

router.put("/:commentId", isAuth, commentValidator, validate, editComment);
router.delete("/:commentId", isAuth, deleteComment);

export default router;
