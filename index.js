
import { config } from 'dotenv';
import { createUsersTableQuery } from './src/models/UserModel.js'; 
import { initDb } from  '../BackEnd/dbConfig.js'; 

import { connectionConfig } from '../BackEnd/dbConfig.js'; 


import pkg from 'pg';
const { Pool } = pkg;

config(); // This loads the environment variables from the .env file



// Initialize pool using connectionConfig
const pool = new Pool(connectionConfig);
initDb();
