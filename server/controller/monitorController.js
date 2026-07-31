const Response = require("../model/Response");
const User = require("../model/User");
const Test = require("../model/Test");

// Get monitoring statistics
exports.getMonitoringStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalTests = await Test.countDocuments();
    const totalResponses = await Response.countDocuments();
    
    // Get active test sessions (responses created in last 24 hours)
    const activeSessions = await Response.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    // Get responses with high switch counts (potential cheating)
    const suspiciousSessions = await Response.countDocuments({
      switchCounter: { $gt: 5 }
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalTests,
        totalResponses,
        activeSessions,
        suspiciousSessions
      }
    });
  } catch (error) {
    console.error('Error getting monitoring stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get monitoring statistics'
    });
  }
};

// Get active test sessions
exports.getActiveSessions = async (req, res) => {
  try {
    const activeSessions = await Response.find({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })
    .populate('userId', 'name email')
    .populate('testId', 'name')
    .select('userId testId switchCounter createdAt')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: activeSessions
    });
  } catch (error) {
    console.error('Error getting active sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get active sessions'
    });
  }
};

// Get suspicious activities
exports.getSuspiciousActivities = async (req, res) => {
  try {
    const suspiciousSessions = await Response.find({
      switchCounter: { $gt: 3 }
    })
    .populate('userId', 'name email')
    .populate('testId', 'name')
    .select('userId testId switchCounter createdAt')
    .sort({ switchCounter: -1 });

    res.status(200).json({
      success: true,
      data: suspiciousSessions
    });
  } catch (error) {
    console.error('Error getting suspicious activities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get suspicious activities'
    });
  }
};
