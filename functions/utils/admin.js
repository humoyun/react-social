const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(require("../keys/admin.json"))
});

const db = admin.firestore();

module.exports = { admin, db };
