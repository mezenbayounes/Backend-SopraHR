import express from 'express';
import { CreateConge ,updateConge,getConge,getAllConges,validateConge,deleteConge,getCongesByUserId,getCongesByUserIds,getCongesByManagerId} from '../api/conge/CongeController.js';

const congeRouter = express.Router();

congeRouter.post('/CreateConge', CreateConge);
congeRouter.put('/updateConge', updateConge);
congeRouter.get('/getConge', getConge);
congeRouter.get('/getAllConges', getAllConges);
congeRouter.put('/validateConge', validateConge);
congeRouter.delete('/deleteConge', deleteConge);
congeRouter.post('/getCongesByUserId', getCongesByUserId);
congeRouter.get('/getCongesByUserIds', getCongesByUserIds);
congeRouter.post('/getCongesByManagerId', getCongesByManagerId);








export default congeRouter;