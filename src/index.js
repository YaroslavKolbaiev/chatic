import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import { userRouter } from './routes/userRouter.js';
import { messagesRouter } from './routes/messagesRouter.js';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { errorMiddleware } from './middlewares/errorMiddleware.js';

const app = express();
const PORT = process.env.PORT || 5500;

app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use('/api/auth', userRouter);
app.use('/api/chat', messagesRouter);
app.use(errorMiddleware);

app.get('/', (req, res) => {
  res.send('Chatic is live...');
});

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to database')
}).catch((error) => {
  console.log(error.message);
})

const server = app.listen(PORT, () => {
  console.log(`Server started on http://localhost${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  }
})

let rooms = [];

io.on('connection', (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);
  socket.on('disconnect', () => {
    console.log('🔥: A user disconnected');
  });

  socket.on('join chat', (room) => {
    socket.join(room.chat.toString());
    rooms.push(room.chat);
  });

  socket.on('exit chat', (room) => {
    socket.leave(room.toString());
    rooms = rooms.filter(currentRoom => currentRoom.toString() !== room.toString());
  });

  socket.on('newMsg', (newMsg) => {

    const selectedRoom = rooms.find(room => room.toString() === newMsg.chat.toString());

    if (!selectedRoom) return console.log('Current chat disconnected');

    const newMessage = {
      fromMe: newMsg.from === rooms,
      message: newMsg.msg,
      id: uuidv4(),
    }

    socket.in(selectedRoom.toString()).emit('msg rcvd', newMessage);
  })
})
