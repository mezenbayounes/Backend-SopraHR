import pkg from "pg";
import bcrypt from "bcryptjs";
import { connectionConfig } from "../../../dbConfig.js";

const { Pool } = pkg;
const pool = new Pool(connectionConfig);
//S
export const createUser = async (username, email, password, role, imageUrl) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const res = await pool.query(
    "INSERT INTO users (username, email, password,role,image_url) VALUES ($1, $2, $3,$4,$5) RETURNING id",
    [username, email, hashedPassword, role, imageUrl]
  );
  return res.rows[0];
};

export const findUserByEmail = async (email) => {
  const res = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return res.rows[0];
};

export const getUser = async (req, res) => {
  try {
    console.log(req.body);
    const { email } = req.body;
    console.log({ email });

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    res.send({ user });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Error " });
  }
};

export const findUserById = async (req, res) => {
  try {
    const { id } = req.body; // Assume the ID is coming from the request parameters
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).send({ error: "User not found" });
    }

    res.send({ user: result.rows[0] });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

export const updateUserr = async (req, res) => {
  try {
    if (!req.body) {
      console.error(
        "req.body is undefined. Check if express.json() middleware is configured correctly."
      );
      return res.status(400).send({ error: "Invalid request body" });
    }

    const { id, username, email, password, role } = req.body;

    const user = await findUserById(id);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    if (!["ligne_manager", "admin", "manager", "employee"].includes(role)) {
      return res.status(400).send({ error: "Invalid role specified" });
    }

    if (email && email !== user.email) {
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        return res.status(409).send({ error: "Email already in use" });
      }
    }

    let hashedPassword = user.password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const image_url = req.file ? req.file.path : user.image_url; // Use existing image_url if file not provided
    const query = `
            UPDATE users
            SET username = $1, email = $2, role = $3, password = $4, image_url = $5
            WHERE id = $6
            RETURNING *;
        `;
    const updateResult = await pool.query(query, [
      username,
      email,
      role,
      hashedPassword,
      image_url,
      id,
    ]);
    console.log("Update Result:", updateResult);

    res.status(200).send({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send({ error: "Error updating user" });
  }
};
export async function updateUserDetails(
  id,
  username,
  email,
  role,
  hashedPassword,
  imageUrl
) {
  const query = `
        UPDATE users
        SET username = $1, email = $2, role = $3, password = $4, image_url = $5
        WHERE id = $6
        RETURNING *;`;
  const values = [username, email, role, hashedPassword, imageUrl, id];
  const { rows } = await pool.query(query, values);
  return rows[0];
}
