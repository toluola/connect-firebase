const functions = require("firebase-functions");
const FBAuth = require("./utils/fbauth");
const {
  getAllConnects,
  postConnects,
  getConnect,
  connectComment,
  likeConnect,
  unlikeConnect,
  deleteConnect
} = require("./handlers/connect");
const {
  userSignup,
  userLogin,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser
} = require("./handlers/user");

const app = require("express")();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

app.get("/connects", getAllConnects);
app.post("/connect", FBAuth, postConnects);
app.get("/connect/:connectId", getConnect);
app.post("/connect/:connectId/comments", FBAuth, connectComment);
app.get("/connect/:connectId/like", FBAuth, likeConnect);
app.get("/connect/:connectId/unlike", FBAuth, unlikeConnect);
app.delete("/connect/:connectId", FBAuth, deleteConnect);

app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);
app.post("/user/image", FBAuth, uploadImage);

app.post("/signup", userSignup);
app.post("/login", userLogin);

exports.api = functions.https.onRequest(app);
