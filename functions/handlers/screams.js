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
      const respScream = newScream;
      respScream.id = doc.id;
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
exports.likeScream = (req, res) => {};

/**
 *
 */
exports.unlikeScream = (req, res) => {};
