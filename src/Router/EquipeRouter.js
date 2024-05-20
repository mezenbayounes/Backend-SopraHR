import express from 'express';
import {CreateEquipe,GetEquipeById,UpdateEquipeById,GetAllEquipe,DeleteEquipeById,DeleteEquipeByIds} from '../api/Equipe/EquipeController.js'

const equipeRouter = express.Router();

equipeRouter.post('/CreateEquipe', CreateEquipe);   
equipeRouter.get('/GetEquipeById', GetEquipeById);
equipeRouter.put('/UpdateEquipeById', UpdateEquipeById);
equipeRouter.get('/GetAllEquipe', GetAllEquipe);
equipeRouter.delete('/DeleteEquipeById', DeleteEquipeById);
equipeRouter.delete('/DeleteEquipeByIds', DeleteEquipeByIds);




export default equipeRouter;