
import pkg from "pg";

import { connectionConfig } from "../../../dbConfig.js";

import jwt from "jsonwebtoken";

import * as dotenv from "dotenv";




dotenv.config();

const { Pool } = pkg;

const pool = new Pool(connectionConfig);




export const CreateEquipe = async (req, res) => {

  const { idManager, idLigneManager, idPlateau, Partie, employees } = req.body;

  const tokenWithBearer = req.headers.authorization;

  const token = tokenWithBearer.replace("Bearer ", "");




  // Validate required fields

  if (!idManager || !idLigneManager || !idPlateau || !Partie || !employees) {

    return res.status(400).json({ error: "All fields (idManager, idLigneManager, idPlateau, Partie, employees) are required" });

  }




  // Validate types

  if (

    typeof idManager !== 'number' ||

    typeof idLigneManager !== 'number' ||

    typeof idPlateau !== 'number' ||

    typeof Partie !== 'number' ||

    !Array.isArray(employees) || !employees.every(emp => typeof emp === 'number')

  ) {

    return res.status(400).json({ error: "Invalid input types. Ensure idManager, idLigneManager, idPlateau, Partie are numbers and employees is an array of numbers" });

  }




  try {

    // Verify and decode the token

    const decoded = jwt.verify(token, process.env.JWT_SECRET);




    // Check if the token has expired

    if (Date.now() >= decoded.exp * 1000) {

      return res.status(401).json({ error: "Token expired" });

    }




    // Insert into the database

    const result = await pool.query(

      "INSERT INTO equipe (id_manager, id_ligne_manager, id_plateau, partie, employees) VALUES ($1, $2, $3, $4, $5) RETURNING id",

      [idManager, idLigneManager, idPlateau, Partie, employees]

    );




    const newInstanceId = result.rows[0].id; // Access the ID from the database response




    console.log("Insertion successful. New instance ID:", newInstanceId);

    res.status(201).json({ newInstanceId });

  } catch (error) {

    if (error instanceof jwt.TokenExpiredError) {

      console.error("Token expired error:", error);

      return res.status(401).json({ error: "Token expired" });

    } else {

      console.error("Error occurred during insertion:", error);

      return res.status(500).json({ error: "Internal server error" });

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




export const getEmployeesByManagerId = async (req, result) => {

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




    // Query to get employees lists for the specific id_manager

    const query = "SELECT employees FROM equipe WHERE id_manager = $1";

    const res = await pool.query(query, [id_manager]);




    // Combine all employee arrays into a single array

    const allEmployees = res.rows.flatMap(row => row.employees);




    if (allEmployees.length === 0) {

      return result.status(404).json({ message: "No employees found for this manager" });

    }




    console.log("Employees found for manager:", allEmployees);

    result.json(allEmployees);

  } catch (error) {

    if (error instanceof jwt.TokenExpiredError) {

      console.error("Token expired error:", error);

      return result.status(401).json({ error: "Token expired" });

    } else if (error instanceof jwt.JsonWebTokenError) {

      console.error("JWT error:", error);

      return result.status(401).json({ error: "Invalid token" });

    } else {

      console.error("Error occurred while fetching employees by manager ID:", error);

      result.status(500).json({ error: "Internal server error" });

    }

  }

};




export const GetEmployeeDetailsByEquipeId = async (req, res) => {

  const { equipeId } = req.body;




  // Validate required fields

  if (!equipeId) {

    return res.status(400).json({ error: "Equipe ID is required" });

  }




  // Validate type

  if (isNaN(Number(equipeId))) {

    return res.status(400).json({ error: "Invalid equipe ID" });

  }




  try {

    // Query to get the list of employee IDs from the equipe table

    const equipeResult = await pool.query(

      'SELECT employees FROM equipe WHERE id = $1',

      [equipeId]

    );




    // Check if equipe ID exists

    if (equipeResult.rows.length === 0) {

      return res.status(404).json({ error: "Equipe not found" });

    }




    // Extract employee IDs from the result

    const employeeIds = equipeResult.rows[0].employees;




    // If there are no employees in the equipe

    if (!employeeIds || employeeIds.length === 0) {

      return res.status(404).json({ error: "No employees found for this equipe ID" });

    }




    // Query to get details of the employees from the users table

    const usersResult = await pool.query(

      'SELECT id, username FROM users WHERE id = ANY($1)',

      [employeeIds]

    );




    // Respond with the employee details

    res.status(200).json(usersResult.rows);

  } catch (error) {

    console.error("Error occurred while fetching employee details:", error);

    res.status(500).json({ error: "Internal server error" });

  }

};




