const jwt = require("jsonwebtoken");
const Response = require("../model/Response");
const Test = require("../model/Test");
const User = require("../model/User");

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
          res.json({
            token: token,
            user: { "email": "admin@deloitte.com", "name": "Admin" }
          });
        }
      );
    } else {
      res.status(401).json({ error: "Password Incorrect" });
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
              res.json({
                token: token,
                user: user
              });
            }
          );
        } else {
          res.status(401).json({ error: "Password Incorrect" });
        }
      } else {
        res.status(400).json({ error: "No User Exist" });
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
          .json({ success: false, error: "Token Is Not Valid" });
      }
    } catch (ex) {
      return res
        .status(403)
        .json({ success: false, error: "Token Is Not Valid" });
    }
  } else {
    return res.status(403).json({ success: false, error: "Token Is Not Valid" });
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
          .json({ success: false, error: "Token Is Not Valid" });
      }
    } catch (ex) {
      return res
        .status(403)
        .json({ success: false, error: "Token Is Not Valid" });
    }
  } else {
    return res.status(403).json({ success: false, error: "Token Is Not Valid" });
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
      res.status(400).json({
        error: "Not a right time to start the test",
      });
    }
  }).catch(err => {
    res.status(400).json({
      error: "Invalid Test.",
    });
  })

};

exports.checkEndTime = (req, res, next) => {
  var d = new Date();
  var c = d.getTime();
  Test.findById(req.test).then(result => {
    if (c <= result.endTime) {
      next();
    } else {
      res.status(400).json({
        error: "Test has Ended",
      });
    }
  }).catch(err => {
    res.status(400).json({
      error: "Some Invalid operations",
    });
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
        res.status(500).json({ success: false, error: "Already Attempted Test" })
      } else {
        jwt.sign(
          { user: userId, test: id },
          process.env.TOKEN_SECRET,
          { expiresIn: ttime },
          async (err, token) => {
            res.json({
              success: true,
              token: token
            });
          }
        );
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ success: false });
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
          .json({ success: false, error: "Token Is Not Valid" });
      }
    } catch (ex) {
      return res
        .status(403)
        .json({ success: false, error: "Token Is Not Valid" });
    }
  } else {
    return res.status(403).json({ success: false, error: "Token Is Not Valid" });
  }
};
