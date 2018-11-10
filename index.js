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

///////////////////
// MODELES ///
///////////////////

//------------ Modèle USER ------------//
const UserModel = mongoose.model("User", {
  username: {
    type: String
  },
  email: String,
  password: String,
  token: String,
  salt: String,
  hash: String,
  email: String,
  lists: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lists"
  }
});

//------------ Modèle MOVIES ------------//
const MoviesModel = mongoose.model("Movies", {
  id: {
    type: Number
  },
  original_title: String,
  poster_path: String,
  release_date: String
});

//------------ Modèle LISTS ------------//
const ListsModel = mongoose.model("Lists", {
  name: String,
  description: String,
  movies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movies" }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

///////////////////
// MOVIEDB APIS ///
///////////////////

const myKey = "da5d68d586ecca7ea39c2c9c3a31f39c";

//------------ Route SEARCH ------------//
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

//------------ Route TYPE ------------//
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

/////////////////
// User signup //
/////////////////

app.post("/api/sign_up", function(req, res) {
  const password = req.body.password;
  const salt = uid2(16);
  const hash = SHA256(password + salt).toString(encBase64);

  const newUser = new UserModel({
    email: req.body.email,
    token: uid2(16),
    salt: salt,
    hash: hash
  }); // newUser est une instance du model User

  //------------ Sauvegarde newUser ------------//
  newUser.save(function(err, userSaved) {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.json({
        _id: userSaved._id,
        token: userSaved.token,
        email: userSaved.email,
        lists: userSaved.lists
      });
    }
  });
});

////////////////////
// List favorites //
////////////////////

app.post("/api/lists/add", function(req, res) {
  UserModel.findOne({ token: req.headers.authorization.slice(7) }).exec(
    function(err, userAuthenticated) {
      if (err) {
        res.json({
          error: {
            message: "Erreur d'authentitification"
          }
        });
      } else {
        let newList = new ListsModel({
          name: req.body.name,
          description: req.body.description,
          movies: [],
          createdBy: userAuthenticated._id
        });
        ListsModel.findOne({
          createdBy: userAuthenticated._id,
          name: req.body.name
        }).exec(function(err, ListFound) {
          if (ListFound !== null) {
            res.json({ error: "cette liste existe déjà" });
          } else {
            newList.save(function(err, Lists) {
              if (err) {
                console.log("something went wrong");
              } else {
                console.log("Your list has been successfully saved! ");
                /* userAuthenticated.lists.push(newList._id); */
                res.json(Lists);
              }
            });
          }
        });
      }
    }
  );
});

app.listen(process.env.PORT || 3000, function() {
  console.log("server is up");
});
