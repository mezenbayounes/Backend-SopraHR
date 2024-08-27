import express from 'express';
import { CreateRemote,RefuseRemoteRequest,getRemotesByUserId,getRemotesByManagerId,getValidRemoteRequestsForEquipe,validateRemoteRequest } from '../api/Remote/RemoteController.js';

const RemoteRouter = express.Router();

RemoteRouter.post('/CreateRemote', CreateRemote);
RemoteRouter.put('/RefuseRemoteRequest', RefuseRemoteRequest);
RemoteRouter.post('/getRemotesByUserId', getRemotesByUserId);
RemoteRouter.post('/getRemotesByManagerId', getRemotesByManagerId);
RemoteRouter.post('/getValidRemoteRequestsForEquipe', getValidRemoteRequestsForEquipe);
RemoteRouter.put('/validateRemoteRequest', validateRemoteRequest);







export default RemoteRouter;