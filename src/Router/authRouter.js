import express from 'express';
import { signup, login ,SendOTP,ChangeForgotPassword,is_verified} from '../api/authController.js';

const authRouter = express.Router();


authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.post('/SendOTP', SendOTP);
authRouter.put('/ChangeForgotPassword', ChangeForgotPassword);
authRouter.put('/is_verified', is_verified);


ChangeForgotPassword

export default authRouter;
