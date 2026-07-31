const express = require('express');
const router = express.Router();
const { getMonitoringStats, getActiveSessions, getSuspiciousActivities } = require('../controller/monitorController');

// Get monitoring statistics
router.get('/stats', getMonitoringStats);

// Get active test sessions
router.get('/active-sessions', getActiveSessions);

// Get suspicious activities
router.get('/suspicious', getSuspiciousActivities);

module.exports = router;
