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

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative API endpoints for moderation and management
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get a list of all users
 *     tags: [Admin]
 *     parameters:
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
 *         description: A list of users
 */
router.get("/users", getAllUsers);

/**
 * @swagger
 * /admin/users/{userId}/ban:
 *   patch:
 *     summary: Ban a user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for banning the user
 *     responses:
 *       200:
 *         description: User banned successfully
 *       400:
 *         description: User is already banned or trying to ban an admin
 *       404:
 *         description: User not found
 */
router.patch("/users/:userId/ban", isAuth, isAdmin, banUser);

/**
 * @swagger
 * /admin/users/{userId}/unban:
 *   patch:
 *     summary: Unban a user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User unbanned successfully
 *       400:
 *         description: User is not banned
 *       404:
 *         description: User not found
 */
router.patch("/users/:userId/unban", isAuth, isAdmin, unbanUser);

/**
 * @swagger
 * /admin/users/{userId}/role:
 *   patch:
 *     summary: Change user role (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: User already has this role
 *       404:
 *         description: User not found
 */
router.patch("/users/:userId/role", isAuth, isAdmin, changeUserRole);

/**
 * @swagger
 * /admin/questions/{questionId}:
 *   delete:
 *     summary: Force delete a question (Admin only)
 *     tags: [Admin]
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
 *       404:
 *         description: Question not found
 */
router.delete("/questions/:questionId", isAuth, isAdmin, deleteQuestion);

/**
 * @swagger
 * /admin/questions/{questionId}/close:
 *   put:
 *     summary: Force close a question (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for closing the question
 *     responses:
 *       200:
 *         description: Question closed successfully
 *       404:
 *         description: Question not found
 */
router.put("/questions/:questionId/close", isAuth, isAdmin, closeQuestion);

/**
 * @swagger
 * /admin/questions/{questionId}/reopen:
 *   put:
 *     summary: Force reopen a closed question (Admin only)
 *     tags: [Admin]
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
 *       404:
 *         description: Question not found
 */
router.put("/questions/:questionId/reopen", isAuth, isAdmin, reopenQuestion);

/**
 * @swagger
 * /admin/answers/{answerId}:
 *   delete:
 *     summary: Force delete an answer (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: answerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Answer deleted successfully
 *       404:
 *         description: Answer not found
 */
router.delete("/answers/:answerId", isAuth, isAdmin, deleteAnswer);

/**
 * @swagger
 * /admin/comments/{commentId}:
 *   delete:
 *     summary: Force delete a comment (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Comment deleted successfully
 *       404:
 *         description: Comment not found
 */
router.delete("/comments/:commentId", isAuth, isAdmin, deleteComment);

/**
 * @swagger
 * /admin/users/{userId}/stats:
 *   get:
 *     summary: Get statistics for a specific user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User statistics
 */
router.get("/users/:userId/stats", isAuth, isAdmin, getUserStats);

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get overall platform statistics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform dashboard statistics
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
 *                     totalUsers:
 *                       type: integer
 *                     activeUsers:
 *                       type: integer
 *                     bannedUsers:
 *                       type: integer
 *                     totalQuestions:
 *                       type: integer
 *                     openedQuestions:
 *                       type: integer
 *                     closedQuestions:
 *                       type: integer
 *                     totalAnswers:
 *                       type: integer
 *                     totalComments:
 *                       type: integer
 */
router.get("/dashboard", isAuth, isAdmin, getDashboardStats);

export default router;
