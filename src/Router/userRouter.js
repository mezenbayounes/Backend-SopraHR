import express from 'express';
import {getUser  } from '../api/User/UserController.js';

const userRouter = express.Router();


userRouter.get('/getuser', getUser);




export default userRouter;