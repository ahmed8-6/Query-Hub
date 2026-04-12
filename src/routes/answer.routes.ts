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

/**
 * @swagger
 * components:
 *   schemas:
 *     Answer:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the answer
 *         body:
 *           type: string
 *           description: The content/body of the answer
 *         author:
 *           type: string
 *           description: The user ID of the author
 *         question:
 *           type: string
 *           description: The associated question ID
 *         isAccepted:
 *           type: boolean
 *           description: Whether this answer is accepted by the question author
 *
 * tags:
 *   name: Answers
 *   description: API endpoints for managing answers on questions
 */

/**
 * @swagger
 * /questions/{questionId}/answers:
 *   get:
 *     summary: Get all answers (supports filtering and pagination)
 *     tags: [Answers]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the question
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of answers
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
 *                     answers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Answer'
 */
router.get("/", getAnswers);

/**
 * @swagger
 * /questions/{questionId}/answers:
 *   post:
 *     summary: Create an answer for a question
 *     tags: [Answers]
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
 *                 description: The answer content
 *     responses:
 *       201:
 *         description: Answer created successfully
 */
router.post("/", isAuth, answerValidator, validate, createAnswer);

/**
 * @swagger
 * /questions/{questionId}/answers/{answerId}:
 *   put:
 *     summary: Edit an answer
 *     tags: [Answers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: answerId
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
 *                 description: The updated answer content
 *     responses:
 *       200:
 *         description: The updated answer
 *       403:
 *         description: You can only edit your own answers
 */
router.put("/:answerId", isAuth, answerValidator, validate, editAnswer);

/**
 * @swagger
 * /questions/{questionId}/answers/{answerId}:
 *   delete:
 *     summary: Delete an answer
 *     tags: [Answers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: answerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Answer deleted successfully
 *       403:
 *         description: Unauthorized to delete this answer
 */
router.delete("/:answerId", isAuth, deleteAnswer);

/**
 * @swagger
 * /questions/{questionId}/answers/{answerId}/vote:
 *   post:
 *     summary: Upvote or downvote an answer
 *     tags: [Answers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: answerId
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
router.post("/:answerId/vote", isAuth, voteAnswer);

/**
 * @swagger
 * /questions/{questionId}/answers/{answerId}/accept:
 *   post:
 *     summary: Accept an answer (only by question author)
 *     tags: [Answers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: answerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Answer accepted successfully
 *       403:
 *         description: Unauthorized to accept answer
 */
router.post("/:answerId/accept", isAuth, acceptAnswer);

/**
 * @swagger
 * /questions/{questionId}/answers/{answerId}/votes:
 *   get:
 *     summary: Get vote counts for an answer
 *     tags: [Answers]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: answerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Upvotes, downvotes, total votes, and score
 */
router.get("/:answerId/votes", getAnswerVotes);

/**
 * @swagger
 * /questions/{questionId}/answers/{answerId}/comments:
 *   get:
 *     summary: Get comments on an answer
 *     tags: [Answers]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: answerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments on the answer
 */
router.get("/:answerId/comments", getComments);

/**
 * @swagger
 * /questions/{questionId}/answers/{answerId}/comments:
 *   post:
 *     summary: Add a comment to an answer
 *     tags: [Answers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: answerId
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
  "/:answerId/comments",
  isAuth,
  commentValidator,
  validate,
  addComment,
);

export default router;
