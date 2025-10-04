const User = require("../model/User");
const { createErrorResponse, createSuccessResponse, errorCodes } = require("../utils/errorHandler");

exports.addUser = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;
    const emailExist = await User.findOne({ email: email });
    if (emailExist)
      return res.status(400).json(createErrorResponse(
        errorCodes.DUPLICATE_ENTRY,
        "Email already exists",
        null,
        400
      ));

    const user = new User({
      name,
      phoneNumber,
      email,
      password: password,
    });

    await user.save();
    res.status(200).json(createSuccessResponse(
      { user },
      "User added successfully"
    ));
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json(createErrorResponse(
      errorCodes.INTERNAL_ERROR,
      "Internal server error",
      error.message,
      500
    ));
  }
};

exports.unfair = async (req, res, next) => {
  try {
    const user = await Response.findById(req.user);
    var x = user.switchCounter;
    user.switchCounter = ++x;
    await user.save();
    res.status(200).json(createSuccessResponse(null, "Switch counter updated"));
  } catch (err) {
    res.status(500).json(createErrorResponse(
      errorCodes.INTERNAL_ERROR,
      "Failed to update switch counter",
      err.message,
      500
    ));
  }
};

exports.getUsers = async (req, res, next) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const results = {};
  results.total = await User.find({}).countDocuments()
  try {
    await User.find({}).skip((page - 1) * limit).limit(limit).sort({ name: 1 }).then(result => {
      if (result) {
        results.results = result;
        results.page = req.query.page;
        res.status(200).json(createSuccessResponse(results, "Users retrieved successfully"));
      } else {
        res.status(404).json(createErrorResponse(
          errorCodes.NOT_FOUND,
          "No Users Found",
          null,
          404
        ));
      }
    })
  } catch (error) {
    res.status(500).json(createErrorResponse(
      errorCodes.INTERNAL_ERROR,
      "Failed to retrieve users",
      error.message,
      500
    ));
  }
}

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    await User.updateOne({ _id: id }, req.body)
    res.status(200).json(createSuccessResponse(null, "User updated successfully"));
  } catch (error) {
    res.status(500).json(createErrorResponse(
      errorCodes.INTERNAL_ERROR,
      "Failed to update user",
      error.message,
      500
    ));
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await User.deleteOne({ _id: id })
    res.status(200).json(createSuccessResponse(null, "User deleted successfully"));
  } catch (error) {
    res.status(500).json(createErrorResponse(
      errorCodes.INTERNAL_ERROR,
      "Failed to delete user",
      error.message,
      500
    ));
  }
};