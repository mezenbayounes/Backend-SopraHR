import pkg from 'pg';
import bcrypt from 'bcryptjs';
import { connectionConfig } from '../../dbConfig.js'; 

const { Pool } = pkg;
const pool = new Pool(connectionConfig);

export const createUser = async (username, email, password,role) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const res = await pool.query('INSERT INTO users (username, email, password,role) VALUES ($1, $2, $3,$4) RETURNING id', [username, email, hashedPassword,role]);
    return res.rows[0];
};

export const findUserByEmail = async (email) => {
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
};

export const getUser = async (req, res) => {
    try {
        console.log(req.body);  
        const { email} = req.body;
        console.log({ email}); 

        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        res.send({ user });
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "Error logging in" });
    }
};

