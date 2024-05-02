import express from 'express';
import { CreateConge ,updateConge,getConge,getAllConges,validateConge,deleteConge} from '../api/conge/CongeController.js';

const congeRouter = express.Router();

congeRouter.post('/CreateConge', CreateConge);
congeRouter.put('/updateConge', updateConge);
congeRouter.get('/getConge', getConge);
congeRouter.get('/getAllConges', getAllConges);
congeRouter.put('/validateConge', validateConge);
congeRouter.delete('/deleteConge', deleteConge);




export default congeRouter;