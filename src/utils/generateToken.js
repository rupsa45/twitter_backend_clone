import jwt from 'jsonwebtoken'
if (!process.env.JWT_SECRET) {
    console.log("JWT_SECRET is not defined in environment variables");
}
export const generateTokenAndSetCookie=(userId,res)=>{
    const token =jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn: "15d" 
    })
     console.log(`NODE_ENV :${process.env.NODE_ENV}`);
    
    res.cookie("jwt",token,{
        maxAge:15*24*60*60*1000,//ms
        httpOnly:true ,
        sameSite: "lax",
        secure: process.env.NODE_ENV !== "development",
    })
}
