import express from 'express';
import {getUser,findUserById  } from '../api/User/UserController.js';

const userRouter = express.Router();


userRouter.get('/getuser', getUser);
userRouter.post('/GetUserByID', findUserById);





export default userRouter;