"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const School_1 = require("../models/School");
const auth_1 = require("../middleware/auth");
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
// Get all schools (public route for registration)
router.get('/', async (req, res) => {
    try {
        const schools = await School_1.SchoolModel.findAll();
        res.json({
            success: true,
            data: schools.map(school => ({
                id: school.id,
                name: school.name,
                address: school.address,
                logoUrl: school.logoUrl,
            })),
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching schools:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch schools',
        });
    }
});
// Get school by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const school = await School_1.SchoolModel.findById(id);
        if (!school) {
            res.status(404).json({
                success: false,
                error: 'School not found',
            });
            return;
        }
        res.json({
            success: true,
            data: school,
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching school:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch school',
        });
    }
});
// Get school statistics (admin only)
router.get('/:id/stats', auth_1.authenticate, (0, auth_1.requireRole)('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        // Check if user belongs to this school
        if (req.user.schoolId !== id && req.user.role !== 'admin') {
            res.status(403).json({
                success: false,
                error: 'Access denied',
            });
            return;
        }
        const stats = await School_1.SchoolModel.getSchoolStats(id);
        res.json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching school stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch school statistics',
        });
    }
});
exports.default = router;
//# sourceMappingURL=schools.js.map