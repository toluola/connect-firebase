const { db } = require("../utils/admin");

exports.userSignup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    comfirmPassword: req.body.comfirmPassword,
    handle: req.body.handle
  };

  let errors = {};
  if (isEmpty(newUser.email)) {
    errors.email = "Email must not be empty";
  } else if (!isEmail(newUser.email)) {
    errors.email = "Must be a valid email address";
  }

  if (isEmpty(newUser.password)) errors.password = "Password must not be empty";
  let token, userId;

  if (newUser.password !== newUser.comfirmPassword)
    errors.confirmPassword = "Password must match";

  if (isEmpty(newUser.handle)) errors.handle = "Handle must not be empty";

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

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

  let errors = {};

  if (isEmpty(user.email)) errors.email = "Email must not be empty";
  if (isEmpty(user.password)) errors.password = "Password must not be empty";

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);
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
