import express from 'express';
import { login, logout, signup ,getMe} from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';
const  authRoutes=express.Router();


authRoutes.post('/signup',signup);
authRoutes.post('/login',login);
authRoutes.post('/logout',logout);
authRoutes.get('/me',protectRoute,getMe);


export default authRoutes;