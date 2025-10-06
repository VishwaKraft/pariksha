const path = require("path");
const multer = require("multer");
const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");
const dotenv = require("dotenv");

dotenv.config();
AWS.config.update({
  secretAccessKey: process.env.SECRET_ACCESS_KEY ? process.env.SECRET_ACCESS_KEY : "test",
  accessKeyId: process.env.ACCESS_KEY_ID ? process.env.ACCESS_KEY_ID : "test",
  region: process.env.REGION ? process.env.REGION : "test",
});

const s3 = new AWS.S3();

const awsStorage = multerS3({
  s3: s3,
  bucket: process.env.BUCKET ? process.env.BUCKET : "pariksha-bucket",
  ACL: "public-read",
  key: function (req, file, cb) {
    cb(null, Date.now().toString() + file.originalname);
  },
});

exports.uploadImage = multer({
  storage: awsStorage,
  limits: { fileSize: 5000000 },
  key: function (req, file, cb) {
    cb(null, Date.now().toString() + file.originalname);
  }
});