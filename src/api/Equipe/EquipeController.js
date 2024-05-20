import pkg from "pg";
import { connectionConfig } from "../../../dbConfig.js";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;
const pool = new Pool(connectionConfig);

export const CreateEquipe = async (req, result) => {
  const { idManager, idLigneManager, idPlateau, Partie, employees } = req.body;
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
      "INSERT INTO equipe (id_manager, id_ligne_manager, id_plateau, partie, employees) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [idManager, idLigneManager, idPlateau, Partie, employees]
    );

    const newInstanceId = res.rows[0].id; // Access the ID from the database response

    console.log("Insertion successful. New instance ID:", newInstanceId);
    result.send({ newInstanceId });
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

export const GetEquipeById = async (req, result) => {
  const { id } = req.body;
  const tokenWithBearer = req.headers.authorization;
  const token = tokenWithBearer.replace("Bearer ", "");

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the token has expired
    if (Date.now() >= decoded.exp * 1000) {
      return result.status(401).json({ error: "Token expired" });
    }

    console.log(id);
    const res = await pool.query("SELECT * FROM equipe WHERE id = $1", [id]);

    const equipe = res.rows[0]; // Access the retrieved equipe instance
    if (!equipe) {
      result.status(404).send("equipe not found");
      return;
    }

    console.log("Retrieval successful. Equipe:", equipe);
    result.send({ equipe });
    return 0;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("Token expired error:", error);
      return result.status(401).json({ error: "Token expired" });
    } else {
      console.error("Error occurred during retrieval:", error);
      throw error; // Rethrow the error to handle it further if needed
    }
  }
};

export const UpdateEquipeById = async (req, result) => {
  const { equipeId, idManager, idLigneManager, idPlateau, Partie, employees } =
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

    const res = await pool.query(
      "UPDATE equipe SET id_manager = $1, id_ligne_manager = $2, id_plateau = $3, partie = $4, employees = $5 WHERE id = $6",
      [idManager, idLigneManager, idPlateau, Partie, employees, equipeId]
    );
    result.sendStatus(200);
    console.log("Update successful.");

    return 0; // Returns the number of affected rows
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

export const GetAllEquipe = async (req, res) => {
  const tokenWithBearer = req.headers.authorization;
  const token = tokenWithBearer.replace("Bearer ", "");

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the token has expired
    if (Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({ error: "Token expired" });
    }

    const query = "SELECT * FROM equipe";
    const result = await pool.query(query);
    const equipes = result.rows;

    console.log("Retrieval successful. Equipes:", equipes);
    res.send({ equipes });

    return equipes;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("Token expired error:", error);
      return res.status(401).json({ error: "Token expired" });
    } else {
      console.error("Error occurred during retrieval:", error);
      throw error; // Rethrow the error to handle it further if needed
    }
  }
};

export const DeleteEquipeById = async (req, result) => {
  const { equipeId } = req.body;
  const tokenWithBearer = req.headers.authorization;
  const token = tokenWithBearer.replace("Bearer ", "");

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the token has expired
    if (Date.now() >= decoded.exp * 1000) {
      return result.status(401).json({ error: "Token expired" });
    }

    const query = "DELETE FROM equipe WHERE id = $1";
    const res = await pool.query(query, [equipeId]);

    const rowCount = res.rowCount;

    if (rowCount === 0) {
      result.status(404).send("equipe not found");
      return;
    }

    console.log("equipe deleted. Rows affected:", rowCount);
    result.sendStatus(200);
    return 0;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("Token expired error:", error);
      return result.status(401).json({ error: "Token expired" });
    } else {
      console.error("Error occurred during deletion:", error);
      throw error; // Rethrow the error to handle it further if needed
    }
  }
};

export const DeleteEquipeByIds = async (req, result) => {
  const { equipeIds } = req.body; // Assuming equipeIds is an array of IDs
  const tokenWithBearer = req.headers.authorization;
  const token = tokenWithBearer.replace("Bearer ", "");

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the token has expired
    if (Date.now() >= decoded.exp * 1000) {
      return result.status(401).json({ error: "Token expired" });
    }

    const deletePromises = equipeIds.map(async (equipeId) => {
      const query = "DELETE FROM equipe WHERE id = $1";
      const res = await pool.query(query, [equipeId]);
      return res.rowCount;
    });

    const deleteResults = await Promise.all(deletePromises);
    const totalRowCount = deleteResults.reduce((acc, rowCount) => acc + rowCount, 0);

    if (totalRowCount === 0) {
      result.status(404).send("equipe not found");
      return;
    }

    console.log("equipe deleted. Total rows affected:", totalRowCount);
    result.sendStatus(200);
    return 0;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("Token expired error:", error);
      return result.status(401).json({ error: "Token expired" });
    } else {
      console.error("Error occurred during deletion:", error);
      throw error; // Rethrow the error to handle it further if needed
    }
  }
};

