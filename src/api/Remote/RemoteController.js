import pkg from "pg";
import { connectionConfig } from "../../../dbConfig.js";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

const { Pool } = pkg;
const pool = new Pool(connectionConfig);



export const CreateRemote = async (req, result) => {
    const { userId, dateRemote, etat } = req.body;
    const tokenWithBearer = req.headers.authorization;
    const token = tokenWithBearer ? tokenWithBearer.replace("Bearer ", "") : null;
  
    if (!token) {
      return result.status(401).json({ error: "No token provided" });
    }
  
    try {
      // Verify and decode the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Check if the token has expired
      if (Date.now() >= decoded.exp * 1000) {
        return result.status(401).json({ error: "Token expired" });
      }
  
      // Token is valid and not expired, continue with the database operation
      const res = await pool.query(
        `INSERT INTO remote (user_id, date_remote) VALUES ($1, $2) RETURNING id`,
        [userId, dateRemote] // Use default value 'EC' for etat if not provided
      );
  
      const newRemoteId = res.rows[0].id; // Get the new remote ID from the database
  
      console.log("Insertion successful. New remote ID:", newRemoteId, "User ID:", userId);
      result.send({ newRemoteId });
      return 0;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.error("Token expired error:", error);
        return result.status(401).json({ error: "Token expired" });
      } else {
        console.error("Error occurred during insertion:", error);
        return result.status(500).json({ error: "Database insertion error" });
      }
    }
  };

  export const validateRemote = async (req, result) => {
    const { remoteId, etat } = req.body;
    const tokenWithBearer = req.headers.authorization;
    const token = tokenWithBearer ? tokenWithBearer.replace("Bearer ", "") : null;
  
    if (!token) {
      return result.status(401).json({ error: "No token provided" });
    }
  
    try {
      // Verify and decode the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Check if the token has expired
      if (Date.now() >= decoded.exp * 1000) {
        return result.status(401).json({ error: "Token expired" });
      }
  
      // Token is valid and not expired, proceed with database operation
      console.log("Remote ID:", remoteId);
      console.log("New etat:", etat);
  
      const updateQuery = `
        UPDATE remote
        SET etat = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id
      `;
  
      const res = await pool.query(updateQuery, [etat, remoteId]);
  
      if (res.rows.length === 0) {
        return result.status(404).json({ error: "Remote record not found" });
      }
  
      const updatedRemoteId = res.rows[0].id; // Get the updated record's ID
      console.log("Remote validation successful. Updated remote ID:", updatedRemoteId);
  
      result.send({ updatedRemoteId });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.error("Token expired error:", error);
        return result.status(401).json({ error: "Token expired" });
      } else {
        console.error("Error occurred during remote validation:", error);
        return result.status(500).json({ error: "Database update error" });
      }
    }
  };
  
  export const getRemotesByUserId = async (req, result) => {
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
  
      // Query to get remote records for the specific user_id
      const query = "SELECT * FROM remote WHERE user_id = $1";
      const res = await pool.query(query, [user_id]);
  
      const remotes = res.rows;
      if (remotes.length === 0) {
        return result.status(404).json({ message: "No remote work records found for this user" });
      }
  
      console.log("Remote work records found for user:", remotes);
      result.json(remotes);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.error("Token expired error:", error);
        return result.status(401).json({ error: "Token expired" });
      } else if (error instanceof jwt.JsonWebTokenError) {
        console.error("JWT error:", error);
        return result.status(401).json({ error: "Invalid token" });
      } else {
        console.error("Error occurred while fetching remote records by user ID:", error);
        result.status(500).json({ error: "Internal server error" });
      }
    }
  };

  export const getRemotesByManagerId = async (req, result) => {
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

        // Log the request body and id_manager for debugging
        console.log("Request body:", req.body);
        console.log("Extracted id_manager:", id_manager);

        // Check if id_manager is valid
        if (id_manager === undefined || id_manager === null || isNaN(Number(id_manager))) {
            return result.status(400).json({ error: "Invalid or missing manager ID" });
        }

        // Convert id_manager to an integer
        const managerId = parseInt(id_manager, 10);

        // Log the converted managerId for debugging
        console.log("Converted managerId:", managerId);

        // Query to get employees list for the specific id_manager
        const employeesQuery = "SELECT employees FROM equipe WHERE id_manager = $1";
        const employeesRes = await pool.query(employeesQuery, [managerId]);

        // Combine all employee arrays into a single array
        const employees = employeesRes.rows.flatMap(row => row.employees);

        if (employees.length === 0) {
            return result.status(404).json({ message: "No employees found for this manager" });
        }

        // Query to get remote records for the list of employee IDs
        const placeholders = employees.map((_, index) => `$${index + 1}`).join(", ");
        const remoteQuery = `SELECT * FROM remote WHERE user_id IN (${placeholders})`;
        const remoteRes = await pool.query(remoteQuery, employees);

        const remotes = remoteRes.rows;
        if (remotes.length === 0) {
            return result.status(404).json({ message: "No remote work records found for these employees" });
        }

        console.log("Remote work records found for employees:", remotes);
        result.json(remotes);
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            console.error("Token expired error:", error);
            return result.status(401).json({ error: "Token expired" });
        } else if (error instanceof jwt.JsonWebTokenError) {
            console.error("JWT error:", error);
            return result.status(401).json({ error: "Invalid token" });
        } else {
            console.error("Error occurred while fetching remote work records by manager ID:", error);
            result.status(500).json({ error: "Internal server error" });
        }
    }
};
