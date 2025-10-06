const Response = require("../model/Response");
const { createErrorResponse, createSuccessResponse, errorCodes } = require("../utils/errorHandler");
const ObjectId = require("mongoose").Types.ObjectId;

exports.unfair = async (req, res, next) => {
  try {
    const response = await Response.findOne({ userId: ObjectId(req.user), testId: ObjectId(req.test) });
    var x = response.switchCounter;
    response.switchCounter = x + 1;
    await response.save();
    res.status(200).json(createSuccessResponse(null, "Switch counter updated successfully"));
  } catch (err) {
    res.status(500).json(createErrorResponse(
      errorCodes.INTERNAL_ERROR,
      "Failed to update switch counter",
      err.message,
      500
    ));
  }
};


// store responses
exports.saveResponses = async (req, res, next) => {
  try {
    const response = await Response.findOne({ userId: ObjectId(req.user), testId: ObjectId(req.test) });
    if (!response) {
      return res.status(404).json(createErrorResponse(
        errorCodes.NOT_FOUND,
        "Response not found",
        "No active test session found for this user",
        404
      ));
    }

    selected = req.body.responses;

    selected.forEach((element) => {
      if (element.response === 1) {
        element.response = "one";
      } else if (element.response === 2) {
        element.response = "two";
      } else if (element.response === 3) {
        element.response = "three";
      } else if (element.response === 4) {
        element.response = "four";
      } else {
        element.response = "negative";
      }
    });

    let subs = [...selected];
    let resp = [];
    if (typeof response.responses !== "undefined" && response.responses.length > 0) {
      resp = [...response.responses];
    }

    respOb = {};
    resp.forEach((ele) => {
      respOb[ele["question"]] = ele["response"];
    });

    subsOb = {};
    subs.forEach((ele) => {
      subsOb[ele["question"]] = ele["response"];
    });

    respObj = {
      ...respOb,
      ...subsOb,
    };

    let finalResp = [];
    Object.keys(respObj).forEach((ele) => {
      ob = {};
      ob["question"] = ele;
      ob["response"] = respObj[ele];
      ob["status"] = "saved";
      finalResp.push(ob);
    });

    await Response.updateOne({ userId: ObjectId(req.user), testId: ObjectId(req.test) }, {
      $set: {
        responses: finalResp
      }
    })
    return res.status(200).json(createSuccessResponse(null, "Responses saved successfully"));
  } catch (err) {
    console.log(err)
    res.status(500).json(createErrorResponse(
      errorCodes.INTERNAL_ERROR,
      "Failed to save responses",
      err.message,
      500
    ));
  }
};

// endTest
exports.endTest = async (req, res) => {
  try {
    const response = await Response.findOne({ userId: ObjectId(req.user), testId: ObjectId(req.test) });
    if (!response) {
      return res.status(404).json(createErrorResponse(
        errorCodes.NOT_FOUND,
        "Response not found",
        "No active test session found for this user",
        404
      ));
    }

    const selected = req.body.responses;

    selected.forEach((element) => {
      if (element.response === 1) {
        element.response = "one";
      } else if (element.response === 2) {
        element.response = "two";
      } else if (element.response === 3) {
        element.response = "three";
      } else if (element.response === 4) {
        element.response = "four";
      } else {
        element.response = "negative";
      }
    });

    let subs = [...selected];
    let resp = [];
    if (typeof response.responses !== "undefined" && response.responses.length > 0) {
      resp = [...response.responses];
    }

    const previousAttempted = [];
    resp.forEach((ele) => {
      previousAttempted.push(ele["question"]);
    });

    const respToSave = subs.filter((ele) => {
      return !previousAttempted.includes(ele.question);
    });

    respToSave.forEach((ele) => {
      ele.status = "marked";
    });

    const finalResp = [...resp, ...respToSave];

    await Response.updateOne({ userId: ObjectId(req.user), testId: ObjectId(req.test) }, {
      $set: {
        responses: finalResp
      }
    })
    return res.status(200).json(createSuccessResponse(null, "Test ended successfully"));
  } catch (err) {
    return res.status(500).json(createErrorResponse(
      errorCodes.INTERNAL_ERROR,
      "Failed to end test",
      err.message,
      500
    ));
  }
};

exports.getAllResponses = async (req, res, next) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const results = {};
  results.total = await Response.find({}).countDocuments()
  try {
    await Response.aggregate([
      {
        $addFields: {
          max: { $size: "$questions" },
        },
      },
      {
        $unwind: {
          path: "$responses",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "questions",
          let: { questionid: { $toObjectId: "$responses.question" } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$questionid", "$_id"],
                },
              },
            },
          ],
          as: "correct",
        },
      },
      {
        $unwind: {
          path: "$correct",
          preserveNullAndEmptyArrays: true,
        }
      },
      {
        $addFields: {
          score: {
            $cond: [{
              $and: [
                { $ifNull: ["$correct", false] },
                { $eq: ["$correct.correct", "$responses.response"] }
              ],
            }, 1, 0],
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          userId: { $first: "$userId" },
          testId: { $first: "$testId" },
          hasAttempted: { $first: "$hasAttempted" },
          switchCounter: { $first: "$switchCounter" },
          score: { $sum: "$score" },
          max: { $first: "$max" }
        },
      },
      {
        $lookup: {
          from: "users", // collection name derived from your model
          let: { uid: { $toObjectId: "$userId" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$uid"] },
              },
            },
            {
              $project: {
                name: 1,        // ✅ we only need the user's name
                profileUrl: 1,  // optional — include profile image if you want
                _id: 0,
              },
            },
          ],
          as: "userDetails",
        },
      },
      {
        $addFields: {
          name: { $arrayElemAt: ["$userDetails.name", 0] },
          profileUrl: { $arrayElemAt: ["$userDetails.profileUrl", 0] }, // optional
        },
      },
      {
        $project: {
          userDetails: 0, // remove the temp field
        },
      }
    ]).then(result => {
      if (result && result.length > 0) {
        results.results = result;
        results.page = req.query.page;
        res.status(200).json(createSuccessResponse(results, "Responses retrieved successfully"));
      } else {
        res.status(404).json(createErrorResponse(
          errorCodes.NOT_FOUND,
          "No Responses Found",
          null,
          404
        ));
      }
    })
  }
  catch (error) {
    res.status(500).json(createErrorResponse(
      errorCodes.INTERNAL_ERROR,
      "Failed to retrieve responses",
      error.message,
      500
    ));
  }
}

exports.deleteResponseById = (req, res, next) => {
  Response.findByIdAndDelete(req.params.id)
    .then(result => {
      if (!result) {
        return res.status(404).json(createErrorResponse(
          errorCodes.NOT_FOUND,
          "Response not found",
          `Response with ID ${req.params.id} does not exist`,
          404
        ));
      }
      res.json(createSuccessResponse(null, "Response deleted successfully"));
    })
    .catch(err => {
      res.status(500).json(createErrorResponse(
        errorCodes.INTERNAL_ERROR,
        "Failed to delete response",
        err.message,
        500
      ));
    });
}
