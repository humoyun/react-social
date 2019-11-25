const { db } = require("../utils/admin");

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
    createdAt: new Date().toISOString()
  };

  db.collection("screams")
    .add(newScream)
    .then(doc => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch(err => {
      res.status(500).json({ error: "Something happened on server" });
      console.error(err);
    });
};
