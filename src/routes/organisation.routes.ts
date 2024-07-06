import { Router } from "express";
import { create, getAll, getById, OrganisationController } from "../controllers/organisation.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Organisations
 *   description: Organisation related endpoints
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/organisations:
 *   post:
 *     summary: Create a new organisation
 *     tags: [Organisations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Organisation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     orgId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *       422:
 *         description: Validation error
 *       400:
 *         description: Client error
 */
router.post("/organisations",authMiddleware ,create);

/**
 * @swagger
 * /api/organisations:
 *   get:
 *     summary: Get all organisations of the logged-in user
 *     tags: [Organisations]
 *     responses:
 *       200:
 *         description: Organisations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     organisations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           orgId:
 *                             type: string
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 */
router.get("/organisations",authMiddleware ,getAll);

/**
 * @swagger
 * /api/organisations/:orgId:
 *   get:
 *     summary: Get a specific organisation by ID
 *     tags: [Organisations]
 *     parameters:
 *       - in: path
 *         name: orgId
 *         schema:
 *           type: string
 *         required: true
 *         description: Organisation ID
 *     responses:
 *       200:
 *         description: Organisation retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     orgId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *       404:
 *         description: Organisation not found
 */
router.get("/organisations/:orgId", authMiddleware, getById);

/**
 * @swagger
 * /api/organisations/:orgId/users:
 *   post:
 *     summary: Add user to organisation
 *     description: Adds a user to a particular organisation
 *     tags: [Organisations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
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
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: User added to organisation successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/organisations/:orgId/users", authMiddleware, OrganisationController.addUserToOrganisation);



export default router;
