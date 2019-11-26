// no need for config as .firebasesc contains defaults config

const functions = require("firebase-functions");
const express = require("express");
const app = express();

const authenticate = require("./utils/auth");
const {
  getAllScreams,
  createScream,
  getScream,
  commentOnScream,
  likeScream,
  unlikeScream,
  deleteScream
} = require("./handlers/screams");

const {
  signUp,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser
} = require("./handlers/users");

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
 * Update user details
 */
app.post("/user", authenticate, addUserDetails);
/**
 *
 */
app.get("/user", authenticate, getAuthenticatedUser);
/**
 * get all screams
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
app.get("/screams/:screamId/like", authenticate, likeScream);
/**
 *
 */
app.get("/screams/:screamId/unlike", authenticate, unlikeScream);
/**
 *
 */
app.delete("/screams/:screamId", authenticate, deleteScream);

// TODO
// delete scream
//

exports.api = functions.https.onRequest(app);
// exports.api = functions.region('europe-west1').https.onRequest(app);
