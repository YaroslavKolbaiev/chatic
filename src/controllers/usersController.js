import { modelUser } from "../model/userModel.js";
import bcrypt from "bcrypt";
import { ApiError } from "../exemptions/ApiError.js";
import { v4 as uuidv4 } from "uuid";
import { send } from "../services/emailService.js";
import { jwtService } from "../services/jwtService.js";

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

  const activationToken = uuidv4();

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await modelUser.create({
    email,
    userName,
    password: hashedPassword,
    activationToken,
  });

  const link = `${process.env.CLIENT_URL}/activation/${activationToken}`;
  
  await send({
    email,
    subject: "account registration",
    html: `
      <h1>Account activation</h1>
      <a href="${link}">${link}</a>
    `,
  });

  res.send({ user });
}

async function activate(req, res, next) {
  const { activationToken } = req.params;

  const existingUser = await modelUser.findOne({ activationToken });

  if (!existingUser) {
    throw ApiError.BadRequest('User does not exist')
  }

  await modelUser.updateOne(
    {activationToken: activationToken},
    {$set: { activationToken: null }}
  )

  await sendAuth(res, existingUser);
}

async function login(req, res, next) {
  const { email, password } = req.body;

  const existingUser = await modelUser.findOne({ email });

  if (!existingUser) {
    throw ApiError.BadRequest("User does not exist");
  }

  const isValidPassword = await bcrypt.compare(password, existingUser.password);

  if (!isValidPassword) {
    throw ApiError.BadRequest("Password incorrect");
  }

  await sendAuth(res, existingUser);
}

async function setAvatar(req, res, next) {
  const { email } = req.params;
  const avatarImage = req.body.image;
  const user = await modelUser.findOneAndUpdate(
    { email },
    {
      isAvatarImageSet: true,
      avatarImage,
    }
  );

  if (!user) {
    throw ApiError.BadRequest("User does not exist");
  }

  res.send({
    isSet: true,
  });
}

async function getAllUsers(req, res, next) {
  const { id } = req.params;
  const users = await modelUser
    .find({ _id: { $ne: id }, activationToken: null })
    .select(["email", "userName", "avatarImage", "_id"]);

  if (!users) {
    throw ApiError.BadRequest("User does not exist");
  }

  res.send(users);
}

async function sendAuth(res, user) {
  const { email, _id } = user;
  const id = _id.toString();
  const accessToken = jwtService.generateAccessToken({email, id});

  res.send({
    user: {
      _id,
      email,
    },
    accessToken,
  })
}

export const userController = {
  register,
  login,
  setAvatar,
  getAllUsers,
  activate,
};
