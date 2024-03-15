import express from 'express';
import { signup, login ,SendOTP,ChangeForgotPassword} from '../api/authController.js';

const authRouter = express.Router();


authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.post('/SendOTP', SendOTP);
authRouter.put('/ChangeForgotPassword', ChangeForgotPassword);

ChangeForgotPassword

export default authRouter;
