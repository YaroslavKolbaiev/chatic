import { modelUser } from "../model/userModel.js";
import bcrypt from "bcrypt";
import { ApiError } from "../exemptions/ApiError.js";

function validateEmail(value) {
  if (!value) {
    return "Email is required";
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return "Email is not valid";
  }
}

const validatePassword = (value) => {
  if (!value) {
    return "Password is required";
  }

  if (value.length < 6) {
    return "At least 6 characters";
  }
};

async function register(req, res, next) {
  const { userName, email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.BadRequest("validation error", errors);
  }

  const usernameCheck = await modelUser.findOne({ userName });

  if (usernameCheck) {
    throw ApiError.BadRequest("Username is already taken");
  }

  const emailCheck = await modelUser.findOne({ email });

  if (emailCheck) {
    throw ApiError.BadRequest("Email is already taken");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await modelUser.create({
    email,
    userName,
    password: hashedPassword,
  });

  delete user.password;

  res.send({ user });
}

async function login(req, res, next) {
  const { userName, password } = req.body;

  const existingUser = await modelUser.findOne({ userName });

  if (!existingUser) {
    throw ApiError.BadRequest("User does not exist");
  }

  const isValidPassword = await bcrypt.compare(password, existingUser.password);

  if (!isValidPassword) {
    throw ApiError.BadRequest("Password incorrect");
  }

  delete existingUser.password;

  res.send({ user: existingUser });
}

async function setAvatar(req, res, next) {
  const { email } = req.params;
  const avatarImage = req.body.image;
  const user = await modelUser.findOneAndUpdate({ email }, {
    isAvatarImageSet: true,
    avatarImage,
  })

  if (!user) {
    throw ApiError.BadRequest("User does not exist");
  }

  res.send({ 
    isSet: true,
    image: avatarImage,
  });
}

async function getAllUsers(req, res, next) {
  const { id } = req.params;
  const users = await modelUser.find({_id: {$ne: id} }).select([
    "email",
    "userName",
    "avatarImage",
    "_id",
  ])

  if (!users) {
    throw ApiError.BadRequest("User does not exist");
  }

  res.send(users);
}

export const userController = {
  register,
  login,
  setAvatar,
  getAllUsers,
};
