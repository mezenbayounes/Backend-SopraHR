import pg from "pg";
import { config } from "dotenv";
import { createUsersTableQuery } from "../BackEnd/src/models/UserModel.js"; // Adjust the path as necessary
import { createEnumQuery } from "../BackEnd/src/models/UserModel.js"; // Adjust the path as necessary
import { createEquipeTableQuery } from "../BackEnd/src/models/EquipeModel.js"; // Adjust the path as necessary
import { createPlateauTableQuery } from "../BackEnd/src/models/PlateauModel.js"; // Adjust the path as necessary
import { createCongeTableQuery } from "../BackEnd/src/models/CongeModel.js"; // Adjust the path as necessary

const { Pool } = pg;
config();

import * as dotenv from "dotenv";
dotenv.config();

export const connectionConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};

const pool = new Pool(connectionConfig);
export async function initDb() {
  try {
    await pool.query(createEnumQuery);
    await pool.query(createUsersTableQuery);
    await pool.query(createPlateauTableQuery);
    await pool.query(createEquipeTableQuery);
    await pool.query(createCongeTableQuery);

    console.log("role ENUM created or verified successfully.");
    console.log("Users table created or verified successfully.");
    console.log("Equipe table created or verified successfully.");
    console.log("Plateau table created or verified successfully.");
    console.log("Congé table created or verified successfully.");
  } catch (err) {
    console.error("Error during database initialization:", err.stack);
    process.exit(1);
  } finally {
    //await pool.end(); // Close the database connection
  }
}
