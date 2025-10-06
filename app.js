var createError = require("http-errors");
const express = require("express");
var path = require("path");
const app = express();
var logger = require("morgan");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const studentRoute = require("./routes/student");
const testRoute = require("./routes/test");
const indexRoute = require("./routes/root");
const adminRoute = require("./routes/admin");
const { authStudent, authTest, authAdmin } = require("./controller/authController");
const cors = require("cors");
const { createErrorResponse, errorCodes } = require("./utils/errorHandler");

dotenv.config();
const PORT = process.env.PORT || 3000;

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Connect to Mongo
mongoose
  .connect(process.env.DB_CONNECT, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Handling GET request",
  });
});

//middleware
app.use(express.json());

app.use(logger("dev"));

//Cors Policy
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

//middleware
app.use("/api/", indexRoute);
app.use("/api/student", authStudent, studentRoute);
app.use("/api/test", authTest, testRoute);
app.use("/api/admin",authAdmin, adminRoute);

app.use((req, res) => {
  res.status(404).send("404 Not Found");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json(
    createErrorResponse(
      errorCodes.INTERNAL_ERROR,
      err.message || "Something went wrong!",
      err.stack,
      err.statusCode || 500
    )
  );
});

module.exports = app;
