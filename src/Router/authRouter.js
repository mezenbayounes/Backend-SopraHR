import express from 'express';
import { signup, login ,SendOTP,ChangeForgotPassword,is_verified,updateUser,GetAllUser,GetAllLineManagers,GetAllManagers,GetAllEmployees} from '../api/User/authController.js';
import upload from '../Middleware/multerConfig.js'


const authRouter = express.Router();

authRouter.post('/signup', upload, signup);
authRouter.post('/login', login);
authRouter.post('/SendOTP', SendOTP);
authRouter.put('/ChangeForgotPassword', ChangeForgotPassword);
authRouter.put('/is_verified', is_verified);
authRouter.put('/updateUser', updateUser);
authRouter.get('/GetAllUser',GetAllUser);
authRouter.get('/GetAllLineManagers',GetAllLineManagers);
authRouter.get('/GetAllManagers',GetAllManagers);
authRouter.get('/GetAllEmployees',GetAllEmployees);







ChangeForgotPassword

export default authRouter;
