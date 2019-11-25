const { admin, db } = require("../utils/admin");
const firebase = require("firebase");
const config = require("../utils/config");

firebase.initializeApp(config);

const {
  validateLoginData,
  validateSignUpData
} = require("../utils/validation");

exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };

  const { valid, errors } = validateLoginData(user);
  if (!valid) return res.status(400).json(errors);

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
      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
      )
        return res.status(400).json({ error: "Wrong credentials" });
      return res.status(500).json({ error: err.code });
    });
};

exports.signUp = (req, res) => {
  // password should be hashed with salt
  const newUser = {
    email: req.body.email,
    handle: req.body.handle,
    password: req.body.password,
    confirmedPassword: req.body.confirmedPassword
  };

  const { valid, errors } = validateSignUpData(newUser);
  if (!valid) return res.status(400).json(errors);

  let token, userId;
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res
          .status(400)
          .json({ handle: "this handle has been already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(data => {
      token = data;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId
      };

      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch(err => {
      console.error(err);
      if (err.code === "auth/email-already-in-use")
        return res.status(400).json({ email: "email is already in use" });
      else return res.status(500).json({ err: err.code });
    });
};

exports.uploadImage = (req, res, next) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  const busboy = new BusBoy({ headers: req.headers });
  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    // image
    const index = filename.lastIndexOf(".");
    const imageExt = filename.substr(index + 1);
  });

  busboy.on("finish", () => {
    admin.storage().bucket;
  });
};
