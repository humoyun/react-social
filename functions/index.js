const functions = require("firebase-functions");
const admin = require("firebase-admin");
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

// no need for config as .firebasesc contains defaults config
admin.initializeApp({
  credential: admin.credential.cert(require("./keys/admin.json"))
});

const express = require("express");
const app = express();

app.get("/screams", (req, res) => {
  admin
    .firestore()
    .collection("screams")
    .get()
    .then(snapshot => {
      const screams = [];
      snapshot.forEach(doc => {
        screams.push(doc.data());
      });

      return res.json(screams);
    })
    .catch(err => {
      console.error(err);
    });
});

// exports.getScreams = functions.https.onRequest((req, res) => {
//   console.log("getScreams called");
//   admin
//     .firestore()
//     .collection("screams")
//     .get()
//     .then(snapshot => {
//       const screams = [];
//       snapshot.forEach(doc => {
//         screams.push(doc.data());
//       });

//       return res.json(screams);
//     })
//     .catch(err => {
//       console.error(err);
//     });
// });

exports.createScream = functions.https.onRequest((req, res) => {
  if (req.method !== "POST")
    return res
      .status(400)
      .json({ error: "Method not allowed {only POST method}" });

  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: admin.firestore.Timestamp.fromDate(new Date())
  };

  admin
    .firestore()
    .collection("screams")
    .add(newScream)
    .then(doc => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch(err => {
      res.status(500).json({ error: "Something happened on server" });
      console.error(err);
    });
});

// https://base_url.com/api/screams

exports.api = functions.https.onRequest(app);
