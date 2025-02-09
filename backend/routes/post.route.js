import express from 'express';
import { createPost,deletePost,commentOnPost ,likeUnlikePost,getAllPosts,getFollowingPosts,getLikedPosts,getUserPosts} from '../controllers/post.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';


   const postRoutes=express.Router();

   postRoutes.post("/create",protectRoute,createPost);
   postRoutes.delete("/:id", protectRoute, deletePost);
   postRoutes.post("/comment/:id", protectRoute, commentOnPost);
   postRoutes.post("/like/:id", protectRoute, likeUnlikePost);
   postRoutes.get("/all", protectRoute, getAllPosts);
   postRoutes.get("/following", protectRoute, getFollowingPosts);
   postRoutes.get("/likes/:id", protectRoute, getLikedPosts);
   postRoutes.get("/user/:username", protectRoute, getUserPosts);
      




   export default postRoutes;