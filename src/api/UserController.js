import pkg from 'pg';
import bcrypt from 'bcryptjs';
import { connectionConfig } from './dbConfig.js'; 

const { Pool } = pkg;
const pool = new Pool(connectionConfig);

export const createUser = async (username, email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const res = await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id', [username, email, hashedPassword]);
    return res.rows[0];
};

export const findUserByEmail = async (email) => {
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
};

