import express from 'express';
import {CreatePlateau,UpdatePlateau,GetPlateauById,GetAllPlateaux,DeletePlateauById,DeletePlateauByIds}from '../api/Plateau/PlateauController.js'

const PlateauRouter = express.Router();

PlateauRouter.post('/CreatePlateau', CreatePlateau);
PlateauRouter.put('/UpdatePlateau', UpdatePlateau);
PlateauRouter.get('/GetPlateauById', GetPlateauById);
PlateauRouter.get('/GetAllPlateaux', GetAllPlateaux);
PlateauRouter.delete('/DeletePlateauById', DeletePlateauById);
PlateauRouter.delete('/DeletePlateauByIds', DeletePlateauByIds);










export default PlateauRouter;