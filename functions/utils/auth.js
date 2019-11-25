const { admin, db } = require("./admin");

module.exports = (req, res, next) => {
  let IDToken;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    IDToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    console.error("no token found");
    return res.status(403).json({ error: "Unauthorized" });
  }

  admin
    .auth()
    .verifyIdToken(IDToken)
    .then(decodedToken => {
      // req is passed to the next middleware so token is available in the next handler
      req.user = decodedToken;
      console.log(decodedToken);
      return db
        .collection("users")
        .where("userId", "==", req.user.uid)
        .limit(1)
        .get()
        .then(data => {
          console.log("****************");
          console.log(data);
          req.user.handle = data.docs[0].data().handle;
          return next();
        });
    })
    .catch(err => {
      return res.status(500).json({ error: "Error while verifying token" });
    });
};
