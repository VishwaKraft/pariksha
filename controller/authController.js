const jwt = require("jsonwebtoken");
const Response = require("../model/Response");
const Test = require("../model/Test");
const User = require("../model/User");
const { createErrorResponse, createSuccessResponse, errorCodes } = require("../utils/errorHandler");

const checkToken = (req) => {
  const header = req.headers["authorization"];
  if (typeof header !== "undefined") {
    const bearer = header.split(" ");
    return { success: true, token: bearer[1] };
  } else {
    return { success: false };
  }
};

exports.login = (req, res) => {
  if (req.body.email === "pariksha@deloitte.com") {
    if (req.body.password === "advancePass@123") {
      jwt.sign({ user: "admin" }, process.env.TOKEN_SECRET, { expiresIn: "1d" },
        async (err, token) => {
          const responseData = {
            token: token,
            user: { "email": "admin@deloitte.com", "name": "Admin" }
          };
          res.json(createSuccessResponse(responseData, "Login successful"));
        }
      );
    } else {
      res.status(401).json(createErrorResponse(
        errorCodes.INVALID_CREDENTIALS, 
        "Password Incorrect"
      ));
    }
  } else {
    const { email, password } = req.body;
    User.findOne({ email }).then((user) => {
      if (user) {
        if (user.password === password) {
          jwt.sign(
            { user: user.id },
            process.env.TOKEN_SECRET,
            { expiresIn: "1d" },
            async (err, token) => {
              user.password = 'encrypted';
              const responseData = {
                token: token,
                user: user
              };
              res.json(createSuccessResponse(responseData, "Login successful"));
            }
          );
        } else {
          res.status(401).json(createErrorResponse(
            errorCodes.INVALID_CREDENTIALS, 
            "Password Incorrect"
          ));
        }
      } else {
        res.status(400).json(createErrorResponse(
          errorCodes.NOT_FOUND, 
          "No User Exists"
        ));
      }
    });
  }
};

exports.authStudent = async (req, res, next) => {
  var result = await checkToken(req);
  if (result.success === true && result.token != undefined) {
    try {
      const decoded = await jwt.verify(result.token, process.env.TOKEN_SECRET);
      if (decoded.user) {
        req.user = decoded.user;
        next();
      } else {
        return res
          .status(401)
          .json(createErrorResponse(
            errorCodes.INVALID_TOKEN,
            "Token Is Not Valid",
            null,
            401
          ));
      }
    } catch (ex) {
      return res
        .status(403)
        .json(createErrorResponse(
          errorCodes.INVALID_TOKEN,
          "Token Is Not Valid",
          null,
          403
        ));
    }
  } else {
    return res.status(403).json(createErrorResponse(
      errorCodes.AUTHORIZATION_ERROR,
      "Token Is Not Valid",
      null,
      403
    ));
  }
};

exports.authTest = async (req, res, next) => {
  var result = checkToken(req);
  if (result.success === true && result.token != undefined) {
    try {
      const decoded = jwt.verify(result.token, process.env.TOKEN_SECRET);
      if (decoded.user) {
        req.user = decoded.user;
        req.test = decoded.test;
        next();
      } else {
        return res
          .status(401)
          .json(createErrorResponse(
            errorCodes.INVALID_TOKEN,
            "Token Is Not Valid",
            null,
            401
          ));
      }
    } catch (ex) {
      return res
        .status(403)
        .json(createErrorResponse(
          errorCodes.INVALID_TOKEN,
          "Token Is Not Valid",
          null,
          403
        ));
    }
  } else {
    return res.status(403).json(createErrorResponse(
      errorCodes.AUTHORIZATION_ERROR,
      "Token Is Not Valid",
      null,
      403
    ));
  }
};

exports.checkStartTime = (req, res, next) => {
  var d = new Date();
  var c = d.getTime();
  var testId = req.test ? req.test : req.params.id;
  Test.findById(testId).then(result => {
    console.log(result);
    if (c >= result.startTime && c <= result.endTime) {
      req.testDetails = result;
      next();
    } else {
      res.status(400).json(createErrorResponse(
        errorCodes.INVALID_TEST_TIME,
        "Not a right time to start the test"
      ));
    }
  }).catch(err => {
    res.status(400).json(createErrorResponse(
      errorCodes.INVALID_TEST,
      "Invalid Test."
    ));
  })

};

exports.checkEndTime = (req, res, next) => {
  var d = new Date();
  var c = d.getTime();
  Test.findById(req.test).then(result => {
    if (c <= result.endTime) {
      next();
    } else {
      res.status(400).json(createErrorResponse(
        errorCodes.TEST_ENDED,
        "Test has Ended"
      ));
    }
  }).catch(err => {
    res.status(400).json(createErrorResponse(
      errorCodes.INTERNAL_ERROR,
      "Some Invalid operations"
    ));
  })
};

exports.remainingTime = (req, res, next) => {
  var testStartTime = Date.now();
  var diff = Math.floor((req.testDetails.endTime - testStartTime) / 1000);
  var days = Math.floor(diff / 86400);
  diff = diff - days * 86400;
  var hours = Math.floor(diff / (60 * 60));
  diff = diff - hours * 60 * 60;
  var minutes = Math.floor(diff / 60);
  diff = diff - minutes * 60;
  req.time = { minute: minutes, second: diff, hour: hours, day: days };
  next();
};


exports.selectTest = async (req, res) => {
  const { id } = req.params;
  const userId = req.user;
  const testId = id;
  Test.findById(id).then(async result => {
    var start = result.startTime;
    var end = result.endTime;
    end = Math.ceil((end - start) / (1000 * 60 * 60));
    var ttime = end + 'h';
    try {
      var response = await Response.findOne({ userId, testId })
      if (response) {
        res.status(500).json(createErrorResponse(
          errorCodes.TEST_ALREADY_ATTEMPTED,
          "Already Attempted Test",
          null,
          500
        ));
      } else {
        jwt.sign(
          { user: userId, test: id },
          process.env.TOKEN_SECRET,
          { expiresIn: ttime },
          async (err, token) => {
            res.json(createSuccessResponse(
              { token },
              "Test selected successfully"
            ));
          }
        );
      }
    } catch (error) {
      console.log(error)
      res.status(500).json(createErrorResponse(
        errorCodes.INTERNAL_ERROR,
        "An error occurred",
        error.message,
        500
      ));
    }
  })
};

exports.authAdmin = async (req, res, next) => {
  var result = await checkToken(req);
  if (result.success === true && result.token != undefined) {
    try {
      const decoded = await jwt.verify(result.token, process.env.TOKEN_SECRET);
      if (decoded.user === "admin") {
        // req.user = decoded.user;
        next();
      } else {
        return res
          .status(401)
          .json(createErrorResponse(
            errorCodes.INVALID_TOKEN,
            "Token Is Not Valid",
            null,
            401
          ));
      }
    } catch (ex) {
      return res
        .status(403)
        .json(createErrorResponse(
          errorCodes.INVALID_TOKEN,
          "Token Is Not Valid",
          null,
          403
        ));
    }
  } else {
    return res.status(403).json(createErrorResponse(
      errorCodes.AUTHORIZATION_ERROR,
      "Token Is Not Valid",
      null,
      403
    ));
  }
};
