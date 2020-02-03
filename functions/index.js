const functions = require("firebase-functions");

const express = require("express");
const firebase = require("firebase");
const { getAllConnects, postConnects } = require("./handlers/connect");
const { userSignup, userLogin } = require("./handlers/user");

const firebaseConfig = {
  apiKey: "AIzaSyC-OPgJACtwMTRi2HF_B-AozaHrlf8_9vU",
  authDomain: "connectx-97390.firebaseapp.com",
  databaseURL: "https://connectx-97390.firebaseio.com",
  projectId: "connectx-97390",
  storageBucket: "connectx-97390.appspot.com",
  messagingSenderId: "995262261497",
  appId: "1:995262261497:web:51ab903c3d74431bf25a28",
  measurementId: "G-1SKLW8QL83"
};

const app = express();
firebase.initializeApp(firebaseConfig);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
const isEmpty = string => {
  if (string.trim() === "") return true;
  else return false;
};

const isEmail = email => {
  const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regex)) return true;
  else return false;
};

const FBAuth = (req, res, next) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    console.error("No token found");
    return res.status(403).json({ error: "unauthorized" });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then(decodedToken => {
      req.user = decodedToken;
      return db
        .collection("users")
        .where("userId", "==", req.user.uid)
        .limit(1)
        .get();
    })
    .then(data => {
      req.user.handle = data.docs[0].data().handle;
      return next();
    })
    .catch(err => {
      console.error("Error while verifying");
      return res.status(403).json(err);
    });
};

app.get("/connects", getAllConnects);

app.post("/connect", FBAuth, postConnects);

app.post("/signup", userSignup);

app.post("/login", userLogin);

exports.api = functions.https.onRequest(app);
