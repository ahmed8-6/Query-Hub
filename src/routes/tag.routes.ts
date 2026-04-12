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

/**
 * @swagger
 * components:
 *   schemas:
 *     Tag:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the tag
 *         name:
 *           type: string
 *           description: The name of the tag
 *         description:
 *           type: string
 *           description: The description of what the tag is used for
 *         createdBy:
 *           type: string
 *           description: The user ID of the admin who created the tag
 *
 * tags:
 *   name: Tags
 *   description: API endpoints for managing tags
 */

/**
 * @swagger
 * /tags:
 *   get:
 *     summary: Get a list of all tags (supports filtering, sorting, pagination)
 *     tags: [Tags]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: A list of tags
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
 *                     tags:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Tag'
 */
router.get("/", getTags);

/**
 * @swagger
 * /tags:
 *   post:
 *     summary: Create a new tag (Admin only)
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: The tag name
 *               description:
 *                 type: string
 *                 description: A description of the tag
 *     responses:
 *       201:
 *         description: Tag created successfully
 *       400:
 *         description: Tag already exists or invalid data
 */
router.post("/", isAuth, isAdmin, tagValidator, validate, createTag);

/**
 * @swagger
 * /tags/{name}:
 *   get:
 *     summary: Get a specific tag by its name
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the tag
 *     responses:
 *       200:
 *         description: The tag details
 *       404:
 *         description: Tag not found
 */
router.get("/:name", getTagByName);

/**
 * @swagger
 * /tags/{name}:
 *   put:
 *     summary: Edit an existing tag (Admin only)
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The current name of the tag
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name for the tag
 *               description:
 *                 type: string
 *                 description: The new description for the tag
 *     responses:
 *       200:
 *         description: Tag updated successfully
 *       400:
 *         description: Validation failed (e.g., name/description length)
 *       404:
 *         description: Tag not found
 */
router.put("/:name", isAuth, isAdmin, editTag);

/**
 * @swagger
 * /tags/{name}:
 *   delete:
 *     summary: Delete a tag by name (Admin only)
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the tag to delete
 *     responses:
 *       204:
 *         description: Tag successfully deleted
 *       404:
 *         description: Tag not found
 */
router.delete("/:name", isAuth, isAdmin, deleteTag);

/**
 * @swagger
 * /tags/{name}/questions:
 *   get:
 *     summary: Get questions associated with a specific tag
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the tag
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
 *         description: A list of questions with the specified tag
 *       404:
 *         description: Tag not found
 */
router.get("/:name/questions", getQuestionsByTag);

export default router;
