const { db } = require("../utils/admin");

exports.getAllConnects = (req, res) => {
  db.collection("connects")
    .orderBy("createdAt", "desc")
    .get()
    .then(data => {
      let connects = [];
      data.forEach(doc => {
        connects.push({
          connectId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt
        });
      });
      return res.json(connects);
    })
    .catch(err => console.error(err));
};

exports.postConnects = (req, res) => {
  const newConnect = {
    body: req.body.body,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0
  };

  db.collection("connects")
    .add(newConnect)
    .then(doc => {
      const resConnect = newConnect;
      resConnect.connectId = doc.id;
      res.json(resConnect);
    })
    .catch(err => {
      res.status(500).json({ error: "something went wrong" });
      console.error(err);
    });
};

exports.getConnect = (req, res) => {
  let connectData = {};
  db.doc(`/connects/${req.params.connectId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Connect not found" });
      }
      connectData = doc.data();
      connectData.connectId = doc.id;
      return db
        .collection("comments")
        .orderBy("createdAt", "desc")
        .where("connectId", "==", req.params.connectId)
        .get();
    })
    .then(data => {
      connectData.comments = [];
      data.forEach(doc => {
        connectData.comments.push(doc.data());
      });
      return res.json(connectData);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.connectComment = (req, res) => {
  if (req.body.body.trim() === "")
    return res.status(400).json({ comment: "Must not be empty" });

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    connectId: req.params.connectId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl
  };
  console.log(newComment);

  db.doc(`/connects/${req.params.connectId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Comment not found" });
      }
      return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
    })
    .then(() => {
      return db.collection("comments").add(newComment);
    })
    .then(() => {
      res.json(newComment);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: "Something went wrong" });
    });
};

exports.likeConnect = (req, res) => {
  const likeDocument = db
    .collection("likes")
    .where("userHandle", "==", req.user.handle)
    .where("connectId", "==", req.params.connectId)
    .limit(1);

  const connectDocument = db.doc(`/connects/${req.params.connectId}`);

  let connectData;

  connectDocument
    .get()
    .then(doc => {
      if (doc.exists) {
        connectData = doc.data();
        connectData.connectId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: "Connect not found" });
      }
    })
    .then(data => {
      if (data.empty) {
        return db
          .collection("likes")
          .add({
            connectId: req.params.connectId,
            userHandle: req.user.handle
          })
          .then(() => {
            connectData.likeCount++;
            return connectDocument.update({ likeCount: connectData.likeCount });
          })
          .then(() => {
            return res.json(connectData);
          });
      } else {
        return res.status(400).json({ error: "Connect already liked" });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.unlikeConnect = (req, res) => {
  const likeDocument = db
    .collection("likes")
    .where("userHandle", "==", req.user.handle)
    .where("connectId", "==", req.params.connectId)
    .limit(1);

  const connectDocument = db.doc(`/connects/${req.params.connectId}`);

  let connectData;

  connectDocument
    .get()
    .then(doc => {
      if (doc.exists) {
        connectData = doc.data();
        connectData.connectId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: "Connect not found" });
      }
    })
    .then(data => {
      if (data.empty) {
        return res.status(400).json({ error: "Connect not liked" });
      } else {
        return db
          .doc(`/likes/${data.docs[0].id}`)
          .delete()
          .then(() => {
            connectData.likeCount--;
            return connectDocument.update({ likeCount: connectData.likeCount });
          })
          .then(() => {
            res.json(connectData);
          });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.deleteConnect = (req, res) => {
  const document = db.doc(`/connects/${req.params.connectId}`);
  document
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Connect not found" });
      }
      if (doc.data().userHandle !== req.user.handle) {
        return res.status(403).json({ error: "Unauthorized" });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      res.json({ message: "Connect deleted successfully" });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
