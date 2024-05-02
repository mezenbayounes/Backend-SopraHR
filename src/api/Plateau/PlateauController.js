import pkg from "pg";
import { connectionConfig } from "../../../dbConfig.js";

const { Pool } = pkg;
const pool = new Pool(connectionConfig);

export const CreatePlateau = async (req, result) => {
  const { idManager, numberOfParties } = req.body;
  console.log("Request:", req.body);
  console.log("idManager:", idManager);
  console.log("numberOfParties:", numberOfParties);

  try {
    const res = await pool.query(
      "INSERT INTO plateau (id_manager, nmbr_de_partie) VALUES ($1, $2) RETURNING id",
      [idManager, numberOfParties]
    );

    const newPlateauId = res.rows[0].id; // Access the ID from the database response

    console.log("Insertion successful. New plateau ID:", newPlateauId);
    result.send({ newPlateauId });
    return 0;
  } catch (error) {
    console.error("Error occurred during insertion:", error);
    throw error; // Rethrow the error to handle it further if needed
  }
};

export const UpdatePlateau = async (req, result) => {
  const { plateauId, idManager, numberOfParties } = req.body;

  try {
    await pool.query(
      "UPDATE plateau SET id_manager = $1, nmbr_de_partie = $2 WHERE id = $3",
      [idManager, numberOfParties, plateauId]
    );

    result.sendStatus(200);
    console.log("Update successful.");

    return 0; // Returns the number of affected rows
  } catch (error) {
    console.error("Error occurred during update:", error);
    throw error; // Rethrow the error to handle it further if needed
  }
};
export const GetPlateauById = async (req, result) => {
  const { plateauId } = req.body;
  console.log("Plateau ID:", plateauId);

  try {
    const res = await pool.query("SELECT * FROM plateau WHERE id = $1", [
      plateauId,
    ]);
    const plateau = res.rows[0];

    if (!plateau) {
      result.status(404).send("Plateau not found");
      return;
    }

    console.log("Plateau:", plateau);
    result.send(plateau);
    return 0;
  } catch (error) {
    console.error("Error occurred during retrieval:", error);
    throw error; // Rethrow the error to handle it further if needed
  }
};

export const GetAllPlateaux = async (req, result) => {
  try {
    const res = await pool.query("SELECT * FROM plateau");
    const plateaux = res.rows;

    console.log("All Plateaux:", plateaux);
    result.send(plateaux);
    return 0;
  } catch (error) {
    console.error("Error occurred during retrieval:", error);
    throw error; // Rethrow the error to handle it further if needed
  }
};

export const DeletePlateauById = async (req, result) => {
  const { plateauId } = req.body;
  console.log("Plateau ID:", plateauId);
  try {
    const res = await pool.query("DELETE FROM plateau WHERE id = $1", [
      plateauId,
    ]);
    const rowCount = res.rowCount;

    if (rowCount === 0) {
      result.status(404).send("Plateau not found");
      return;
    }

    console.log("Plateau deleted. Rows affected:", rowCount);
    result.sendStatus(200);
    return 0;
  } catch (error) {
    console.error("Error occurred during deletion:", error);
    throw error; // Rethrow the error to handle it further if needed
  }
};
