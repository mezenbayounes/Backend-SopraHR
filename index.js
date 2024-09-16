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
import { WebSocketServer } from "ws"; // Import WebSocketServer


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

app.use("/assets", express.static("assets"));

const PORT = 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// WebSocket Integration
const wss = new WebSocketServer({ server }); // Create WebSocket server on top of HTTP server

// Handling WebSocket connections
wss.on("connection", (ws) => {
  console.log("New WebSocket connection");

  // Send a welcome message to new clients
  ws.send(JSON.stringify({ message: "Welcome to the WebSocket server" }));

  // Handle incoming messages from clients
  ws.on("message", (data) => {
    const message = JSON.parse(data);
    console.log("Received message from client:", message);
  });

  // Handle WebSocket disconnections
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// Function to broadcast a message to all connected clients
export const broadcastNotification = (notification) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(notification));
    }
  });
};

