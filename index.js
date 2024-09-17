
import { config } from "dotenv";




import { initDb } from "../BackEnd/dbConfig.js";




import { connectionConfig } from "../BackEnd/dbConfig.js";




import pkg from "pg";




import cors from "cors";




import express from "express";




import authRouter from "./src/Router/authRouter.js";




import userRouter from "./src/Router/userRouter.js";




import EquipeRouter from "./src/Router/EquipeRouter.js";




import PlateauRouter from "./src/Router/PlateauRouter.js";




import congeRouter from "./src/Router/CongeRouter.js";




import remoteRouter from "./src/Router/RemoteRouter.js";




import notificationRouter from "./src/Router/NotificationRouter.js";




import { WebSocketServer } from "ws"; // Import WebSocketServer




import { Server } from "socket.io"; // Import socket.io




import * as dotenv from "dotenv";




const { Pool } = pkg;




dotenv.config();




config();




const pool = new Pool(connectionConfig);




initDb();




//////////////////////////////////////////////////




const app = express();




app.use(express.json());




app.use(express.urlencoded({ extended: true }));




app.use(cors());




app.use("/auth", authRouter);




app.use("/user", userRouter);




app.use("/equipe", EquipeRouter);




app.use("/plateau", PlateauRouter);




app.use("/conge", congeRouter);




app.use("/remote", remoteRouter);




app.use("/notification", notificationRouter);




app.use("/assets", express.static("assets"));




const PORT = 3000;




const server = app.listen(PORT, () => {

  console.log(`Server running on port ${PORT}`);

});




// Initialize Socket.io on top of the HTTP server




const io = new Server(server, {

  cors: {

    origin: "*", // Allow all origins (you can restrict this in production)




    methods: ["GET", "POST"],

  },

});








const connectedUsers = {}; // Map to track connected users by userId

var currectuser;

// Socket.io connection handling

io.on('connection', (socket) => {




  console.log('New client connected:', socket.id);

  console.log('New client connected:', socket.id);

  console.log('Current connectedUsers map:', connectedUsers);




currectuser=socket.id;

socket.on('sendUserID', (data) => {

  console.log('Received message from client sendUserID:', data.userId);

  console.log('New client connected id:', data.userId);




  connectedUsers[ data.userId] = socket.id; 

  console.log('Current connectedUsers map:', connectedUsers);




});

  // Listen for messages from clients

  socket.on('message', (data) => {

    console.log('Received message from client:', data);

    // Optionally broadcast the message to other clients

   // socket.broadcast.emit('message', data);

  });




  // Handle disconnect

  socket.on('disconnect', () => {

    console.log('Client disconnected:', socket.id);

    // Find and remove the user from the connectedUsers list

    for (const userId in connectedUsers) {

      if (connectedUsers[userId] === socket.id) {

        delete connectedUsers[userId];

        console.log(`User ${userId} disconnected`);

        console.log('Current connectedUsers map:', connectedUsers);

        break;

      }

    }

  });

});




// Function to send notification to a specific user

export const sendNotificationToUser = (userId, notification) => {

  console.log('Current connectedUsers map:', connectedUsers);




  const socketId = connectedUsers[userId]; // Get socket ID for the user

  if (socketId) {

    io.to(socketId).emit('notification', notification); // Send notification to the specific user

    console.log(`Notification sent to user: ${userId}`);

  } else {

    console.log(`User ${userId} is not connected`);

  }

};

