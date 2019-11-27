const { admin, db } = require("../utils/admin");
const firebase = require("firebase");
const config = require("../utils/config");
const baseFSUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o`;

firebase.initializeApp(config);

const {
  validateLoginData,
  validateSignUpData,
  reduceUserDetails
} = require("../utils/validation");

/**
 *
 */
exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };

  const { valid, errors } = validateLoginData(user);
  if (!valid) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({ token });
    })
    .catch(err => {
      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
      )
        return res.status(403).json({ general: "Wrong credentials" });
      return res.status(500).json({ error: err.code });
    });
};

/**
 *
 */
exports.signUp = (req, res) => {
  // password should be hashed with salt
  const newUser = {
    email: req.body.email,
    handle: req.body.handle,
    password: req.body.password,
    confirmedPassword: req.body.confirmedPassword
  };

  const { valid, errors } = validateSignUpData(newUser);
  if (!valid) return res.status(400).json(errors);

  const defaultProfImg = `${baseFSUrl}/user_profile.jpg?alt=media`;
  let token, userId;

  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res
          .status(400)
          .json({ handle: "this handle has been already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(data => {
      token = data;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        imageUrl: defaultProfImg,
        createdAt: new Date().toISOString(),
        userId
      };

      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch(err => {
      console.error(err);
      if (err.code === "auth/email-already-in-use")
        return res.status(400).json({ email: "email is already in use" });
      else
        return res
          .status(500)
          .json({ general: "Something went wrong, please try again" });
    });
};

/**
 *
 */
exports.uploadImage = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  const busboy = new BusBoy({ headers: req.headers });
  let imgToUpload = {};
  let imgFileName;

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    // image
    if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
      return res.status(400).json({ error: "wrong file type submitted" });
    }

    const index = filename.lastIndexOf(".");
    const imgExt = filename.substr(index + 1);
    const _randName = Math.random()
      .toString(36)
      .substr(2, 9);
    imgFileName = `${_randName}.${imgExt}`;
    const filePath = path.join(os.tmpdir(), imgFileName);
    imgToUpload = { filePath, mimetype };

    file.pipe(fs.createWriteStream(filePath));
  });

  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(imgToUpload.filePath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imgToUpload.mimetype
          }
        }
      })
      .then(() => {
        console.log("**************");

        const imgURL = `${baseFSUrl}/${imgFileName}?alt=media`;
        console.log("....>", imgURL);
        // req.user.handle comes from authenicate middleware
        return db.doc(`/users/${req.user.handle}`).update({ imageUrl: imgURL });
      })
      .then(() => {
        console.log("image uplaoded successfully ");
        return res.json({ message: "image uplaoded successfully" });
      })
      .catch(err => {
        console.error("error happendedL: ", err);
        return res.status(500).json({ error: err.code });
      });
  });

  busboy.end(req.rawBody);
};

/**
 * Add extra information to the existing user
 */
exports.addUserDetails = (req, res) => {
  let userDetails = reduceUserDetails(req.body);

  db.doc(`/users/${req.user.handle}`)
    .update(userDetails)
    .then(() => {
      return res.json({ message: "Details added successfully" });
    })
    .catch(err => {
      return res.status(500).json({ error: err.code });
    });
};

/**
 *
 */
exports.getUserDetails = (req, res) => {
  let userData = {};

  db.doc(`/users/${req.params.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        userData.user = doc.data();
        return db
          .collection("screams")
          .where("userHandle", "==", req.params.handle)
          .orderBy("createdAt", "desc")
          .get();
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    })
    .then(data => {
      userData.screams = [];

      data.forEach(doc => {
        const tmp = doc.data();
        userData.screams.push({
          body: tmp.body,
          userHandle: tmp.userHandle,
          userImage: tmp.userImage,
          createdAt: tmp.createdAt,
          likeCount: tmp.likeCount,
          commentCount: tmp.commentCount,
          screamId: doc.id
        });
      });

      return res.json(userData);
    })
    .catch(err => {
      return res.status(500).json({ error: err.code });
    });
};

/**
 * .
 */
exports.getAuthenticatedUser = (req, res) => {
  const userData = {};
  db.doc(`/users/${req.user.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        userData.credentials = doc.data();
        return db
          .collection("likes")
          .where("userHandle", "==", req.user.handle)
          .get();
      }
    })
    .then(data => {
      userData.likes = [];

      data.forEach(doc => {
        userData.likes.push(doc.data());
      });

      return db
        .collection("notifications")
        .where("recipient", "==", req.user.handle)
        .orderBy("createdAt", "desc")
        .limit(20) // this is optional
        .get();
    })
    .then(data => {
      userData.notifications = [];

      data.forEach(doc => {
        userData.notifications.push({
          recipient: doc.data().recipient,
          sender: doc.data().sender,
          notificationId: doc.id,
          type: doc.data().type,
          read: doc.data().read,
          screamId: doc.data().screamId,
          createdAt: doc.data().createdAt
        });
      });

      return res.json(userData);
    })
    .catch(err => {
      return res.status(500).json({ error: err.code });
    });
};

exports.markNotificationsRead = (req, res) => {
  // batch write
  let batch = db.batch();

  req.body.forEach(notifId => {
    const notif = db.doc(`/notifications/${notifId}`);
    batch.update(notif, { read: true });
  });

  batch.commit().then(() => {
    return res.json({ message: "Notifications marked as read" });
  });
};

/**
 *
 */
exports.followUser = (req, res) => {
  console.log("***** FOLLOW USER CALLED *****");
  // a person who is being followed
  const followeeDoc = db.doc(`/users/${req.query.followeeId}`);
  // a person who followes
  const followerDoc = db.doc(`/users/${req.user.id}`);
};

/**
 *
 */
exports.unfollowUser = (req, res) => {
  console.log("***** UNFOLLOW USER CALLED *****");
};
