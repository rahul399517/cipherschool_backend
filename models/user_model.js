const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  street: {
    type: String,
    required: true,
  },
  homeAddress: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  aboutMe: {
    type: String,
    default: "Hey ,Add some thing about you .....",
  },
  gitHub: {
    type: String,
    default: "GitHub",
  },
  linkedIn: {
    type: String,
    default: "LinkedIn",
  },
  faceBook: {
    type: String,
    default: "FaceBook",
  },
  twitter: {
    type: String,
    default: "Twitter",
  },
  instagram: {
    type: String,
    default: "Instagram",
  },
  website: {
    type: String,
    default: "Website",
  },
  highestEducation: {
    type: String,
    default: "Highest Education",
  },
  currentStatus: {
    type: String,
    default: "What do you do currently ?",
  },
  intrest1: {
    type: String,
    default: "Select from options ",
  },
  intrest2: {
    type: String,
    default: "Select from options ",
  },
  intrest3: {
    type: String,
    default: "Select from options ",
  },
  intrest4: {
    type: String,
    default: "Select from options ",
  },
  profileImg: {
    type: String,
    default:
      "https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fG1lbnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
  },
  followers: [
    {
      type: ObjectId,
      ref: "UserModel",
    },
  ],
  following: [
    {
      type: ObjectId,
      ref: "UserModel",
    },
  ],
});

const UserModel = mongoose.model("UserModel", userSchema);

module.exports = UserModel;
