const Feedback = require("../model/Feedback");
const User = require("../model/User");
const { createErrorResponse, createSuccessResponse, errorCodes } = require("../utils/errorHandler");

exports.addFeedback = async (req, res, next) => {
  try {
    const { feedback, quality } = req.body;
    User.findById(req.user).then(user => {
      const payload = new Feedback({
        UserId: req.user,
        quality,
        name: user.name,
        email: user.email,
        feedback,
      });
      payload.save();
      return res.status(200).json(createSuccessResponse(null, "Feedback submitted successfully"));
    }).catch(err => {
      return res.status(401).json(createErrorResponse(
        errorCodes.AUTHENTICATION_ERROR,
        "User not found",
        err.message,
        401
      ));
    })
  } catch (err) {
    console.log(err);
    return res.status(401).json(createErrorResponse(
      errorCodes.INTERNAL_ERROR,
      "Failed to submit feedback",
      err.message,
      401
    ));
  }
};

exports.getFeedbacks = async (req, res, next) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const results = {};
  results.total = await Feedback.find({}).countDocuments()
  try {
    await Feedback.find({}).skip((page - 1) * limit).limit(limit).sort({ name: 1 }).then(result => {
      if (result) {
        results.results = result;
        results.page = req.query.page;
        res.status(200).json(createSuccessResponse(results, "Feedbacks retrieved successfully"));
      } else {
        res.status(404).json(createErrorResponse(
          errorCodes.NOT_FOUND,
          "No Feedback Found",
          null,
          404
        ));
      }
    })
  } catch (error) {
    res.status(500).json(createErrorResponse(
      errorCodes.INTERNAL_ERROR,
      "Failed to retrieve feedbacks",
      error.message,
      500
    ));
  }
}
