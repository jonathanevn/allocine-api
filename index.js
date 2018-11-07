const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
const axios = require("axios");

const mongoose = require("mongoose");
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/allocine-api"
);
console.log("Hello World");
app.listen(process.env.PORT || 3000);
