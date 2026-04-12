import { Router } from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserQuestions,
  getUserAnswers,
  getUserStats,
} from "../controllers/user.controller.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the user
 *         username:
 *           type: string
 *           description: The username
 *         email:
 *           type: string
 *           description: The user's email address
 *         isAdmin:
 *           type: boolean
 *           description: Whether the user has admin privileges
 *         isBanned:
 *           type: boolean
 *           description: Whether the user is banned
 *
 * tags:
 *   name: Users
 *   description: API endpoints for retrieving and managing users
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (supports search, filtering, and pagination)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search by username or email
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
 *         description: A list of users (passwords excluded)
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
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 */
router.get("/", getAllUsers);

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: The requested user
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 */
router.get("/:userId", getUserById);

/**
 * @swagger
 * /users/{userId}:
 *   put:
 *     summary: Update a user's details
 *     tags: [Users]
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
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: User successfully updated
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 */
router.put("/:userId", isAuth, updateUser);

/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: User successfully deleted
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 */
router.delete("/:userId", isAuth, deleteUser);

/**
 * @swagger
 * /users/{userId}/questions:
 *   get:
 *     summary: Get all questions asked by a specific user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
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
 *         description: A list of the user's questions
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 */
router.get("/:userId/questions", isAuth, getUserQuestions);

/**
 * @swagger
 * /users/{userId}/answers:
 *   get:
 *     summary: Get all answers provided by a specific user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
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
 *         description: A list of the user's answers
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 */
router.get("/:userId/answers", isAuth, getUserAnswers);

/**
 * @swagger
 * /users/{userId}/stats:
 *   get:
 *     summary: Get a user's activity statistics (questions, answers, comments count)
 *     tags: [Users]
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
 *         description: Statistics of the user
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
 *                       type: integer
 *                     answers:
 *                       type: integer
 *                     comments:
 *                       type: integer
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 */
router.get("/:userId/stats", isAuth, getUserStats);

export default router;
