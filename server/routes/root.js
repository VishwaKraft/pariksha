const router = require("express").Router();
const utilController = require("../controller/utilController");
const userController = require("../controller/userController");
const authController = require("../controller/authController");
const moment = require("moment-timezone");
const { body, oneOf } = require("express-validator");
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.CLIENT_ID)
const User = require("../model/User");
const jwt = require("jsonwebtoken");
const { createErrorResponse, createSuccessResponse, errorCodes } = require("../utils/errorHandler");


// const auth = require('../middleware/auth')

// @route   POST /register
// @desc    Register user and return user object
// @access  Public
router.post(
  "/register",
  [
    body("name", "Name is required").isString().exists(),
    body("phoneNumber", "Phone Number is required").isString().isLength({ min: 10, max: 10 }).exists(),
    body("email", "email is required").isEmail().exists(),
    body("password", "password of min length 5 required")
      .isLength({ min: 5 })
      .exists(),
  ],
  utilController.validateRequest,
  userController.addUser
);

// @route   POST /login
// @desc    Login user and return jwt and user object
// @access  Public
router.post(
  "/login",
  [
    body('email').exists().isEmail(),
    body("password", "Invalid Credentials").isLength({ min: 5 })
      .exists(),
  ],
  utilController.validateRequest,
  authController.login
);

router.get("/time", (req, res) => {
  var d = process.env.TESTENDTIME * 1 - 1800000;  // time stamp of 18 Aug 4:00 PM IST
  res.status(200).json(createSuccessResponse(
    {
      epoch: d,
      time: new Date(d).toUTCString(),
      India: moment.unix(d / 1000).tz("Asia/Kolkata").toLocaleString(),
    },
    "Time information retrieved successfully"
  ));
});

// Handle OPTIONS preflight requests for Google OAuth
router.options("/api/v1/auth/google", (req, res) => {
  res.status(200).end();
});

// !TODO refactoring is needed
router.post("/api/v1/auth/google", async (req, res) => {
  
  const { token } = req.body;
  
  // Check if token exists
  if (!token) {
    return res.status(400).json(createErrorResponse(
      errorCodes.VALIDATION_ERROR,
      'Google ID token is required',
      null,
      400
    ));
  }
  
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID
    });
    const data = ticket.getPayload();
    
    await User.findOne({ email: data.email }).then(async (user) => {
      if (user === null) {
        console.log("creating new user");
        user = new User({
          name: data.name,
          email: data.email,
          profileUrl: data.picture
        });
        await user.save().then(user => {
          jwt.sign(
            { user: user._id },
            process.env.TOKEN_SECRET,
            { expiresIn: "1d" },
            async (err, token) => {
              return res.json(createSuccessResponse(
                {
                  token: token,
                  user: user
                },
                "User registered and logged in successfully"
              ));
            }
          );
        });
      } else {
        console.log("Modifying the user");
        console.log(user);
        user.name = data.name;
        user.email = data.email;
        user.profileUrl = data.picture;
        await user.save();
        if (user.password != undefined) {
          user.password = "encrpted"
        }
        jwt.sign(
          { user: user._id },
          process.env.TOKEN_SECRET,
          { expiresIn: "1d" },
          async (err, token) => {
            return res.json(createSuccessResponse(
              {
                token: token,
                user: user
              },
              "User logged in successfully"
            ));
          }
        );
      }
    }).catch(err => {
      console.error('Database error:', err);
      res.status(422).json(createErrorResponse(
        errorCodes.INTERNAL_ERROR,
        'Some error occurred',
        err.message,
        422
      ));
    })
  } catch (error) {
    console.error('Google OAuth verification error:', error);
    res.status(400).json(createErrorResponse(
      errorCodes.AUTHENTICATION_ERROR,
      'Invalid Google ID token',
      error.message,
      400
    ));
  }
})

module.exports = router;
