
import { config } from 'dotenv';
import { initDb } from  '../BackEnd/dbConfig.js'; 
import { connectionConfig } from '../BackEnd/dbConfig.js'; 
import pkg from 'pg';
import express from 'express';
import authRouter from './src/Router/authRouter.js';
import * as dotenv from 'dotenv';



const { Pool } = pkg;
dotenv.config();
config(); 
const pool = new Pool(connectionConfig);
initDb();

//////////////////////////////////////////////////
const app = express();
app.use(express.json());

app.use('/auth', authRouter);







const PORT = 3000 ;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});