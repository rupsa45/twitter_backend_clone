import {User} from '../models/user.models.js'
import {Notification} from '../models/notification.models.js'
import bcrypt from 'bcryptjs'
import {v2 as cloudinary} from 'cloudinary';

export const getUserProfile=async(req,res)=>{
    const {username} =req.params;
    try {
       const user= await User.findOne({username}).select("-password")

       if(!user) return res.status(404) .json('User not found') 

        res.status(200).json(user)
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
}

export const followUnfollowUser=async(req,res)=>{
    try {
        const {id} = req.params;
        const  userModify=await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if(id === req.user._id.toString()){
            return res.status(400).json({err:"You can't follow/unfollow yourself"})
        }

        if(!userModify || !currentUser){
            return res.status(404).json({error:"User not found"})
        }

        const isFollowing =currentUser.following.includes(id);

        if (isFollowing){
            // unfollow the user
            await User.findByIdAndUpdate(id,{ $pull :{ followers: req.user._id}})
            await User.findByIdAndUpdate(req.user._id,{ $pull :{ following: id}})
            res.status(200).json({message: "User unfollowed Successfully"})
        }else{
            // follow the user
            await User.findByIdAndUpdate(id , { $push: { followers:req.user._id }});
            await User.findByIdAndUpdate(req.user._id, { $push:{ following:id }});
            //send notification to the user
            const notification =new Notification({
                type:"follow",
                from:req.user._id,
                to:userModify._id
            })
            await notification.save();

            //TODO: return the id of the user as a response 
            res.status(200).json({message: "User followed Successfully"})
        }

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
}

export const getSuggestedUsers=async(req,res)=>{
    try {
       const userId =req.user._id;

        // Fetching only 'following' field using projection
        const { following } = await User.findById(userId).select("following");


       // Aggregating random users
       const users = await User.aggregate([
            {
                $match: { 
                    _id: { $ne: userId }
                }
            },{
                $sample: { size: 10 }
            }
        ]);

        // Filtering out users who are already followed
        const filteredUsers = users.filter(user => !following.includes(user._id));

       // Selecting a subset of suggested users
       const suggestedUsers = filteredUsers.slice(0, 4);

       // Removing password field (optional)
       suggestedUsers.forEach(user => delete user.password);

       res.status(200).json(suggestedUsers);

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
}

export const updateUser = async (req, res) => {
    const { fullName, username, email, currentPassword, newPassword, bio, link } = req.body;
    let { profileImg, coverImg } = req.body;

    const userId = req.user._id;
    console.log('Received data:', req.body);
    try {
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if ((newPassword && !currentPassword) || (currentPassword && !newPassword)) {
            return res.status(400).json({
                message: "Please provide both the old and new password"
            });
        }

        if (currentPassword && newPassword) {
            const isMatched = await bcrypt.compare(currentPassword, user.password);
            if (!isMatched) {
                return res.status(400).json({
                    error: "Current password is incorrect"
                });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        if (profileImg) {
            if (user.profileImg) {
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadedResponse.secure_url;
        }

        if (coverImg) {
            if (user.coverImg) {
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadedResponse.secure_url;
        }

        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        user = await user.save();

        // Remove the password from the response
        user.password = undefined;

        return res.status(200).json(user);

    } catch (error) {
        console.error(error); // Add this line to log errors
        res.status(error.statusCode || 500).json({ error: error.message });
    }
}