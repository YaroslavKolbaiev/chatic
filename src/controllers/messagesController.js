import { ApiError } from '../exemptions/ApiError.js';
import { modelMessage } from '../model/messageModel.js'

async function getMessages(req, res, next) {
  const { from, to } = req.body;

  if (!from || !to) {
    throw ApiError.BadRequest('Error when loading messages')
  }

  try {
    const messages = await modelMessage.find({
      users: {$all: [from, to]}
    }).sort({ updateAt: 1 });
    const normilizedMessages = messages.map((msg) => {
      return {
        fromMe: msg.sender.toString() === from,
        message: msg.message,
        id: msg._id.toString(),
      }
    });
    res.send(normilizedMessages);
  } catch (error) {
    res.status(500);
  }
}

async function addMessage(req, res, next) {
  const { from, to, message } = req.body;

  if (!from || !to || !message) {
    throw ApiError.BadRequest('Error when sending message')
  }

  try {
    const data = await modelMessage.create({
      message,
      users: [from, to],
      sender: from,
    });
    res.send({msg: 'Message added successfully'})
  } catch (error) {
    res.status(500);
  }
}

export const messagesController = {
  getMessages,
  addMessage
};