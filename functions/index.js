const functions = require("firebase-functions");
const FBAuth = require("./utils/fbauth");
const { db } = require("./utils/admin");
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
app.post("/connect/:connectId/comment", FBAuth, connectComment);
app.get("/connect/:connectId/like", FBAuth, likeConnect);
app.get("/connect/:connectId/unlike", FBAuth, unlikeConnect);
app.delete("/connect/:connectId", FBAuth, deleteConnect);

app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);
app.post("/user/image", FBAuth, uploadImage);

app.post("/signup", userSignup);
app.post("/login", userLogin);

exports.api = functions.https.onRequest(app);

exports.onUserImageChange = functions.firestore
  .document("/users/{userId}")
  .onUpdate(change => {
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log("image has changed");
      const batch = db.batch();
      return db
        .collection("connects")
        .where("userHandle", "==", change.before.data().handle)
        .get()
        .then(data => {
          data.forEach(doc => {
            const connect = db.doc(`/connects/${doc.id}`);
            batch.update(connect, { userImage: change.after.data().imageUrl });
          });
          return batch.commit();
        });
    } else return true;
  });

exports.onConnectDelete = functions.firestore
  .document("/connects/{connectId}")
  .onDelete((snapshot, context) => {
    const connectId = context.params.connectId;
    const batch = db.batch();
    return db
      .collection("comments")
      .where("connectId", "==", connectId)
      .get()
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db
          .collection("likes")
          .where("connectId", "==", connectId)
          .get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/likes/${doc.id}`));
        });
        return batch.commit();
      })
      .catch(err => console.error(err));
  });
