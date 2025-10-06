const { validationResult } = require("express-validator");
const Question = require("../model/Question");
const User = require("../model/User");
const Feedback = require("../model/Feedback");
const Test = require("../model/Test");
const Response = require("../model/Response");
const { createErrorResponse, createSuccessResponse, errorCodes } = require("../utils/errorHandler");
const csv = require("csv")

exports.validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(createErrorResponse(
      errorCodes.VALIDATION_ERROR,
      "Validation failed",
      errors.array(),
      422
    ));
  } else {
    next();
  }
};

exports.countEntities = async (req, res, next) => {
  try {
    const [users, questions, feedbacks, tests, responses] = await Promise.all([
      User.countDocuments(),
      Question.countDocuments(),
      Feedback.countDocuments(),
      Test.countDocuments(),
      Response.countDocuments()
    ]);
    
    res.status(200).json(createSuccessResponse(
      { users, questions, feedbacks, tests, responses },
      "Entity counts retrieved successfully"
    ));
  } catch (error) {
    console.error('Error counting entities:', error);
    res.status(500).json(createErrorResponse(
      errorCodes.INTERNAL_ERROR,
      "Internal server error",
      error.message,
      500
    ));
  }
}

exports.getISTfromUTC = (utc) => {
  return utc.toLocaleString("hi-IN")
}

exports.getDurationFromTime = (startTime, endTime) => {
  var delta = Math.abs(endTime - startTime) / 1000;

  // calculate (and subtract) whole days
  var days = Math.floor(delta / 86400);
  delta -= days * 86400;

  // calculate (and subtract) whole hours
  var hours = Math.floor(delta / 3600) % 24;
  delta -= hours * 3600;

  // calculate (and subtract) whole minutes
  var minutes = Math.floor(delta / 60) % 60;
  delta -= minutes * 60;

  // what's left is seconds
  var seconds = delta % 60;
  return {
    hour: hours,
    minute: minutes,
    second: seconds
  }
}

exports.csvParser = async (buffer) => {
  var csvString = buffer.toString('utf8'); // Convert buffer to string
  return new Promise((resolve, reject) => {
    csv.parse(csvString, { columns: true, delimiter: ',' }, function (err, data) {
      if (err) reject(err);
      else resolve(data);
    });
  });
};