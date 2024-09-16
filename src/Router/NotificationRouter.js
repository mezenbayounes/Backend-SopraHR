import express from 'express';
import { getNotificationByUserId} from '../api/Notification/NotificationController.js';

const notificationRouter = express.Router();


notificationRouter.post('/getNotificationByUserId', getNotificationByUserId);








export default notificationRouter;