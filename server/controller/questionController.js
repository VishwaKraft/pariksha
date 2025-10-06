const jwt = require("jsonwebtoken");
const ObjectId = require("mongoose").Types.ObjectId;
const User = require("../model/User");
const Question = require("../model/Question");
const Response = require("../model/Response");
const { createErrorResponse, createSuccessResponse, errorCodes } = require("../utils/errorHandler");

exports.postCheckAnswers = (req, res, next) => {
  let token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json(createErrorResponse(
      errorCodes.AUTHENTICATION_ERROR,
      "Token not provided",
      null,
      401
    ));
  }
  token = token.slice(7, token.length);
  jwt.verify(token, process.env.TOKEN_SECRET, async (err, rollNumber) => {
    if (err) {
      return res.status(401).json(createErrorResponse(
        errorCodes.INVALID_TOKEN,
        "Invalid token",
        err.message,
        401
      ));
    }
    let i, j;
    let score = 0;
    
    try {
      const student = await Student.findOne({ rollNumber: rollNumber });
      if (!student) {
        return res.status(404).json(createErrorResponse(
          errorCodes.NOT_FOUND,
          "Student not found",
          null,
          404
        ));
      }
      
      const answers = req.body.answers;
      for (i = 0; i < answers.length; i++) {
        try {
          const question = await Question.findById(answers[i].question);
          if (!question) {
            return res.status(404).json(createErrorResponse(
              errorCodes.NOT_FOUND,
              "Invalid question ID",
              `Question ID: ${answers[i].question} not found`,
              404
            ));
          }
          
          const optionID = question.options;
          for (j = 0; j < optionID.length; j++) {
            if (answers[i].answer == optionID[j]) {
              const option = await Option.findById(optionID[j]);
              if (option.correct) {
                score++;
              }
            }
          }
        } catch (questionError) {
          return res.status(500).json(createErrorResponse(
            errorCodes.INTERNAL_ERROR,
            "Error processing question",
            questionError.message,
            500
          ));
        }
      }
      
      student.score = score;
      await student.save();
      
      res.status(200).json(createSuccessResponse(
        { score },
        "Answers checked successfully"
      ));
    } catch (error) {
      return res.status(500).json(createErrorResponse(
        errorCodes.INTERNAL_ERROR,
        "Error checking answers",
        error.message,
        500
      ));
    }
  });
};

// result for the particular test
exports.getTestResult = (req, res) => {
  const testId = req.params.id;
  let resultTest = [];
  Response.find({ testId })
    .then(async responses => {
      if (!responses || responses.length === 0) {
        return res.status(404).json(createErrorResponse(
          errorCodes.NOT_FOUND,
          "No test responses found",
          null,
          404
        ));
      }
      
      const maxMarks = responses[0].questions.length;
      for (let i = 0; i < responses.length; i++) {
        console.log(`user id is ${responses[i].userId}`);
        let count = 0; let userObj;
        for (let j = 0; j < responses[i].responses.length; j++) {
          let questionId = responses[i].responses[j].question;
          let userAnswer = responses[i].responses[j].response;
          await Question.findById(questionId).then(r => {
            if (r.correct === userAnswer) {
              count++;
            }
          })
          await User.findById(responses[i].userId).then(user => {
            userObj = user;
          })
        }
        // now we know the userId, count, maxMarks
        let singleResult = { "userId": userObj, "marksobt": count, "maxMarks": maxMarks };
        resultTest.push(singleResult);
      }
      res.json(createSuccessResponse(resultTest, "Test results retrieved successfully"));
    })
    .catch(error => {
      res.status(500).json(createErrorResponse(
        errorCodes.INTERNAL_ERROR,
        "Failed to retrieve test results",
        error.message,
        500
      ));
    });
}



// get 25 questions
exports.getQuestionsForTest = async (req, res, next) => {
  const response = await Response.find({ userId: ObjectId(req.user), testId: ObjectId(req.test) });
  // If user already has the questions
  if (response.length !== 0) {
    const result = await Response.aggregate([
      { $match: { userId: ObjectId(req.user), testId: ObjectId(req.test) } },
      {
        $lookup: {
          from: Question.collection.name,
          let: { questionsId: "$questions" },
          as: "questionsDetails",
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$questionsId"] },
              },
            },
            {
              $project: {
                _id: 1,
                question: 1,
                QuestionPic: 1,
                options: ["$one", "$two", "$three", "$four"],
              },
            },
          ],
        },
      },
    ]);
    return res.status(200).json(createSuccessResponse(
      { 
        res_questions: result[0].questionsDetails, 
        time: req.time 
      },
      "Questions retrieved successfully"
    ));
  }

  try {
    let facetQuery = {};

    await Test.findById(req.test).then(result => {
      console.log(result.mandatoryCategory)
      for (let i = 0; i < result.mandatoryCategory.length; i++) {
        facetQuery[result.mandatoryCategory[i]] = [
          { $match: { category: result.mandatoryCategory[i] } },
          { $sample: { size: 5 } },
          {
            $project: {
              _id: 1,
              question: 1,
              QuestionPic: 1,
              options: ["$one", "$two", "$three", "$four"],
            },
          },
        ]
      }

    if(req.query.category)
    {
      facetQuery["language"] = [
        { $match: { category: req.query.category } },
        { $sample: { size: 5 } },
        {
          $project: {
            _id: 1,
            question: 1,
            QuestionPic: 1,
            options: ["$one", "$two", "$three", "$four"],
          },
        },
      ]
    }
      
      console.log(facetQuery);

    });

    const res_questions = await Question.aggregate([
      {
        $facet: facetQuery,
      },
    ]);

    var keys = Object.keys(facetQuery);
    let temp_questions_arr = [];
    let ret_questions = [];

    for (var i = 0; i < keys.length; i++) {

      const temp = await res_questions[0][keys[i]].map((item) =>
        item._id
      );
      ret_questions = [...ret_questions, ...res_questions[0][keys[i]]]
      temp_questions_arr = [...temp_questions_arr, ...temp];
    }
   

try {
  await (new Response({ 
    userId: ObjectId(req.user), 
    testId: ObjectId(req.test), 
    questions: temp_questions_arr, 
    responses: [] 
  })).save();
} catch (error) {
  console.error('Error saving response:', error);
  return res.status(500).json(createErrorResponse(
    errorCodes.INTERNAL_ERROR,
    "Failed to save test session",
    error.message,
    500
  ));
}
    return res.status(200).json(createSuccessResponse(
      { res_questions: ret_questions, time: req.time },
      "Questions retrieved successfully"
    ));
  } catch (err) {
    console.log(err)
    return res.status(500).json(createErrorResponse(
      errorCodes.INTERNAL_ERROR,
      "Server error",
      err.message,
      500
    ));
  }
};

// to add questions
exports.addQuestions = async (req, res) => {
  let QuestionPic = ""
  if(req.file)
  {
    QuestionPic = req.file.location
  }
  const { question, one, two, three, four, correct, category } = req.body;

  try {
    const new_question = new Question({
      question,
      one,
      two,
      three,
      four,
      correct,
      category,
      QuestionPic
    });

    await new_question.save();

    return res.status(200).json(createSuccessResponse(null, "Question saved successfully"));
  } catch (err) {
    if (err) {
      res.status(500).json(createErrorResponse(
        errorCodes.INTERNAL_ERROR,
        "Failed to save question",
        err.message,
        500
      ));
    }
  }
};

// to add questions
exports.addAllQuestions = async (req, res) => {
  const questions = req.body;
  
  // Validate that questions is an array
  if (!Array.isArray(questions)) {
    return res.status(400).json(createErrorResponse(
      errorCodes.VALIDATION_ERROR, 
      "Invalid data format", 
      "Expected an array of questions",
      400
    ));
  }
  
  // Validate data structure for each question
  const requiredFields = ['question', 'one', 'two', 'three', 'four', 'correct', 'category'];
  const invalidQuestions = [];
  
  questions.forEach((q, index) => {
    const missingFields = requiredFields.filter(field => 
      !q.hasOwnProperty(field) || !q[field] || q[field].toString().trim() === ''
    );
    if (missingFields.length > 0) {
      invalidQuestions.push({
        row: index + 1,
        missingFields: missingFields
      });
    }
  });
  
  if (invalidQuestions.length > 0) {
    return res.status(400).json(createErrorResponse(
      errorCodes.VALIDATION_ERROR,
      "Invalid data format",
      {
        message: "Missing required fields in some questions",
        invalidQuestions: invalidQuestions
      },
      400
    ));
  }
  
  try {
    await Question.insertMany(questions);
    return res.status(200).json(createSuccessResponse(
      { count: questions.length },
      `${questions.length} questions saved successfully`
    ));
  } catch (err) {
    console.log(err);
    return res.status(500).json(createErrorResponse(
      errorCodes.INTERNAL_ERROR,
      "Server Error", 
      err.message,
      500
    ));
  }
};

exports.getQuestions = async (req, res, next) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const results = {};
  results.total = await Question.find({}).countDocuments()
  try {
    await Question.find({}).skip((page - 1) * limit).limit(limit).sort({ category: 1 }).then(result => {
      if (result) {
        results.results = result;
        results.page = req.query.page;
        res.status(200).json(createSuccessResponse(results, "Questions retrieved successfully"));
      } else {
        res.status(404).json(createErrorResponse(
          errorCodes.NOT_FOUND,
          "No Questions Found",
          null,
          404
        ));
      }
    })
  } catch (error) {
    res.status(500).json(createErrorResponse(
      errorCodes.INTERNAL_ERROR,
      "Failed to retrieve questions",
      error.message,
      500
    ));
  }
}

exports.getCategory = async (req, res, next) => {
  try {
    await Question.distinct('category').then(result => {
      if (result) {
        res.status(200).json(createSuccessResponse(result, "Categories retrieved successfully"));
      } else {
        res.status(404).json(createErrorResponse(
          errorCodes.NOT_FOUND,
          "No Categories Found",
          null,
          404
        ));
      }
    })
  } catch (error) {
    console.log(error)
    res.status(500).json(createErrorResponse(
      errorCodes.INTERNAL_ERROR,
      "Failed to retrieve categories",
      error.message,
      500
    ));
  }
}

exports.deleteQuestion = async (req, res) => {
  const { id } = req.params;
  try {
    await Question.deleteOne({ _id: id })
    res.status(200).json(createSuccessResponse(null, "Question deleted successfully"));
  } catch (error) {
    res.status(500).json(createErrorResponse(
      errorCodes.NOT_FOUND,
      "Not able to find the question to be deleted",
      error.message,
      500
    ));
  }
};

exports.updateQuestion = async (req, res) => {
  const { id } = req.params;
  try {
    await Question.updateOne({ _id: id }, req.body)
    res.status(200).json(createSuccessResponse(null, "Question updated successfully"));
  } catch (error) {
    res.status(500).json(createErrorResponse(
      errorCodes.NOT_FOUND, 
      "Not able to find the question to be updated",
      error.message,
      500
    ));
  }
};
