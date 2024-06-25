import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserDetails,
} from "../User/UserController.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { connectionConfig } from "../../../dbConfig.js";
const { Pool } = pkg;
import pkg from "pg";

config();
import * as dotenv from "dotenv";
import { log } from "console";
dotenv.config();
const pool = new Pool(connectionConfig);

// Signup function
export const signup = async (req, res) => {
  try {
    console.log(req.body);
    const { username, email, password, role } = req.body;
    console.log({ username, email, password, role });

    // Validate the role, if necessary
    if (!["ligne_manager", "admin", "manager", "employee"].includes(role)) {
      return res.status(400).send({ error: "Invalid role specified" });
    }

    const existingUser = await findUserByEmail(email); // You'll need to implement this function
    if (existingUser) {
      return res.status(409).send({ error: "User already exists" }); // 409 Conflict might be a suitable status code
    }
    console.log("req file:", req.file);
    const imageUrl = req.file ? req.file.path : null;

    const user = await createUser(username, email, password, role, imageUrl);
    console.log(req.body.email);

    SendOTP({ body: { email: req.body.email } });
    console.log(req.body.email);

    res.status(201).send({ userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error creating user" });
  }
};

// Login function
export const login = async (req, res) => {
  const client = await pool.connect();
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

    const is_verified = await pool.query(
      "SELECT verified FROM users   WHERE email = $1",
      [email]
    );

    if (!is_verified.rows[0].verified) {
      return res.status(403).send({ error: "Please verifie Your account" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "5h",
    });
    const userID= user.id;
    res.send({ token,userID });
    console.log("jawna behy");
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Error logging in" });
  }
};

async function saveOtpForUser(otp, userId, expiresAt) {
  try {
    const result = await pool.query(
      "UPDATE users SET otp = $1, otp_expires_at = $2 WHERE id = $3",
      [otp, expiresAt, userId]
    );
  } catch (error) {
    console.error("Error saving OTP:", error);
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
    const expiresAtInSeconds = Math.floor(
      (new Date().getTime() + 15 * 60000) / 1000
    );
    const expiresAt = new Date(expiresAtInSeconds * 1000);

    // Save the OTP and its expiry in the database
    await saveOtpForUser(otp, user.id, expiresAt);

    // Send email (this is a simplified example, customize as needed)
    const transporter = nodemailer.createTransport({
      // Transport config (e.g., for Gmail, Outlook, etc.)
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: "mezen.bayounes@esprit.tn",
      to: user.email,
      subject: "Code OTP",
      html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .content {
            padding: 20px 0;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>OTP Request</h2>
        </div>
        <div class="content">
            <p>Hi,</p>
            <p>You recently requested to reset your password for your account. Use the OTP below to proceed with resetting your password. This code is only valid for 15 minutes.</p>
            <p style="text-align: center; margin: 20px 0; font-size: 24px; letter-spacing: 3px;"><strong>${otp}</strong></p>
            <p>If you did not request a password reset, please ignore this email or contact support if you have any concerns.</p>
        </div>
        <div class="footer">
            <p>Best Regards,<br>Sopra HR</p>
        </div>
    </div>
</body>
</html>
 `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.send(500).send({ error: "Error sending OTP email" });
      } else {
        console.log("Email sent:", info.response);
        return res.send({ message: "OTP sent to your email" });
      }
    });
  } catch (error) {
    console.error("Error in send email function:", error);
    res.status(500).send({ error: "Error processing send email request" });
  }
};

export async function ChangeForgotPassword(req, res) {
  // Extracting email, inputOtp, and newPassword from the request bodyy
  const { email, inputOtp, newPassword } = req.body;
  console.log(email);
  console.log(inputOtp);
  console.log(newPassword);

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Find the user by email
  const user = await findUserByEmail(email);

  // Check if the user exists
  if (!user) {
    return res.status(404).send({ error: "User not found" });
  }

  // Get a client from the connection pool
  const client = await pool.connect();

  try {
    // Retrieve the user's OTP and its expiration time
    const otpResult = await client.query(
      `
            SELECT otp, otp_expires_at FROM users WHERE email = $1
        `,
      [email]
    );

    // Check if there's a user and if the OTP matches
    if (otpResult.rows.length === 0 || otpResult.rows[0].otp != inputOtp) {
      return res.status(404).send("OTP does not match or user not found.");
    }

    // Check if the OTP has expired
    const otpExpiresAt = new Date(otpResult.rows[0].otp_expires_at);
    if (new Date() > otpExpiresAt) {
      return res.status(403).send("OTP has expired.");
    }

    // Update the user's password
    const updateResult = await client.query(
      `
            UPDATE users 
            SET password = $1, otp = NULL, otp_expires_at = NULL 
            WHERE email = $2 AND otp = $3
            RETURNING *
        `,
      [hashedPassword, email, inputOtp]
    );

    // Check if the password was successfully updated
    if (updateResult.rows.length === 0) {
      res.status(500).send("Failed to update password.");
    } else {
      res.status(200).send("Password updated successfully.");
    }
  } catch (error) {
    // Log the error and send a 500 Internal Server Error response
    console.error("Failed to update password:", error.message);
    res.status(500).send("Failed to update password.");
  } finally {
    // Release the client back to the pool
    client.release();
  }
}

export async function is_verified(req, res) {
  // Extracting email and inputOtp from the request body
  const { email, inputOtp } = req.body;
  console.log(req.body.inputOtp);

  const inputOtpp = req.body.inputOtp;

  // Find the user by email
  const user = await findUserByEmail(email);

  // Check if the user exists
  if (!user) {
    return res.status(404).send({ error: "User not found" });
  }

  // Get a client from the connection pool
  const client = await pool.connect();
  console.log(email);
  console.log(inputOtpp);
  console.log("input:inputOtp");

  try {
    // Retrieve the user's OTP and its expiration time
    const otpResult = await client.query(
      `
            SELECT otp, otp_expires_at FROM users WHERE email = $1
        `,
      [email]
    );

    console.log(otpResult);

    // Check if there's a user and if the OTP matches
    if (otpResult.rows.length === 0 || otpResult.rows[0].otp != inputOtpp) {
      return res.status(404).send("OTP does not match or user not found.");
    }

    // Check if the OTP has expired
    const otpExpiresAt = new Date(otpResult.rows[0].otp_expires_at);
    if (new Date() > otpExpiresAt) {
      return res.status(403).send("OTP has expired.");
    }

    // Verify the user's account
    const updateResult = await client.query(
      `
            UPDATE users 
            SET verified = true, otp = NULL, otp_expires_at = NULL 
            WHERE email = $1 AND otp = $2
            RETURNING *
        `,
      [email, inputOtpp]
    );

    // Check if the account was successfully verified
    if (updateResult.rows.length === 0) {
      res.status(500).send("Failed to verify the account.");
    } else {
      res.status(200).send("Account verified successfully.");
    }
  } catch (error) {
    // Log the error and send a 500 Internal Server Error response
    console.error("Failed to verify the account:", error.message);
    res.status(500).send("Failed to verify the account.");
  } finally {
    // Release the client back to the pool
    client.release();
  }
}
///update prob in image_url
export const updateUser = async (req, res) => {
  const { id, username, email, password, role } = req.body;
  const imageUrl = req.file ? req.file.path : null; // Adjust according to your file handling logic
  console.log(req.file);
  console.log(id);

  try {
    const user = await findUserById(id);
    if (!user) return res.status(404).send({ error: "User not found" });

    if (!["ligne_manager", "admin", "manager", "employee"].includes(role))
      return res.status(400).send({ error: "Invalid role specified" });

    if (email && email !== user.email) {
      const existingUser = await findUserByEmail(email);
      if (existingUser)
        return res.status(409).send({ error: "Email already in use" });
    }

    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : user.password;
    await updateUserDetails(
      id,
      username,
      email,
      role,
      hashedPassword,
      imageUrl
    );

    res.status(200).send({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send({ error: "Error updating user" });
  }
};
export const GetAllUser = async (req, res) => {
  const tokenWithBearer = req.headers.authorization;
  const token = tokenWithBearer.replace("Bearer ", "");

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the token has expired
    if (Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({ error: "Token expired" });
    }

    const query = "SELECT * FROM users";
    const result = await pool.query(query);
    const users = result.rows;

    console.log("Retrieval successful. users:", users);
    res.send({ users });

    return users;
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


export const GetAllLineManagers = async (req, res) => {
  const tokenWithBearer = req.headers.authorization;
  const token = tokenWithBearer.replace("Bearer ", "");

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the token has expired
    if (Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({ error: "Token expired" });
    }

    const query = "SELECT id, username FROM users WHERE role = 'ligne_manager'";
    const result = await pool.query(query);
    const lineManagers = result.rows;

    console.log("Retrieval successful. Line managers:", lineManagers);
    res.send({ lineManagers });

    return lineManagers;
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

export const GetAllManagers = async (req, res) => {
  const tokenWithBearer = req.headers.authorization;
  const token = tokenWithBearer.replace("Bearer ", "");

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the token has expired
    if (Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({ error: "Token expired" });
    }

    const query = "SELECT id, username FROM users WHERE role = 'manager'";
    const result = await pool.query(query);
    const Managers = result.rows;

    console.log("Retrieval successful. Line managers:", Managers);
    res.send({ Managers });

    return Managers;
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
export const GetAllEmployees = async (req, res) => {
  const tokenWithBearer = req.headers.authorization;
  const token = tokenWithBearer.replace("Bearer ", "");

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the token has expired
    if (Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({ error: "Token expired" });
    }

    const query = "SELECT * FROM users WHERE role = 'employee'";
    const result = await pool.query(query);
    const employees = result.rows;

    console.log("Retrieval successful. Line managers:", employees);
    res.send({ employees });

    return employees;
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