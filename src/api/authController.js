import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { createUser, findUserByEmail } from '../api/UserController.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { connectionConfig } from '../../dbConfig.js'; 
const { Pool } = pkg;
import pkg from 'pg';


config();
import * as dotenv from 'dotenv';
dotenv.config();
const pool = new Pool(connectionConfig);

// Signup function
export const signup = async (req, res) => {
    try {
        console.log(req.body);  
        const { username, email, password } = req.body;
        console.log({ username, email, password }); 
       
        const existingUser = await findUserByEmail(email); // You'll need to implement this function
        if (existingUser) {
            return res.status(409).send({ error: "User already exists" }); // 409 Conflict might be a suitable status code
        }
        const user = await createUser(username, email, password);
        
        res.status(201).send({ userId: user.id });
       
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Error creating user" });
    }
};


// Login function
export const login = async (req, res) => {
    try {
        console.log(req.body);  
        const { email, password } = req.body;
        console.log({ email, password }); 

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
        console.log(error)
        res.status(500).send({ error: "Error logging in" });
    }
};

async function saveOtpForUser(otp,  userId) {
    
    try {
        const result = await pool.query('UPDATE users SET otp = $1  WHERE id = $2', [otp, userId]);
    } catch (error) {
        console.error('Error saving OTP:', error);
        throw error; 
    }
}


export const SendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        // Generate a 6-digit OTP
        const otp = crypto.randomInt(100000, 999999);

        // OTP expiration time (e.g., 15 minutes)
        const expireTime = Date.now() + 15 * 60 * 1000; // 15 minutes from now

        // Save the OTP and its expiry in the database
        await saveOtpForUser( otp,user.id);

        // Send email (this is a simplified example, customize as needed)
        const transporter = nodemailer.createTransport({
            // Transport config (e.g., for Gmail, Outlook, etc.)
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: 'mezen.bayounes@esprit.tn',
            to: user.email,
            subject: 'Password Reset OTP',
            text: `Your password reset code is: ${otp}\nThis code will expire in 15 minutes.`,
            // You can also use HTML for the email content
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).send({ error: 'Error sending OTP email' });
            } else {
                console.log('Email sent:', info.response);
                return res.send({ message: 'OTP sent to your email' });
            }
        });
    } catch (error) {
        console.error('Error in forgotPassword function:', error);
        res.status(500).send({ error: "Error processing forgot password request" });
    }
};

export async function ChangeForgotPassword(req, res) {
    // Extracting userId, inputOtp, and newPassword from the request body
    const { email, inputOtp, newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await findUserByEmail(email);
    if (!user) {
        return res.status(404).send({ error: "User not found" });
    }
    const client = await pool.connect();

    try {
        // Check OTP and update password in a single step
        const result = await pool.query(`
            UPDATE users 
            SET password = $1 
            WHERE email = $2 AND otp = $3
            RETURNING *
        `, [hashedPassword, email, inputOtp]);

        if (result.rows.length === 0) {
            // If no rows are returned, it means no user was found or the OTP didn't match
            res.status(404).send(' OTP does not match.');
        } else {
            // If the password was successfully updated
            res.status(200).send('Password updated successfully.');
        }
    } catch (error) {
        // Log the error and send a 500 Internal Server Error response
        console.error('Failed to update password:', error.message);
        res.status(500).send('Failed to update password.');
    } finally {
        // Release the client back to the pool
        client.release();
    }
}
