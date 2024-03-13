
import pg from 'pg';
import { config } from 'dotenv';
import { createUsersTableQuery } from '../BackEnd/src/models/User.js'; // Adjust the path as necessary

const { Pool } = pg;
config(); // This loads the environment variables from the .env file




import * as dotenv from 'dotenv';
dotenv.config();

export const connectionConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};


const pool = new Pool(connectionConfig);
async function initDb() {
  try {
    await pool.query(createUsersTableQuery);
    console.log('Users table created or verified successfully.');
  } catch (err) {
    console.error('Error during database initialization:', err.stack);
    process.exit(1); // Exit with error
  } finally {
    await pool.end(); // Close the database connection
  }
}

initDb();