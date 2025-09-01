"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TemperatureController_1 = require("../controllers/TemperatureController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const validation_2 = require("../middleware/validation");
const router = (0, express_1.Router)();
// All temperature routes require authentication and verification
router.use(auth_1.authenticate, auth_1.requireVerification);
// Get current temperature data
router.get('/current', TemperatureController_1.TemperatureController.getCurrentTemperature);
// Submit temperature vote
router.post('/vote', (0, validation_1.validate)(validation_2.temperatureSchemas.vote), TemperatureController_1.TemperatureController.submitVote);
// Get temperature statistics
router.get('/stats', TemperatureController_1.TemperatureController.getTemperatureStats);
// Get temperature zones
router.get('/zones', TemperatureController_1.TemperatureController.getZones);
exports.default = router;
//# sourceMappingURL=temperature.js.map