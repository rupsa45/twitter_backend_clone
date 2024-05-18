import {User} from '../models/user.models.js'
import bcrypt from 'bcryptjs'
import {generateTokenAndSetCookie} from '../utils/generateToken.js'
export const signup = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    if (
      [fullName, email, username, password].some((field) => {
        field?.trim() === "";
      })
    ) {
      return res.status(400).json({ error: "Allfields are required" });
    }


    // Checking if the user already exists
    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (existingUser) {
        return res.status(409).json({error:"Email or Username already exist"});
    }

    const salt =await bcrypt.genSalt(10)
    const hashedPassword= await bcrypt.hash(password,salt);

    const newUser = new User({
        fullName,
        username : username.toLowerCase(),
        email,
        password: hashedPassword
    })

    if(newUser){
        generateTokenAndSetCookie(newUser._id,res);
        await newUser.save()
        res.status(201).json({
           // message:'Sign up successful',
           _id:newUser.id,
           fullName:newUser.fullName,
           username:newUser.username,
           email:newUser.email,
           followers:newUser.followers,
           following:newUser.following,
           profileImg:newUser.profileImg,
           coverImg:newUser.coverImg,
        })
    }
    else{
        res.status(400).json({error:"Invalid user data"})
    }
  
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};


export const login = async (req, res) => {
  try {
    console.log("Received login request");
    const {username,password} =req.body;
    console.log("Login details - Username:", username);
    const user = await User.findOne({username})
    console.log("User found:", user ? user.username : "No user found");
    const isPasswordCorrect = await bcrypt.compare(password,user?.password || "")
    console.log("Password match:", isPasswordCorrect);
    if(!user || !isPasswordCorrect){
        return res.status(400).json({err:"Invalid credentials!!"})
    }
    console.log("Credentials are valid, generating token");
    generateTokenAndSetCookie(user._id,res);
    console.log("Sending response with user data");
    res.status(200).json({
        _id:user._id,
        fullName:user.fullName,
        username:user.username,
        email:user.email,
        followers:user.followers,
        following:user.following,
        profileImg:user.profileImg,
        coverImg:user.coverImg,
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};


export const logout = async (req, res) => {
  try {
    res.cookie("jwt","",{maxAge:0})
    res.status(200).json({message:"Logged out suggesfully"})
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const getMe = async(req,res)=>{
  try {
    const user= await User.findById(req.user._id).select("-password")
    res.status(200).json(user);
    
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
}