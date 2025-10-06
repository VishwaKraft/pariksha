const express = require("express");
const questionController = require("../controller/questionController");
const testController = require("../controller/testController");
const responseController = require("../controller/responseController");
const { authTest, checkEndTime } = require("../controller/authController");
const { createErrorResponse, createSuccessResponse, errorCodes } = require("../utils/errorHandler");
const {
    checkEndTime: checkEndTimeOld,
    checkStartTime,
    remainingTime,
} = require("../controller/authController");
const router = express.Router();
const { body } = require("express-validator");

// @route   POST /get-questions
// @desc    Get 10 random questions
router.get(
    "/get-questions",
    checkStartTime,
    remainingTime,
    questionController.getQuestionsForTest
);

// @route   POST /submit-responses
// @desc    Store selected answers
router.post(
    "/submit-responses",
    checkEndTimeOld,
    responseController.saveResponses
);

// @route   POST /end-test
// @desc    Store selected answers
router.post("/end-test", checkEndTimeOld, responseController.endTest);

router.patch("/unfairAttempt", responseController.unfair);

module.exports = router;
