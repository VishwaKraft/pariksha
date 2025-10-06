const express = require("express");
const questionController = require("../controller/questionController");
const userController = require("../controller/userController");
const utilController = require("../controller/utilController");
const testController = require("../controller/testController");
const feedbackController = require("../controller/feedbackController");
const responseController = require("../controller/responseController");
const router = express.Router();
const { body } = require("express-validator");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const UtilController = require("../controller/utilController");
const QuestionController = require("../controller/questionController");
const fileController = require("../controller/fileController");
const { createErrorResponse, createSuccessResponse, errorCodes } = require("../utils/errorHandler");

router.post("/check-answers", questionController.postCheckAnswers);

router.get("/get-result/:id", questionController.getTestResult);

// @route   POST /add-question
// @desc    Add questions to database
// @access  Public
router.post("/add-question", fileController.uploadImage.single('image'), questionController.addQuestions);
router.post("/upload-questions", upload.single("file"), async (req, res, next) => {
    const file = req.file;
    if (!file) {
      return res.status(422).json(createErrorResponse(
        errorCodes.VALIDATION_ERROR, 
        "No file uploaded",
        null,
        422
      ));
    }
    
    try {
      const data = await UtilController.csvParser(req.file.buffer);
      req.body = data;
      next();
    } catch (err) {
      console.log(err);
      return res.status(400).json(createErrorResponse(
        errorCodes.VALIDATION_ERROR,
        "Invalid CSV file format", 
        err.message,
        400
      ));
    }
  }, QuestionController.addAllQuestions)
//get All Users
// router.post("/users", userController.getUsers);

router.get("/count", utilController.countEntities);
router.get("/users", userController.getUsers);
router.put("/user/:id", userController.updateUser);
router.delete("/user/:id", userController.deleteUser);
router.get("/questions", questionController.getQuestions);
router.delete("/question/:id", questionController.deleteQuestion);
router.put("/question/:id", questionController.updateQuestion);
router.get("/category", questionController.getCategory);
router.post("/test", fileController.uploadImage.single('image'),
    [
        body("description", "Description is required").isString().exists(),
        body("mandatoryCategory", "MandatoryCategory is required").isArray().isLength({ min: 1 }),
        body("title", "Title can't be empty")
            .isLength({ min: 1 })
    ],
    utilController.validateRequest,
    testController.addTest)
router.get("/tests", testController.getTest)
router.put("/test/:id", testController.updateTest);
router.delete("/test/:id", testController.deleteTest);
router.get("/feedbacks", feedbackController.getFeedbacks);
router.get("/responses", responseController.getAllResponses)
router.delete("/response/:id", responseController.deleteResponseById)

module.exports = router;
