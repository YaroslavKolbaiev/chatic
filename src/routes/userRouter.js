import express from "express";
import { userController } from "../controllers/usersController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { catchError } from "../utils/catchError.js";

export const userRouter = new express.Router();

userRouter.post("/register", catchError(userController.register));

userRouter.get(
  "/activation/:activationToken",
  catchError(userController.activate)
);

userRouter.post("/login", catchError(userController.login));
userRouter.get("/refresh", catchError(userController.refresh));
userRouter.post("/setAvatar/:email", catchError(userController.setAvatar));

userRouter.get(
  "/allUsers/:id",
  catchError(authMiddleware),
  catchError(userController.getAllUsers)
);

userRouter.post("/logout", catchError(userController.logout));
