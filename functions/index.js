// no need for config as .firebasesc contains defaults config

const functions = require("firebase-functions");
const express = require("express");
const app = express();
const { db } = require("./utils/admin");

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
  getUserDetails,
  getAuthenticatedUser,
  followUser,
  unfollowUser,
  markNotificationsRead
} = require("./handlers/users");

// TODO
// follow each other

app.post("/user/follow", authenticate, followUser);
app.post("/user/unfollow", authenticate, unfollowUser);

/**
 *
 */
app.post("/signup", signUp);
/**
 *
 */
app.post("/login", login);
/**
 * Get user details
 */
app.get("/user/:handle", getUserDetails);
/**
 * Update user details
 */
app.post("/user", authenticate, addUserDetails);
/**
 *
 */
app.post("/user/image", authenticate, uploadImage);
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

/**
 *
 */
app.post("/notifications", authenticate, markNotificationsRead);

// TODO
// delete scream
//

exports.api = functions.https.onRequest(app);
// exports.api = functions.region('europe-west1').https.onRequest(app);

/**
 *
 * NOTIFICATIONS API
 *
 */
exports.createNotificationOnLike = functions.firestore
  .document("likes/{id}")
  .onCreate(likeSnapshot => {
    return db
      .doc(`/screams/${likeSnapshot.data().screamId}`)
      .get()
      .then(screamDoc => {
        // user cannot like get notifications if he likes his own scream
        console.log("createNotificationOnLike: ", screamDoc);
        if (
          screamDoc.exists &&
          screamDoc.data().userHandle !== likeSnapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${likeSnapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: screamDoc.data().userHandle,
            sender: likeSnapshot.data().userHandle,
            type: "like",
            read: false, // nnot yet see this notification
            screamId: screamDoc.id
          });
        }
      })
      .catch(err => {
        console.error(err);
      });
  });

/**
 *
 */
exports.deleteNotificationOnUnlike = functions.firestore
  .document("likes/{id}")
  .onDelete(like => {
    return db
      .doc(`/notifications/${like.data().screamId}`)
      .delete()
      .then(() => {
        console.log("notification successfully deleted");
      })
      .catch(err => {
        console.error(err);
      });
  });

/**
 *
 */
exports.createNotificationOnComment = functions.firestore
  .document("comments/{id}")
  .onCreate(comment => {
    return db
      .doc(`/screams/${comment.data().screamId}`)
      .get()
      .then(screamDoc => {
        // user cannot like get notifications if he likes his own scream
        if (
          screamDoc.exists &&
          screamDoc.data().userHandle !== comment.data().userHandle
        ) {
          return db.doc(`/notifications/${comment.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: screamDoc.data().userHandle,
            sender: comment.data().userHandle,
            type: "comment",
            read: false, // nnot yet see this notification
            screamId: screamDoc.id
          });
        }
      })
      .catch(err => {
        console.error(err);
      });
  });

/**
 *
 */
exports.onUserImageChange = functions.firestore
  .document("users/{userId}")
  .onUpdate(change => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.imageUrl !== after.imageUrl) {
      const batch = db.batch();
      console.log("user profile image changed");
      return db
        .collection("screams")
        .where("userHandle", "==", after.handle) // can be before.handle, no matter
        .get()
        .then(data => {
          data.forEach(doc => {
            const scream = db.doc(`/screams/${doc.id}`);
            batch.update(scream, { userImage: after.imageUrl });
          });

          return batch.commit();
        })
        .catch(err => {
          console.error(err);
          return res
            .status(500)
            .json({ error: "batch write operation failed" });
        });
    } else {
      return true;
    }
  });

/**
 *
 */
exports.onScreamDeleted = functions.firestore
  .document("screams/{screamId}")
  .onDelete((snapshot, context) => {
    const screamId = context.params.screamId;
    const batch = db.batch();

    return db
      .collection("comments")
      .where("screamId", "==", screamId)
      .get()
      .then(comments => {
        comments.forEach(doc => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });

        return db
          .collection("likes")
          .where("screamId", "==", screamId)
          .get();
      })
      .then(likes => {
        likes.forEach(doc => {
          batch.delete(db.doc(`/likes/${doc.id}`));
        });

        return db
          .collection("notifications")
          .where("screamId", "==", screamId)
          .get();
      })
      .then(notifications => {
        notifications.forEach(doc => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });

        return batch.commit();
      })
      .catch(err => {
        console.error(err);
      });
  });

// exports.createNotificationOnFollow = functions.firestore.document(`/users/`);
// exports.createNotificationOnUnfollow = functions.firestore.document(`/users/`);
