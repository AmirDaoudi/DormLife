"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const validation_2 = require("../middleware/validation");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', (0, validation_1.validate)(validation_2.authSchemas.register), AuthController_1.AuthController.register);
router.post('/login', (0, validation_1.validate)(validation_2.authSchemas.login), AuthController_1.AuthController.login);
router.post('/verify-email', (0, validation_1.validate)(validation_2.authSchemas.verifyEmail), AuthController_1.AuthController.verifyEmail);
router.post('/forgot-password', (0, validation_1.validate)(validation_2.authSchemas.forgotPassword), AuthController_1.AuthController.forgotPassword);
router.post('/reset-password', (0, validation_1.validate)(validation_2.authSchemas.resetPassword), AuthController_1.AuthController.resetPassword);
router.post('/refresh-token', (0, validation_1.validate)(validation_2.authSchemas.refreshToken), AuthController_1.AuthController.refreshToken);
// Protected routes
router.post('/logout', auth_1.authenticate, AuthController_1.AuthController.logout);
router.get('/profile', auth_1.authenticate, AuthController_1.AuthController.getProfile);
exports.default = router;
//# sourceMappingURL=auth.js.map