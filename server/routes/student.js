const express = require("express");
const {
  checkEndTime,
  checkStartTime,
  remainingTime,
} = require("../controller/authController");
const feedbackController = require("../controller/feedbackController");
const questionController = require("../controller/questionController");
const userController = require("../controller/userController");
const utilController = require("../controller/utilController");
const testController = require("../controller/testController");
const authController = require("../controller/authController");
const router = express.Router();
const { body } = require("express-validator");
const { createErrorResponse, createSuccessResponse, errorCodes } = require("../utils/errorHandler");

// @route   POST /submit-feedback
// @desc    records feedback
router.post(
  "/submit-feedback",
  [
    body("quality", "Please select the quality good/average/bad").exists(),
    body("feedback", "please enter feedback").isString(),
  ],
  utilController.validateRequest,
  feedbackController.addFeedback
);
router.get("/", (req, res) => {
  res.status(200).json(createSuccessResponse(null, "Student route is working"))
})

router.get("/tests", testController.getTest)
router.get("/test/:id", testController.getTest)
router.get("/test-token/:id", checkStartTime, authController.selectTest)

module.exports = router;
