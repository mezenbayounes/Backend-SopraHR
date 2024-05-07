import pkg from "pg";
import { connectionConfig } from "../../../dbConfig.js";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

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

    // Token is valid and not expired, continue with the database operation
    console.log("Congé ID:", congeId);
    console.log("New etat:", etat);

    const updateQuery = `
      UPDATE conge
      SET etat = $1
      WHERE id = $2
      RETURNING id
    `;

    const res = await pool.query(updateQuery, [etat, congeId]);

    const updatedCongeId = res.rows[0].id; // Access the ID from the database response

    console.log(
      "Congé validation successful. Updated congé ID:",
      updatedCongeId
    );
    result.send({ updatedCongeId });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("Token expired error:", error);
      return result.status(401).json({ error: "Token expired" });
    } else {
      console.error("Error occurred during congé validation:", error);
      throw error; // Rethrow the error to handle it further if needed
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
