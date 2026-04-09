import { Router } from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { tagValidator, validate } from "../middlewares/validators.js";
import {
  getTags,
  createTag,
  getTagByName,
  editTag,
  deleteTag,
  getQuestionsByTag,
} from "../controllers/tag.controller.js";

const router = Router();

router.get("/", getTags);
router.post("/", isAuth, isAdmin, tagValidator, validate, createTag);
router.get("/:name", getTagByName);
router.put("/:name", isAuth, isAdmin, editTag);
router.delete("/:name", isAuth, isAdmin, deleteTag);
router.get("/:name/questions", getQuestionsByTag);
export default router;
