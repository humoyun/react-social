const functions = require("firebase-functions");
// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

// no need for config as .firebasesc contains defaults config

const express = require("express");
const app = express();

const authenticate = require("./utils/auth");
const { getAllScreams, createScream } = require("./handlers/screams");
const { signUp, login, uploadImage } = require("./handlers/users");

// intercepts request and checks for token

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
app.post("/signup", signUp);
/**
 *
 */
app.post("/login", login);

app.post("/user/image", uploadImage);

exports.api = functions.https.onRequest(app);
// exports.api = functions.region('europe-west1').https.onRequest(app);
