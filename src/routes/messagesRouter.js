import express from 'express';
import { messagesController } from '../controllers/messagesController.js';
import { catchError } from '../utils/catchError.js';

export const messagesRouter = new express.Router();

messagesRouter.post('/addmsg', catchError(messagesController.addMessage));
messagesRouter.post('/getmsg', catchError(messagesController.getMessages));
