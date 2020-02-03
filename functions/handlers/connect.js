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
    createdAt: new Date().toISOString()
  };

  db.collection("connects")
    .add(newConnect)
    .then(doc => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch(err => {
      res.status(500).json({ error: "something went wrong" });
      console.error(err);
    });
};
