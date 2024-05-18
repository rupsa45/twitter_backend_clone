import {User}  from '../models/user.models.js'
import jwt from 'jsonwebtoken'
export const protectRoute = async(req,res,next)=>{
    try {
       const token = req.cookies.jwt; 
       console.log("Token from cookie:", token);
       if(!token){
            return res.status(401).json({
                error:"Unathorized No token Provided "
            });
        }

        const decoded =  jwt.verify(token,process.env.JWT_SECRET)

        if(!decoded){
            return res.status(401).json({err:"Unathorized Invalid token"});
        }

        const user= await User.findById(decoded.userId).select("-password");

        if(!user){
            return res.status(404).json({err:"User not found"})
        }

        req.user=user
        next()
       
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
}