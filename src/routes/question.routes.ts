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
import { getComments, addComment } from "../controllers/comment.controller.js";
import {
  questionValidator,
  commentValidator,
  validate,
} from "../middlewares/validators.js";

const router = Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Question:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the question
 *         title:
 *           type: string
 *           description: The title of the question
 *         body:
 *           type: string
 *           description: The content/body of the question
 *         author:
 *           type: string
 *           description: The user ID of the author
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: List of tags associated with the question
 *         status:
 *           type: string
 *           enum: [open, closed]
 *           description: The status of the question
 *         closedReason:
 *           type: string
 *           description: The reason if the question is closed
 *
 * tags:
 *   name: Questions
 *   description: API endpoints for managing questions
 */

/**
 * @swagger
 * /questions:
 *   get:
 *     summary: Get all questions
 *     tags: [Questions]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort field (e.g., -createdAt)
 *     responses:
 *       200:
 *         description: A list of questions
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
 *                     questions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Question'
 */
router.get("/", getQuestions);

/**
 * @swagger
 * /questions/search:
 *   get:
 *     summary: Search questions by title or body
 *     tags: [Questions]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: The search keyword
 *     responses:
 *       200:
 *         description: Matching questions
 */
router.get("/search", getQuestions);

/**
 * @swagger
 * /questions:
 *   post:
 *     summary: Create a new question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *               - tags
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Question created successfully
 */
router.post("/", isAuth, questionValidator, validate, createQuestion);

/**
 * @swagger
 * /questions/{questionId}:
 *   get:
 *     summary: Get a question by ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the question
 *     responses:
 *       200:
 *         description: The requested question
 *       404:
 *         description: Question not found
 */
router.get("/:questionId", getQuestionById);

/**
 * @swagger
 * /questions/{questionId}:
 *   put:
 *     summary: Edit a question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: The updated question
 *       403:
 *         description: You can only edit your questions
 */
router.put("/:questionId", isAuth, editQuestion);

/**
 * @swagger
 * /questions/{questionId}:
 *   delete:
 *     summary: Delete a question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Question deleted successfully
 *       403:
 *         description: Unauthorized to delete this question
 */
router.delete("/:questionId", isAuth, deleteQuestion);

/**
 * @swagger
 * /questions/{questionId}/vote:
 *   post:
 *     summary: Upvote or downvote a question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [upvote, downvote]
 *     responses:
 *       200:
 *         description: Vote successful
 */
router.post("/:questionId/vote", isAuth, voteQuestion);

/**
 * @swagger
 * /questions/{questionId}/close:
 *   post:
 *     summary: Close a question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Question closed successfully
 */
router.post("/:questionId/close", isAuth, closeQuestion);

/**
 * @swagger
 * /questions/{questionId}/reopen:
 *   post:
 *     summary: Reopen a closed question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question reopened successfully
 */
router.post("/:questionId/reopen", isAuth, reopenQuestion);

/**
 * @swagger
 * /questions/{questionId}/votes:
 *   get:
 *     summary: Get vote counts for a question
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Upvotes, downvotes, total votes, and score
 */
router.get("/:questionId/votes", getQuestionVotes);

/**
 * @swagger
 * /questions/{questionId}/comments:
 *   get:
 *     summary: Get comments for a question
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 */
router.get("/:questionId/comments", getComments);

/**
 * @swagger
 * /questions/{questionId}/comments:
 *   post:
 *     summary: Add a comment to a question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
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
 *                 description: The comment content
 *     responses:
 *       201:
 *         description: Comment added successfully
 */
router.post(
  "/:questionId/comments",
  isAuth,
  commentValidator,
  validate,
  addComment,
);

export default router;
