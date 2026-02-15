import express from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

export const adminRoutes = express.Router();

adminRoutes.use(authMiddleware, requireRole('ADMIN'));

adminRoutes.get(
    '/users',
    adminController.getAllUsers.bind(adminController)
);

adminRoutes.get(
    '/users/:id',
    adminController.getUser.bind(adminController)
);

adminRoutes.patch(
    '/users/:id/role',
    adminController.changeUserRole.bind(adminController)
);