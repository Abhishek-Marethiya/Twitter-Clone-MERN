import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
const userRoutes=express.Router();
import { getUserProfile, followUnfollowUser,getSuggestedUsers,updateUserProfile} from '../controllers/user.controller.js';

userRoutes.get("/profile/:username",protectRoute,getUserProfile);
userRoutes.get("/suggested",protectRoute,getSuggestedUsers);
userRoutes.post("/follow/:id",protectRoute,followUnfollowUser);
userRoutes.post("/update",protectRoute,updateUserProfile);



export default userRoutes;