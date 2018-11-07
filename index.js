const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
const axios = require("axios");

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const mongoose = require("mongoose");
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/allocine-api",
  { useNewUrlParser: true }
);

const myKey = "da5d68d586ecca7ea39c2c9c3a31f39c";

app.get("/api/search", function(req, res) {
  let movie = req.query.q;
  let page = req.query.p;

  axios
    .get(
      "https://api.themoviedb.org/3/search/movie?api_key=" +
        myKey +
        "&language=fr-FR&query=" +
        encodeURI(movie) +
        "&page=" +
        page
    )
    .then(function(response) {
      res.json(response.data.results);
    })
    .catch(function(err) {
      console.log(err.message);
    });
});

app.get("/api/movies/:type", function(req, res) {
  axios
    .get(
      "https://api.themoviedb.org/3/movie/" +
        req.params.type +
        "?api_key=" +
        myKey +
        "&language=fr-FR&page=" +
        req.query.p
    )
    .then(function(response) {
      res.json(response.data.results);
    })
    .catch(function(err) {
      console.log(err.message);
    });
});

const UserModel = mongoose.model("User", {
  email: String,
  password: String,
  token: String,
  salt: String,
  hash: String,
  email: String,
  lists: Array
});

app.post("/api/sign_up", function(req, res) {
  const password = req.body.password;
  const salt = uid2(16);
  const hash = SHA256(password + salt).toString(encBase64);

  newUser = new UserModel({
    email: req.body.email,
    token: uid2(16),
    salt: salt,
    hash: hash
  });
  newUser.save(function(err, userSaved) {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.json({
        _id: newUser._id,
        token: newUser.token,
        email: newUser.email,
        lists: newUser.lists,
        toto: "test"
      });
    }
  });
});

app.listen(process.env.PORT || 3000, function() {
  console.log("server is up");
});
