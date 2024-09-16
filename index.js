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

// Socket.io connection handling

io.on("connection", (socket) => {
  console.log("New client connected");

  // Emit a welcome message when a client connects

  socket.emit("message", { message: "Welcome to the Socket.io server" });

  // Listen for messages from clients

  socket.on("message", (data) => {
    console.log("Received message from client:", data);

    // Optionally broadcast the message to other clients

    socket.broadcast.emit("message", data);
  });

  // Listen for a disconnect event

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Function to broadcast a notification to all clients

export const broadcastNotification = (notification) => {
  io.emit("notification", notification); // Broadcast the notification
};
