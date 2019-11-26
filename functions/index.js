const functions = require("firebase-functions");
// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

// no need for config as .firebasesc contains defaults config

const express = require("express");
const app = express();

const authenticate = require("./utils/auth");
const {
  getAllScreams,
  createScream,
  getScream,
  commentOnScream,
  likeScream,
  unlikeScream
} = require("./handlers/screams");
const {
  signUp,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser
} = require("./handlers/users");

// intercepts request and checks for token

/**
 *
 */
app.post("/signup", signUp);
/**
 *
 */
app.post("/login", login);
/**
 *
 */
app.post("/user/image", authenticate, uploadImage);
/**
 *
 */
app.post("/user", authenticate, addUserDetails);
/**
 *
 */
app.get("/user", authenticate, getAuthenticatedUser);

/**
 *
 */
app.get("/screams", getAllScreams);
/**
 * Create a new scream
 */
app.post("/scream", authenticate, createScream);
/**
 *
 */
app.get("/screams/:screamId", getScream);
/**
 *
 */
app.post("/screams/:screamId/comment", authenticate, commentOnScream);
/**
 *
 */
app.post("/screams/:screamId/like", authenticate, likeScream);
app.post("/screams/:screamId/unlike", authenticate, unlikeScream);

// TODO
// delete scream
// like a scream
// unlike a scream
// comment on scream
//

exports.api = functions.https.onRequest(app);
// exports.api = functions.region('europe-west1').https.onRequest(app);
