import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail } from '../api/UserController.js';


// Signup function
export const signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = await createUser(username, email, password);
        res.status(201).send({ userId: user.id });
    } catch (error) {
        res.status(500).send({ error: "Error creating user" });
    }
};

// Login function
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.send({ token });
    } catch (error) {
        res.status(500).send({ error: "Error logging in" });
    }
};
