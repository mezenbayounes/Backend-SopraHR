import express from 'express';
import {CreateEquipe,GetEquipeById,UpdateEquipeById,GetAllEquipe,DeleteEquipeById,DeleteEquipeByIds,getEmployeesByManagerId} from '../api/Equipe/EquipeController.js'

const equipeRouter = express.Router();

equipeRouter.post('/CreateEquipe', CreateEquipe);   
equipeRouter.get('/GetEquipeById', GetEquipeById);
equipeRouter.put('/UpdateEquipeById', UpdateEquipeById);
equipeRouter.get('/GetAllEquipe', GetAllEquipe);
equipeRouter.delete('/DeleteEquipeById', DeleteEquipeById);
equipeRouter.delete('/DeleteEquipeByIds', DeleteEquipeByIds);
equipeRouter.get('/getEmployeesByManagerId', getEmployeesByManagerId);





export default equipeRouter;