import pkg from "pg";
import { connectionConfig } from "../../../dbConfig.js";
import jwt from "jsonwebtoken";

const { Pool } = pkg;
const pool = new Pool(connectionConfig);

// Create a notification and send it via WebSocket
export const createNotification = async (notification) => {
    const { type, content, user_id } = notification;
    const insertQuery = `
      INSERT INTO notifications (type, content, user_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const res = await pool.query(insertQuery, [type, content, user_id]);
    return res.rows[0];
  };

// Find notifications by user ID
export const getNotificationByUserId = async (req, result) => {
  const tokenWithBearer = req.headers.authorization;
  const token = tokenWithBearer ? tokenWithBearer.replace("Bearer ", "") : null;

  if (!token) {
    return result.status(401).json({ error: "Authorization token missing" });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the token has expired
    if (Date.now() >= decoded.exp * 1000) {
      return result.status(401).json({ error: "Token expired" });
    }

    // Extract user_id from request body
    const { user_id } = req.body;

    if (!user_id || isNaN(user_id)) {
      return result.status(400).json({ error: "Invalid or missing user ID" });
    }

    // Query to get conge records for the specific user_id
    const query = "SELECT * FROM notifications WHERE user_id = $1  ORDER BY created_at DESC ";
    const res = await pool.query(query, [user_id]);

    const notifications = res.rows;
    if (notifications.length === 0) {
      return result.status(404).json({ message: "No notifications found for this user" });
    }

    console.log("notifications found for user:", notifications);
    result.json(notifications);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("Token expired error:", error);
      return result.status(401).json({ error: "Token expired" });
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error("JWT error:", error);
      return result.status(401).json({ error: "Invalid token" });
    } else {
      console.error("Error occurred while fetching congés by user ID:", error);
      result.status(500).json({ error: "Internal server error" });
    }
  }
};

// Get notification by ID
export const findNotificationById = async (id) => {
  const res = await pool.query("SELECT * FROM notifications WHERE id = $1", [id]);
  return res.rows[0];
};

// Delete a notification by ID
export const deleteNotification = async (id) => {
  const res = await pool.query("DELETE FROM notifications WHERE id = $1 RETURNING id", [id]);
  return res.rowCount > 0;
};

// Controller method to handle HTTP request for fetching notifications for a user
export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.body;

    const notifications = await getNotificationsForUser(userId);
    if (notifications.length === 0) {
      return res.status(404).send({ message: "No notifications found" });
    }

    res.send({ notifications });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

// Controller method to handle HTTP request for deleting a notification
export const deleteNotificationById = async (req, res) => {
  try {
    const { id } = req.body;

    const deleted = await deleteNotification(id);
    if (!deleted) {
      return res.status(404).send({ error: "Notification not found" });
    }

    res.send({ message: "Notification deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

// Example usage in another controller
export const updateUser = async (req, res) => {
  try {
    const { userId, newData } = req.body;

    // Logic for updating the user in the database
    const updatedUser = await pool.query(
      "UPDATE users SET ... WHERE id = $1 RETURNING *",
      [userId]
    );

    // After the update, send a notification
    const notification = new Notification("user-update", `User ${userId} has been updated`, userId);
    Notification.send(notification);

    res.status(200).json({ message: "User updated", notification });
  } catch (error) {
    res.status(500).json({ message: "Error updating user" });
  }
};

