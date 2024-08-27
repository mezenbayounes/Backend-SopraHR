import pkg from "pg";
import { connectionConfig } from "../../../dbConfig.js";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

const { Pool } = pkg;
const pool = new Pool(connectionConfig);





export const CreateRemote = async (req, result) => {
  const { userId, dateRemote } = req.body;
  const tokenWithBearer = req.headers.authorization;
  const token = tokenWithBearer ? tokenWithBearer.replace("Bearer ", "") : null;

  if (!token) {
    return result.status(401).json({ error: "No token provided" });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the token has expired
    if (Date.now() >= decoded.exp * 1000) {
      return result.status(401).json({ error: "Token expired" });
    }

    // Convert the requested date to a JavaScript Date object
    const newRemoteDate = new Date(dateRemote);
    const dayOfWeek = newRemoteDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday

    // Fetch existing remote days for the user in the current week (Monday - Friday)
    const weekStart = new Date(newRemoteDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Get Monday of the current week
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 4); // Get Friday of the current week

    const existingRemotes = await pool.query(
      `SELECT date_remote FROM remote WHERE user_id = $1 AND date_remote BETWEEN $2 AND $3`,
      [userId, weekStart, weekEnd]
    );

    // Check if the user has already taken two remote days this week
    if (existingRemotes.rows.length >= 2) {
      return result.status(400).json({ error: "You can only take a maximum of two remote days per week." });
    }

    // Check for consecutive remote days
    for (const remote of existingRemotes.rows) {
      const remoteDate = new Date(remote.date_remote);
      const dayDifference = Math.abs((newRemoteDate - remoteDate) / (1000 * 60 * 60 * 24));

      // Ensure that two consecutive days are not allowed
      if (dayDifference === 1) {
        return result.status(400).json({ error: "You cannot take remote on consecutive days." });
      }
    }

    // Check if the user has taken a remote on Friday of the previous week
    if (dayOfWeek === 1) { // If new request is for Monday
      const previousFriday = new Date(newRemoteDate);
      previousFriday.setDate(previousFriday.getDate() - (previousFriday.getDay() + 2)); // Get Friday of the previous week

      const previousFridayRemote = await pool.query(
        `SELECT date_remote FROM remote WHERE user_id = $1 AND date_remote = $2`,
        [userId, previousFriday]
      );

      if (previousFridayRemote.rows.length > 0) {
        return result.status(400).json({ error: "You cannot take a remote on Monday if you had one on Friday of the previous week." });
      }
    }

    // New condition: Check team size and valid remote requests for the day
    const teamIdQuery = `
      SELECT id
      FROM equipe
      WHERE $1 = ANY(employees);
    `;
    const teamSizeQuery = `
      SELECT array_length(employees, 1) AS team_size
FROM equipe
WHERE id = $1;
    `;
    const validRequestsQuery = `
      SELECT COUNT(*) AS valid_requests
      FROM remote r
      JOIN equipe e ON e.id = (
        SELECT id
        FROM equipe
        WHERE $1 = ANY(employees)
      )
      WHERE r.date_remote = $2
        AND r.user_id = ANY(e.employees)
        AND r.etat = 'VALIDE';
    `;

    // Get team ID
    const teamIdResult = await pool.query(teamIdQuery, [userId]);
    const teamId = teamIdResult.rows[0]?.id;

    if (!teamId) {
      return result.status(400).json({ error: "Team not found for the user." });
    }

    // Get team size
    const teamSizeResult = await pool.query(teamSizeQuery, [teamId]);
    const teamSize = parseInt(teamSizeResult.rows[0].team_size, 10);

    // Get valid remote requests
    const validRequestsResult = await pool.query(validRequestsQuery, [userId, dateRemote]);
    const validRequests = parseInt(validRequestsResult.rows[0].valid_requests, 10);

    const threshold = Math.ceil(0.4* teamSize); // 60% of the team size

    console.log("teamSizeResult",teamSizeResult)
    console.log("validRequests",validRequests)
    console.log("threshold",threshold)


    if (validRequests >= threshold) {
      return result.status(400).json({ error: "You cannot take a remote request on this day as it exceeds the 60% threshold of valid requests from your team." });
    }

    // Proceed with the database insertion if all conditions are met
    const res = await pool.query(
      `INSERT INTO remote (user_id, date_remote) VALUES ($1, $2) RETURNING id`,
      [userId, dateRemote]
    );

    const newRemoteId = res.rows[0].id;
    console.log("Insertion successful. New remote ID:", newRemoteId, "User ID:", userId);
    result.send({ newRemoteId });

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("Token expired error:", error);
      return result.status(401).json({ error: "Token expired" });
    } else {
      console.error("Error occurred during insertion:", error);
      return result.status(500).json({ error: "Database insertion error" });
    }
  }
};


  export const RefuseRemoteRequest = async (req, result) => {
    const { remoteId } = req.body;
    const tokenWithBearer = req.headers.authorization;
    const token = tokenWithBearer ? tokenWithBearer.replace("Bearer ", "") : null;
  
    if (!token) {
      return result.status(401).json({ error: "No token provided" });
    }
  
    try {
      // Verify and decode the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Check if the token has expired
      if (Date.now() >= decoded.exp * 1000) {
        return result.status(401).json({ error: "Token expired" });
      }
  
      // Token is valid and not expired, proceed with database operation
      console.log("Remote ID:", remoteId);
  
      const updateQuery = `
        UPDATE remote
        SET etat = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id
      `;
  
      const res = await pool.query(updateQuery, ["INVALIDE", remoteId]);
  
      if (res.rows.length === 0) {
        return result.status(404).json({ error: "Remote record not found" });
      }
  
      const updatedRemoteId = res.rows[0].id; // Get the updated record's ID
      console.log("Remote validation successful. Updated remote ID:", updatedRemoteId);
  
      result.send({ updatedRemoteId });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.error("Token expired error:", error);
        return result.status(401).json({ error: "Token expired" });
      } else {
        console.error("Error occurred during remote validation:", error);
        return result.status(500).json({ error: "Database update error" });
      }
    }
  };
  
  export const getRemotesByUserId = async (req, result) => {
    const tokenWithBearer = req.headers.authorization;
    const token = tokenWithBearer ? tokenWithBearer.replace("Bearer ", "") : null;
  
    if (!token) {
      return result.status(401).json({ error: "Authorization token missing" });
    }
  
    try {
      // Verify and decode the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Check if the token has expired
      if (Date.now() >= decoded.exp * 1000) {
        return result.status(401).json({ error: "Token expired" });
      }
  
      // Extract user_id from request body
      const { user_id } = req.body;
  
      if (!user_id || isNaN(user_id)) {
        return result.status(400).json({ error: "Invalid or missing user ID" });
      }
  
      // Query to get remote records for the specific user_id
      const query = "SELECT * FROM remote WHERE user_id = $1";
      const res = await pool.query(query, [user_id]);
  
      const remotes = res.rows;
      if (remotes.length === 0) {
        return result.status(404).json({ message: "No remote work records found for this user" });
      }
  
      console.log("Remote work records found for user:", remotes);
      result.json(remotes);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.error("Token expired error:", error);
        return result.status(401).json({ error: "Token expired" });
      } else if (error instanceof jwt.JsonWebTokenError) {
        console.error("JWT error:", error);
        return result.status(401).json({ error: "Invalid token" });
      } else {
        console.error("Error occurred while fetching remote records by user ID:", error);
        result.status(500).json({ error: "Internal server error" });
      }
    }
  };

  export const getRemotesByManagerId = async (req, result) => {
    const tokenWithBearer = req.headers.authorization;
    const token = tokenWithBearer ? tokenWithBearer.replace("Bearer ", "") : null;
    if (!token) {
        return result.status(401).json({ error: "Authorization token missing" });
    }

    try {
        // Verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the token has expired
        if (Date.now() >= decoded.exp * 1000) {
            return result.status(401).json({ error: "Token expired" });
        }

        // Extract id_manager from request body
        const { id_manager } = req.body;

        // Log the request body and id_manager for debugging
        console.log("Request body:", req.body);
        console.log("Extracted id_manager:", id_manager);

        // Check if id_manager is valid
        if (id_manager === undefined || id_manager === null || isNaN(Number(id_manager))) {
            return result.status(400).json({ error: "Invalid or missing manager ID" });
        }

        // Convert id_manager to an integer
        const managerId = parseInt(id_manager, 10);

        // Log the converted managerId for debugging
        console.log("Converted managerId:", managerId);

        // Query to get employees list for the specific id_manager
        const employeesQuery = "SELECT employees FROM equipe WHERE id_manager = $1";
        const employeesRes = await pool.query(employeesQuery, [managerId]);

        // Combine all employee arrays into a single array
        const employees = employeesRes.rows.flatMap(row => row.employees);

        if (employees.length === 0) {
            return result.status(404).json({ message: "No employees found for this manager" });
        }

        // Query to get remote records for the list of employee IDs
        const placeholders = employees.map((_, index) => `$${index + 1}`).join(", ");
        const remoteQuery = `SELECT * FROM remote WHERE user_id IN (${placeholders})`;
        const remoteRes = await pool.query(remoteQuery, employees);

        const remotes = remoteRes.rows;
        if (remotes.length === 0) {
            return result.status(404).json({ message: "No remote work records found for these employees" });
        }

        console.log("Remote work records found for employees:", remotes);
        result.json(remotes);
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            console.error("Token expired error:", error);
            return result.status(401).json({ error: "Token expired" });
        } else if (error instanceof jwt.JsonWebTokenError) {
            console.error("JWT error:", error);
            return result.status(401).json({ error: "Invalid token" });
        } else {
            console.error("Error occurred while fetching remote work records by manager ID:", error);
            result.status(500).json({ error: "Internal server error" });
        }
    }
};


export const getValidRemoteRequestsForEquipe = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const query = `
    SELECT r.date_remote
    FROM remote r
    JOIN equipe e ON e.id_manager = (
      SELECT id_manager
      FROM equipe
      WHERE $1 = ANY(employees)
    )
    WHERE r.user_id = ANY(e.employees)
      AND r.etat = 'VALIDE';
  `;

  try {
    const result = await pool.query(query, [userId]);
    res.status(200).json(result.rows.map(row => row.date_remote));
  } catch (error) {
    console.error('Error fetching valid remote dates for equipe:', error);
    res.status(500).json({ error: "Error fetching remote dates" });
  }
};

export const validateRemoteRequest = async (req, res) => {
  const { userId, remoteId } = req.body;

  if (!userId || !remoteId) {
    return res.status(400).json({ error: "User ID and Remote ID are required." });
  }

  try {
    // Fetch the remote request to validate
    const remoteQuery = `
      SELECT date_remote
      FROM remote
      WHERE id = $1
    `;
    const remoteResult = await pool.query(remoteQuery, [remoteId]);

    if (remoteResult.rows.length === 0) {
      return res.status(404).json({ error: "Remote request not found." });
    }

    const dateRemote = remoteResult.rows[0].date_remote;

    // Get team ID for the user
    const teamIdQuery = `
      SELECT id
      FROM equipe
      WHERE $1 = ANY(employees);
    `;
    const teamIdResult = await pool.query(teamIdQuery, [userId]);
    const teamId = teamIdResult.rows[0]?.id;

    if (!teamId) {
      return res.status(400).json({ error: "Team not found for the user." });
    }

    // Get the team size
    const teamSizeQuery = `
      SELECT array_length(employees, 1) AS team_size
      FROM equipe
      WHERE id = $1;
    `;
    const teamSizeResult = await pool.query(teamSizeQuery, [teamId]);
    const teamSize = parseInt(teamSizeResult.rows[0].team_size, 10);

    if (teamSize === 0) {
      return res.status(400).json({ error: "Team has no employees." });
    }

    // Get valid remote requests for the same date in the team
    const validRequestsQuery = `
      SELECT COUNT(*) AS valid_requests
      FROM remote r
      JOIN equipe e ON e.id = $1
      WHERE r.date_remote = $2
        AND r.user_id = ANY(e.employees)
        AND r.etat = 'VALIDE';
    `;
    const validRequestsResult = await pool.query(validRequestsQuery, [teamId, dateRemote]);
    const validRequests = parseInt(validRequestsResult.rows[0].valid_requests, 10);

    // Calculate the threshold (60% of the team)
    const threshold = Math.ceil(0.4 * teamSize);

    // Check if the 60% threshold has been reached
    if (validRequests >= threshold) {
      return res.status(400).json({
        error: `You cannot validate this remote request as more than 60% of the team is already on remote for the selected date (${validRequests}/${threshold}).`,
      });
    }

    // Proceed to validate (update etat to 'VALIDE')
    const updateRemoteQuery = `
      UPDATE remote
      SET etat = 'VALIDE', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, etat;
    `;
    const updateResult = await pool.query(updateRemoteQuery, [remoteId]);

    if (updateResult.rows.length === 0) {
      return res.status(500).json({ error: "Failed to validate the remote request." });
    }

    // Return success message
    return res.status(200).json({
      message: "Remote request successfully validated.",
      remoteId: updateResult.rows[0].id,
      etat: updateResult.rows[0].etat,
    });

  } catch (error) {
    console.error("Error validating remote request:", error);
    return res.status(500).json({ error: "Server error during validation." });
  }
};
