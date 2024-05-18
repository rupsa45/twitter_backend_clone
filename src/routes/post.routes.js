import express from 'express'

import {createPost,likeUnlikePost,commentOnPost,deletePost,getAllPost,getLikedPosts,getUserPosts,getsFollowingPosts} from '../controllers/posts.controllers.js'

import {protectRoute} from '../middleware/protectRoute.js'
const router =express.Router()

router.get("/all",protectRoute,getAllPost);
router.get("/following",protectRoute,getsFollowingPosts);
router.get("/likes/:id",protectRoute,getLikedPosts);
router.get("/username/:username",protectRoute,getUserPosts);
router.post("/create",protectRoute,createPost);
router.post("/like/:id",protectRoute,likeUnlikePost);
router.post("/comment/:id",protectRoute,commentOnPost);
router.delete("/delete/:id",protectRoute, deletePost);

export default router;