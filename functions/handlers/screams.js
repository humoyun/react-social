const { db } = require("../utils/admin");

/**
 *
 */
exports.getAllScreams = (req, res) => {
  db.collection("screams")
    .orderBy("createdAt", "desc")
    .get()
    .then(snapshot => {
      const screams = [];

      snapshot.forEach(doc => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
          commentCount: doc.data().commentCount,
          likeCount: doc.data().likeCount
        });
      });

      return res.json(screams);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ err: err.code });
    });
};

/**
 *
 */
exports.createScream = (req, res) => {
  if (req.method !== "POST")
    return res
      .status(400)
      .json({ error: "Method not allowed {only POST method}" });

  if (req.body.body.trim() === "")
    return res.status(400).json({ body: "Body cannot be empty" });

  const newScream = {
    body: req.body.body,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0
  };

  db.collection("screams")
    .add(newScream)
    .then(doc => {
      const respScream = { ...newScream, id: doc.id };
      // respScream.id = doc.id;
      res.json(respScream);
    })
    .catch(err => {
      res.status(500).json({ error: "Something happened on server" });
      console.error(err);
    });
};

/**
 *
 */
exports.getScream = (req, res) => {
  let scream = {};

  db.doc(`/screams/${req.params.screamId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Scream not found" });
      }

      try {
        scream = doc.data();
        scream.screamId = doc.id;
      } catch (error) {
        console.error(error);
      }

      return db
        .collection("comments")
        .where("screamId", "==", req.params.screamId)
        .orderBy("createdAt", "desc")
        .get();
    })
    .then(data => {
      scream.comments = [];

      data.forEach(doc => {
        scream.comments.push(doc.data());
      });
      return res.json(scream);
    })
    .catch(err => {
      return res.status(500).json({ error: err.code });
    });
};

exports.commentOnScream = (req, res) => {
  if (req.body.body.trim() === "")
    return res.status(400).json({ error: "Comment must not be empty" });

  let newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    screamId: req.params.screamId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl
  };

  db.doc(`/screams/${req.params.screamId}`)
    .get()
    .then(doc => {
      if (!doc.exists)
        return res.status(404).json({ error: "Scream not found" });

      const scream = doc.data();
      return doc.ref.update({ commentCount: scream.commentCount + 1 });
    })
    .then(() => {
      return db.collection("comments").add(newComment);
    })
    .then(() => {
      return res.json(newComment);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: "Something has happened" });
    });
};

/**
 *
 */
exports.likeScream = (req, res) => {
  const likeDoc = db
    .collection("likes")
    .where("userHandle", "==", req.user.handle)
    .where("screamId", "==", req.params.screamId)
    .limit(1);

  const screamDoc = db.doc(`/screams/${req.params.screamId}`);
  let scream;

  screamDoc
    .get()
    .then(doc => {
      if (doc.exists) {
        scream = doc.data();
        scream.screamId = doc.id;

        return likeDoc.get();
      } else {
        return res.status(404).json({ error: "Scream not found" });
      }
    })
    .then(data => {
      // check whether this scream is already liked or not
      if (data.empty) {
        return db
          .collection("likes")
          .add({
            screamId: req.params.screamId,
            userHandle: req.user.handle
          })
          .then(() => {
            scream.likeCount += 1;
            return screamDoc.update({ likeCount: scream.likeCount });
          })
          .then(() => {
            return res.json(scream);
          });
      } else {
        // this scream has already been liked by this user
        return res.status(400).json({ error: "scream already liked" });
      }
    })
    .catch(err => {
      return res.status(500).json({ error: err.code });
    });
};

/**
 *
 */
exports.unlikeScream = (req, res) => {
  const likeDoc = db
    .collection("likes")
    .where("userHandle", "==", req.user.handle)
    .where("screamId", "==", req.params.screamId)
    .limit(1);

  const screamDoc = db.doc(`/screams/${req.params.screamId}`);

  let scream;

  screamDoc
    .get()
    .then(doc => {
      if (doc.exists) {
        scream = doc.data();
        scream.screamId = doc.id;

        return likeDoc.get();
      } else {
        return res.status(400).json({ error: "Scream not found" });
      }
    })
    .then(data => {
      if (data.empty) {
        return res.status(400).json({ error: "Scream not liked" });
      } else {
        // remove like record for this scream from likes collections
        return db
          .doc(`/likes/${data.docs[0].id}`)
          .delete()
          .then(() => {
            scream.likeCount -= 1;
            return screamDoc.update({ likeCount: scream.likeCount });
          })
          .then(() => {
            res.json(scream);
          });
      }
    })
    .catch(err => {
      return res.status(500).json({ error: err.code });
    });
};

exports.deleteScream = (req, res) => {
  const screamDoc = db.doc(`/screams/${req.params.screamId}`);

  screamDoc
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Scream not found" });
      }
      if (doc.data().userHandle !== req.user.handle) {
        return res.status(403).json({ error: "Unauthorized" });
      } else {
        return screamDoc.delete();
      }
    })
    .then(() => {
      res.json({ message: "scream removed successfully" });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ err: err.code });
    });
};
