import pkg from 'pg';
import { connectionConfig } from '../../../dbConfig.js'; 



const { Pool } = pkg;
const pool = new Pool(connectionConfig);

export const CreateEquipe = async (req, result) => {
  const { idManager, idLigneManager, idPlateau, Partie, employees } = req.body;
  console.log('Request:', req.body);
  console.log('idManager:', idManager);
  console.log('idLigneManager:', idLigneManager);
  console.log('idPlateau:', idPlateau);
  console.log('Partie:', Partie);
  console.log('employees:', employees);

  try {
    const res = await pool.query(
      'INSERT INTO equipe (id_manager, id_ligne_manager, id_plateau, partie, employees) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [idManager, idLigneManager, idPlateau, Partie, employees]
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
    if (!equipe) {
      result.status(404).send('equipe not found');
      return;
    }
  
    console.log('Retrieval successful. Equipe:', equipe);
    result.send({ equipe });
    return 0;
  } catch (error) {
    
    console.error('Error occurred during retrieval:', error);
    throw error; // Rethrow the error to handle it further if needed
  }
};

export const UpdateEquipeById = async (req, result) => {
  const { equipeId, idManager, idLigneManager, idPlateau, Partie, employees } = req.body;

  try {
    const res = await pool.query(
      'UPDATE equipe SET id_manager = $1, id_ligne_manager = $2, id_plateau = $3, partie = $4, employees = $5 WHERE id = $6',
      [idManager, idLigneManager, idPlateau, Partie, employees, equipeId]
    );
    result.sendStatus(200);
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

export const DeleteEquipeById = async (req, result) => {
  const { equipeId } = req.body;

  try {
    const query = 'DELETE FROM equipe WHERE id = $1';
    const res = await pool.query(query, [equipeId]);

    const rowCount = res.rowCount;
  
      if (rowCount === 0) {
        result.status(404).send('equipe not found');
        return;
      }
  
      console.log('equipe deleted. Rows affected:', rowCount);
      result.sendStatus(200);
      return 0;
  } catch (error) {
    console.error('Error occurred during deletion:', error);
    throw error; // Rethrow the error to handle it further if needed
  }
};