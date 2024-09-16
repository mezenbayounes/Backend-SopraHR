import pkg from "pg";
import { connectionConfig } from "../../../dbConfig.js";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { broadcastNotification } from "../../../index.js"; // Adjust the path as necessary

import { createNotification } from "../Notification/NotificationController.js"; // Adjust the path as necessary

const { Pool } = pkg;
const pool = new Pool(connectionConfig);

export const CreateConge = async (req, result) => {
  const { userId, cause, dateDebut, scDebut, dateFin, scFin, typeConge } =
    req.body;
  const tokenWithBearer = req.headers.authorization;
  const token = tokenWithBearer.replace("Bearer ", "");

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the token has expired
    if (Date.now() >= decoded.exp * 1000) {
      return result.status(401).json({ error: "Token expired" });
    }

    // Token is valid and not expired, continue with the database operation
    const res = await pool.query(
      "INSERT INTO conge (user_id, cause, date_debut, sc_debut, date_fin, sc_fin, type_conge) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
      [userId, cause, dateDebut, scDebut, dateFin, scFin, typeConge]
    );

    const newCongeId = res.rows[0].id; // Access the ID from the database response

    console.log(
      "Insertion successful. New congé ID:",
      newCongeId,
      "employee ID:",
      userId
    );
    result.send({ newCongeId });
    return 0;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("Token expired error:", error);
      return result.status(401).json({ error: "Token expired" });
    } else {
      console.error("Error occurred during insertion:", error);
      throw error; // Rethrow the error to handle it further if needed
    }
  }
};

export const updateConge = async (req, result) => {
  const { congeId, cause, dateDebut, scDebut, dateFin, scFin, typeConge } =
    req.body;
  const tokenWithBearer = req.headers.authorization;
  const token = tokenWithBearer.replace("Bearer ", "");

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the token has expired
    if (Date.now() >= decoded.exp * 1000) {
      return result.status(401).json({ error: "Token expired" });
    }

    // Token is valid and not expired, continue with the database operation
    const updateQuery = `
      UPDATE conge
      SET cause = $1, date_debut = $2, sc_debut = $3, date_fin = $4, sc_fin = $5, type_conge = $6, etat = 'EC'
      WHERE id = $7
      RETURNING id
    `;

    const res = await pool.query(updateQuery, [
      cause,
      dateDebut,
      scDebut,
      dateFin,
      scFin,
      typeConge,
      congeId,
    ]);

    const updatedCongeId = res.rows[0]; // Access the ID from the database response

    console.log("Update successful. Updated congé ID:", updatedCongeId);
    result.send({ updatedCongeId });
    return 0;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("Token expired error:", error);
      return result.status(401).json({ error: "Token expired" });
    } else {
      console.error("Error occurred during update:", error);
      throw error; // Rethrow the error to handle it further if needed
    }
  }
};

export const getConge = async (req, result) => {
  const { congeId } = req.body;
  const tokenWithBearer = req.headers.authorization;
  const token = tokenWithBearer.replace("Bearer ", "");

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the token has expired
    if (Date.now() >= decoded.exp * 1000) {
      return result.status(401).json({ error: "Token expired" });
    }

    // Token is valid and not expired, continue with the database operation
    console.log("Congé ID:", congeId);

    const query = "SELECT * FROM conge WHERE id = $1";
    const res = await pool.query(query, [congeId]);

    if (res.rows.length === 0) {
      console.log("Congé not found.");
      result.status(404).send({ message: "Congé not found." });
      return;
    }

    const congé = res.rows[0];
    console.log("Congé found:", congé);
    result.send(congé);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("Token expired error:", error);
      return result.status(401).json({ error: "Token expired" });
    } else {
      console.error("Error occurred while fetching congé:", error);
      throw error; // Rethrow the error to handle it further if needed
    }
  }
};

export const getAllConges = async (req, result) => {
  const tokenWithBearer = req.headers.authorization;
  const token = tokenWithBearer.replace("Bearer ", "");

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the token has expired
    if (Date.now() >= decoded.exp * 1000) {
      return result.status(401).json({ error: "Token expired" });
    }

    // Token is valid and not expired, continue with the database operation
    const query = "SELECT * FROM conge";
    const res = await pool.query(query);

    const congés = res.rows;
    console.log("Congés found:", congés);
    result.send(congés);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("Token expired error:", error);
      return result.status(401).json({ error: "Token expired" });
    } else {
      console.error("Error occurred while fetching congés:", error);
      throw error; // Rethrow the error to handle it further if needed
    }
  }
};

export const validateConge = async (req, result) => {
  const { congeId, etat } = req.body;
  const tokenWithBearer = req.headers.authorization;
  const token = tokenWithBearer.replace("Bearer ", "");

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the token has expired
    if (Date.now() >= decoded.exp * 1000) {
      return result.status(401).json({ error: "Token expired" });
    }

    // Update the leave request (congé) status
    const updateQuery = `
      UPDATE conge
      SET etat = $1
      WHERE id = $2
      RETURNING id
    `;

    const res = await pool.query(updateQuery, [etat, congeId]);
    const updatedCongeId = congeId; // Access the ID from the database response

    // Notification logic after successful congé validation
    const notificationContent = `Congé with ID ${congeId} has been ${etat}`;
    const notificationType = "conge-validation"; // Custom type for congé validation notifications
    const userId = decoded.userId; // Assuming you have the user ID from the decoded JWT

    // Create notification record in the database
    const notificationData = {
      type: notificationType,
      content: notificationContent,
      user_id: userId
    };
    await createNotification(notificationData);

    // Broadcast notification to all connected WebSocket clients
    const notification = {
      type: notificationType,
      content: notificationContent,
      userId
    };
    broadcastNotification(notification);

    console.log("Congé validation successful. Updated congé ID:", updatedCongeId);
    result.send({ updatedCongeId, notification });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("Token expired error:", error);
      return result.status(401).json({ error: "Token expired" });
    } else {
      console.error("Error occurred during congé validation:", error);
      return result.status(500).json({ error: "Internal Server Error" });
    }
  }
};
export const deleteConge = async (req, result) => {
  const { congeId } = req.body;
  const tokenWithBearer = req.headers.authorization;
  const token = tokenWithBearer.replace("Bearer ", "");

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the token has expired
    if (Date.now() >= decoded.exp * 1000) {
      return result.status(401).json({ error: "Token expired" });
    }

    // Token is valid and not expired, continue with the database operation
    console.log("Congé ID:", congeId);

    const deleteQuery = "DELETE FROM conge WHERE id = $1";

    await pool.query(deleteQuery, [congeId]);

    console.log("Congé deleted successfully.");
    result.send({ message: "Congé deleted successfully." });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("Token expired error:", error);
      return result.status(401).json({ error: "Token expired" });
    } else {
      console.error("Error occurred during congé deletion:", error);
      throw error; // Rethrow the error to handle it further if needed
    }
  }
};

export const getCongesByUserId = async (req, result) => {
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
    const query = "SELECT * FROM conge WHERE user_id = $1  ORDER BY created_at DESC ";
    const res = await pool.query(query, [user_id]);

    const congés = res.rows;
    if (congés.length === 0) {
      return result.status(404).json({ message: "No congés found for this user" });
    }

    console.log("Congés found for user:", congés);
    result.json(congés);
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

export const getCongesByUserIds = async (req, result) => {
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

    // Extract user_ids from request body
    const { user_ids } = req.body;

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return result.status(400).json({ error: "Invalid or missing user IDs" });
    }

    // Build the query string with the correct number of placeholders
    const placeholders = user_ids.map((_, index) => `$${index + 1}`).join(", ");
    const query = `SELECT * FROM conge WHERE user_id IN (${placeholders}) ORDER BY created_at DESC`;

    // Execute the query with the user_ids as parameters
    const res = await pool.query(query, user_ids);

    const congés = res.rows;
    if (congés.length === 0) {
      return result.status(404).json({ message: "No congés found for these users" });
    }

    console.log("Congés found for users:", congés);
    result.json(congés);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("Token expired error:", error);
      return result.status(401).json({ error: "Token expired" });
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error("JWT error:", error);
      return result.status(401).json({ error: "Invalid token" });
    } else {
      console.error("Error occurred while fetching congés by user IDs:", error);
      result.status(500).json({ error: "Internal server error" });
    }
  }
};

export const getCongesByManagerId = async (req, result) => {
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

    // Extract id_manager from request body
    const { id_manager } = req.body;

    if (!id_manager || isNaN(id_manager)) {
      return result.status(400).json({ error: "Invalid or missing manager ID" });
    }

    // Query to get employees list for the specific id_manager
    const employeesQuery = "SELECT employees FROM equipe WHERE id_manager = $1";
    const employeesRes = await pool.query(employeesQuery, [id_manager]);

    // Combine all employee arrays into a single array
    const employees = employeesRes.rows.flatMap(row => row.employees);

    if (employees.length === 0) {
      return result.status(404).json({ message: "No employees found for this manager" });
    }

    // Query to get conge records for the list of employee IDs
    const placeholders = employees.map((_, index) => `$${index + 1}`).join(", ");
    const congesQuery = `SELECT * FROM conge WHERE user_id IN (${placeholders})  ORDER BY created_at DESC`;
    const congesRes = await pool.query(congesQuery, employees);

    const conges = congesRes.rows;
    if (conges.length === 0) {
      return result.status(404).json({ message: "No congés found for these employees" });
    }

    console.log("Congés found for employees:", conges);
    result.json(conges);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("Token expired error:", error);
      return result.status(401).json({ error: "Token expired" });
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error("JWT error:", error);
      return result.status(401).json({ error: "Invalid token" });
    } else {
      console.error("Error occurred while fetching congés by manager ID:", error);
      result.status(500).json({ error: "Internal server error" });
    }
  }
};

