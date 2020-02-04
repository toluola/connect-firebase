const functions = require("firebase-functions");
const FBAuth = require("./utils/fbauth");
const { getAllConnects, postConnects } = require("./handlers/connect");
const { userSignup, userLogin } = require("./handlers/user");

const app = require("express")();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

app.get("/connects", getAllConnects);

app.post("/connect", FBAuth, postConnects);

app.post("/signup", userSignup);

app.post("/login", userLogin);

exports.api = functions.https.onRequest(app);
