const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const UserModel = require("../models/user_model.js");
const jwt = require("jsonwebtoken");
const protectedRoute = require("../middleware/protectedResource");
const { JWT_SECRET } = require("../config");
// signup route
router.post("/signup", (req, res) => {
  const {
    fullName,
    email,
    password,
    profileImg,
    street,
    homeAddress,
    state,
    country,
    followers,
    following,
  } = req.body;
  if (
    !fullName ||
    !email ||
    !password ||
    !street ||
    !homeAddress ||
    !state ||
    !country
  ) {
    return res.status(400).json({ error: "Please enter all mandotary fields" });
  }

  UserModel.findOne({ email: email })
    .then((userInDB) => {
      if (userInDB) {
        return res
          .status(500)
          .json({ error: "User with this email already exist" });
      }

      bcryptjs
        .hash(password, 16)
        .then((hashedPassword) => {
          const user = new UserModel({
            fullName,
            email,
            password: hashedPassword,
            profileImg,
            street,
            homeAddress,
            state,
            country,
            followers,
            following,
          });
          user
            .save()
            .then((newUser) => {
              res.status(201).json({
                result: "User signed up successfully",
              });
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

// login backend
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Please enter all mandotary fields" });
  }

  UserModel.findOne({ email: email })
    .then((userInDB) => {
      if (!userInDB) {
        return res.status(401).json({ error: "Invalid Credentials" });
      }

      bcryptjs
        .compare(password, userInDB.password)
        .then((didMatch) => {
          if (didMatch) {
            const jwtToken = jwt.sign({ _id: userInDB._id }, JWT_SECRET);
            const userInfo = {
              _id: userInDB._id,
              email: userInDB.email,
              fullName: userInDB.fullName,
              profileImg: userInDB.profileImg,
              street: userInDB.street,
              homeAddress: userInDB.homeAddress,
              state: userInDB.state,
              country: userInDB.country,
              aboutMe: userInDB.aboutMe,
              gitHub: userInDB.gitHub,
              linkedIn: userInDB.linkedIn,
              faceBook: userInDB.faceBook,
              twitter: userInDB.twitter,
              instagram: userInDB.instagram,
              website: userInDB.website,
              intrest1: userInDB.intrest1,
              intrest2: userInDB.intrest2,
              intrest3: userInDB.intrest3,
              intrest4: userInDB.intrest4,
              followers: userInDB.followers,
              following: userInDB.following,
            };

            res
              .status(200)
              .json({ result: { token: jwtToken, user: userInfo } });
          } else {
            return res.status(401).json({ error: "Invalid Credentials" });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});
//getting data of user for the update REST API
router.get("/updatedata/:_id", async (req, res) => {
  let request = { _id: req.params._id };
  let result = await UserModel.findOne(request);

  if (result) {
    res.send(result);
  } else {
    res.send({ result: "No user found " });
  }
});
//Update Rest APT
/*we can use same address for two diferent api workings , but their method must be different  
  for example for : router.get and router.put,we  can use same address becouse they both have two different get and put method*/
router.put("/updatedata/:_id", async (req, res) => {
  let result = await UserModel.updateOne(
    { _id: req.params._id },
    { $set: req.body }
  ); //here 1st {} object is what is need to be updated , and second {}object is new data that is to be updated
  res.send(result);
});
//Search rest API To search the users from the search bars
router.get("/search/:key", async (req, res) => {
  let result = await UserModel.find({
    $or: [
      { fullName: { $regex: req.params.key } },
      { email: { $regex: req.params.key } },
      { country: { $regex: req.params.key } },
    ],
  }); //$or is used when ever we are searching in more than one field
  //$regex: req.params.key are all standard way to search the data in particular fields
  res.send(result);
});
// get all users
router.get("/users", async (req, res) => {
  try {
    const allusers = await UserModel.find();
    res.status(200).json(allusers);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//REst APi for Single user search
// get a single user
router.get("/singleuser/:id", async (req, res) => {
  try {
    const singleuser = await UserModel.findById(req.params.id);
    if (!singleuser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(singleuser);
    console.log(singleuser);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//REST API for Follow
router.put("/follow", protectedRoute, async (req, res) => {
  try {
    const followedUser = await UserModel.findByIdAndUpdate(
      req.body.followId, // //assume this is the Id of other person which i follow
      { $push: { followers: req.user._id } }, //// here we pushing my Id in followers array of that user which I follow
      { new: true } //to return new record as mongodb by default return us old record
    ).select("-password"); //it stop backend to pass the password to response (security concern)

    await UserModel.findByIdAndUpdate(
      req.user._id, //now here update the following of the logged in user
      { $push: { following: req.body.followId } },
      { new: true }
    ).select("-password");

    const loggedInUser = await UserModel.findById(req.user._id);

    res.json(loggedInUser);
  } catch (error) {
    return res.status(422).json({ error: error.message });
  }
});
//To unfollow
router.put("/unfollow", protectedRoute, async (req, res) => {
  try {
    const followedUser = await UserModel.findByIdAndUpdate(
      req.body.unfollowId, // //assume this is the Id of other person which i follow
      { $pull: { followers: req.user._id } }, //// here we pushing my Id in followers array of that user which I follow
      { new: true } //to return new record as mongodb by default return us old record
    );

    await UserModel.findByIdAndUpdate(
      req.user._id, //now here update the following of the logged in user
      { $pull: { following: req.body.unfollowId } },
      { new: true }
    );

    const loggedInUser = await UserModel.findById(req.user._id);

    res.json(loggedInUser);
  } catch (error) {
    return res.status(422).json({ error: error.message });
  }
});
// To show  all followers
router.get("/followers/:userId", (req, res) => {
  const { userId } = req.params;

  UserModel.findById(userId)
    .populate("followers")
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const followers = user.followers.map((follower) => ({
        fullName: follower.fullName,
        email: follower.email,
        profileImg: follower.profileImg,
      }));

      res.status(200).json({ followers });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Something went wrong" });
    });
});
// For Followings

router.get("/following/:userId", (req, res) => {
  const { userId } = req.params;

  UserModel.findById(userId)
    .populate("following")
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const following = user.following.map((following) => ({
        fullName: following.fullName,
        email: following.email,
        profileImg: following.profileImg,
      }));

      res.status(200).json({ following });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Something went wrong" });
    });
});
module.exports = router;
