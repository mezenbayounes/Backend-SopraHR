import express from 'express';
import { signup, login ,SendOTP,ChangeForgotPassword,is_verified,updateUser} from '../api/User/authController.js';
import upload from '../Middleware/multerConfig.js'
//S

const authRouter = express.Router();

authRouter.post('/signup', upload, signup);
authRouter.post('/login', login);
authRouter.post('/SendOTP', SendOTP);
authRouter.put('/ChangeForgotPassword', ChangeForgotPassword);
authRouter.put('/is_verified', is_verified);
authRouter.put('/updateUser', updateUser);




ChangeForgotPassword

export default authRouter;
