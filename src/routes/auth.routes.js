import express from 'express'
import { getMe, login, logout, signup } from '../controllers/auth.controller.js'
import { protectRoute } from '../middleware/protectRoute.js'

const router=express.Router()

router.get("/me",protectRoute,getMe)

router.post("/signup",signup)

router.post("/signin",login)

router.post("/logout",logout)

export default router;