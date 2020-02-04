const firebase = require("firebase");
const { db } = require("../utils/admin");
const config = require("../utils/config");
const { validateSignup, validateLogin } = require("../utils/validators");

firebase.initializeApp(config);

exports.userSignup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  const validate = validateSignup(newUser);
  if (validate) {
    return res.status(400).json(validate);
  }
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({
          error: "This handle already is already taken"
        });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password)
          .then(data => {
            userId = data.user.uid;
            return data.user.getIdToken();
          })
          .then(idToken => {
            token = idToken;
            const userCredentials = {
              handle: newUser.handle,
              email: newUser.email,
              createdAt: new Date().toISOString(),
              userId
            };
            db.doc(`/users/${newUser.handle}`).set(userCredentials);
          })
          .then(() => {
            return res.status(201).json({ token });
          })
          .catch(err => {
            console.error(err);
            if (err.code === "auth/email-already-in-use") {
              return res
                .status(400)
                .json({ email: "Email is already in use " });
            } else {
              return res.status(500).json({ error: err.code });
            }
          });
      }
    });
};

exports.userLogin = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };
  const validate = validateLogin(user);
  if (validate) {
    return res.status(400).json(validate);
  }
  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({ token });
    })
    .catch(err => {
      console.error(err);
      if (err.code === "auth/wrong-password") {
        return res.status(403).json({ error: "Invalid Email or Password" });
      }
      return res.status(500).json({ error: err.code });
    });
};
