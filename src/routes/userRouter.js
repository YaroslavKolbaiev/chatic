import express from 'express';
import { userController } from '../controllers/usersController.js';
import { catchError } from '../utils/catchError.js';

export const userRouter = new express.Router();

userRouter.post('/register', catchError(userController.register));
userRouter.post('/login', catchError(userController.login));
userRouter.post('/setAvatar/:email', catchError(userController.setAvatar));
userRouter.get('/allUsers/:id', catchError(userController.getAllUsers));
