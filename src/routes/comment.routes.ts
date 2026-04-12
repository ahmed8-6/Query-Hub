import { Router } from "express";
import { isAuth } from "../middlewares/isAuth.js";

import {
  editComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import { commentValidator, validate } from "../middlewares/validators.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the comment
 *         body:
 *           type: string
 *           description: The content of the comment
 *         author:
 *           type: string
 *           description: The user ID of the author
 *         targetType:
 *           type: string
 *           enum: [Question, Answer]
 *           description: The type of entity the comment is attached to
 *         targetId:
 *           type: string
 *           description: The ID of the question or answer this comment belongs to
 *
 * tags:
 *   name: Comments
 *   description: API endpoints for managing individual comments
 */

/**
 * @swagger
 * /comments/{commentId}:
 *   put:
 *     summary: Edit an existing comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to edit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - body
 *             properties:
 *               body:
 *                 type: string
 *                 description: The updated comment content
 *     responses:
 *       201:
 *         description: Comment successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     comment:
 *                       $ref: '#/components/schemas/Comment'
 *       403:
 *         description: You can only edit your own comments
 *       404:
 *         description: Comment not found
 */
router.put("/:commentId", isAuth, commentValidator, validate, editComment);

/**
 * @swagger
 * /comments/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to delete
 *     responses:
 *       204:
 *         description: Comment successfully deleted
 *       403:
 *         description: You don't have permission to delete this comment
 *       404:
 *         description: Comment not found
 */
router.delete("/:commentId", isAuth, deleteComment);

export default router;
