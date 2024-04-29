import pkg from 'pg';
import { connectionConfig } from '../../../dbConfig.js'; 



const { Pool } = pkg;
const pool = new Pool(connectionConfig);

export const CreateEquipe = async (req,result) => {
  const { idManager, idLigneManager, employees } = req.body;
  console.log('Request:', req.body);
  console.log('idManager:', idManager);
  console.log('idLigneManager:', idLigneManager);
  console.log('employees:', employees);

  try {
    const res = await pool.query(
      'INSERT INTO equipe (id_manager, id_ligne_manager, employees) VALUES ($1, $2, $3) RETURNING id',
      [idManager, idLigneManager, employees]
    );

    const newInstanceId = res.rows[0].id; // Access the ID from the database response

    console.log('Insertion successful. New instance ID:', newInstanceId);
    result.send({ newInstanceId });
    return 0;
  } catch (error) {
    console.error('Error occurred during insertion:', error);
    throw error; // Rethrow the error to handle it further if needed
  }
};

export const GetEquipeById = async (req,result) => {
  const { id } = req.body;

  try {
    console.log(id);
    const res = await pool.query(
      'SELECT * FROM equipe WHERE id = $1',
      [id]
    );

    const equipe = res.rows[0]; // Access the retrieved equipe instance

    console.log('Retrieval successful. Equipe:', equipe);
    result.send({ equipe });
    return 0;
  } catch (error) {
    console.error('Error occurred during retrieval:', error);
    throw error; // Rethrow the error to handle it further if needed
  }
};

export const UpdateEquipeById = async (req) => {
  const { equipeId, idManager, idLigneManager, employees } = req.body;

  try {
    const res = await pool.query(
      'UPDATE equipe SET id_manager = $1, id_ligne_manager = $2, employees = $3 WHERE id = $4',
      [idManager, idLigneManager, employees, equipeId]
    );
   
    console.log('Update successful.');

    return 0; // Returns the number of affected rows
  } catch (error) {
    console.error('Error occurred during update:', error);
    throw error; // Rethrow the error to handle it further if needed
  }
};

export const GetAllEquipe = async (req, res) => {
  try {
    const query = 'SELECT * FROM equipe';
    const result = await pool.query(query);
    const equipes = result.rows;

    console.log('Retrieval successful. Equipes:', equipes);
    res.send({ equipes });

    return equipes;
  } catch (error) {
    console.error('Error occurred during retrieval:', error);
    throw error; // Rethrow the error to handle it further if needed
  }
};

export const DeleteEquipeById = async (req, res) => {
  const { equipeId } = req.body;

  try {
    const query = 'DELETE FROM equipe WHERE id = $1';
    const result = await pool.query(query, [equipeId]);

    console.log('Deletion successful.');

    res.sendStatus(204); // Send a success status code (204 - No Content)
  } catch (error) {
    console.error('Error occurred during deletion:', error);
    throw error; // Rethrow the error to handle it further if needed
  }
};