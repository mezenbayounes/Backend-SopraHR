import express from 'express';
import { CreateRemote,validateRemote,getRemotesByUserId,getRemotesByManagerId } from '../api/Remote/RemoteController.js';

const RemoteRouter = express.Router();

RemoteRouter.post('/CreateRemote', CreateRemote);
RemoteRouter.put('/validateRemote', validateRemote);
RemoteRouter.post('/getRemotesByUserId', getRemotesByUserId);
RemoteRouter.post('/getRemotesByManagerId', getRemotesByManagerId);






export default RemoteRouter;