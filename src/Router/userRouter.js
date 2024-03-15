import express from 'express';
import {getUser  } from '../api/UserController.js';

const userRouter = express.Router();


userRouter.get('/getuser', getUser);



export default userRouter;