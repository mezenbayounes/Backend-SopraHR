import express from 'express';
import { signup, login } from './authController.js';

const authRouter = express.Router();

// Define routes
authRouter.post('/signup', signup);
authRouter.post('/login', login);

// Additional routes like forgot password can be defined here...

export default authRouter;
