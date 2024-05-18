import {v2 as cloudinary} from 'cloudinary';
import {User} from '../models/user.models.js'
import {Post} from '../models/posts.models.js'
import {Notification} from '../models/notification.models.js'


export const createPost=async(req,res)=>{
    try {
       const {text} =req.body;

       let{img}=req.body;

       const userId=req.user._id.toString();

       const user =await User.findById(userId)

       if(!user) return res.status(404).json({message:"User not found"})

        if(!text && !img){
            return  res.status(400).json({message:"Post must have text or image "});
        }
        if(img){
            const uploadedResponses=await cloudinary.uploader.upload(img)
            img=uploadedResponses.secure_url
        }
        const newPost=new Post({
            user:userId,
            text,
            img
        })
        await newPost.save()
        res.status(201).json(newPost)
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
}

export const likeUnlikePost=async(req,res)=>{
    try {
        const userId = req.user._id;
        const {id:postId} =req.params;
        const post =await Post.findById(postId)

        if(!post){
            return res.status(404).json({error:"Post not found"})
        }

        const userLikedPost =post.likes.includes(userId);

        if(userLikedPost){
            //unlike the post
            await Post.updateOne({_id:postId},{$pull:{likes:userId}});
            await User.updateOne({_id : userId},{$pull:{likedPost:postId}});
            const updatedLikes= post.likes.filter((id)=> id.toString() !== userId.toString())
            res.status(200).json(updatedLikes)
        }else{
            //like the post
            post.likes.push(userId)
            await User.updateOne({_id:userId},{$push:{likedPost:postId}})
            await post.save();

            const notification =new Notification({
                from :userId,
                to :post.user,
                type:"like"
            })
            await notification.save()
            const updatedLikes =post.likes;
            res.status(200).json(updatedLikes)
        }
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
}

export const commentOnPost=async(req,res)=>{
    try {
       const {text} =req.body;
       const postId =req.params.id;
       const userId =req.user._id;

       if(!text){
            return res.status(400).json({
                error:"Text field is required"
            })
       }
       const post =await Post.findById(postId);
       if(!post){
        return res.status(404).json({error:"post not found"})
       }
       const comment ={
            user : userId,
            text,
       }

       post.comments.push(comment);
       await post.save()

       const notification =new Notification({
        from :userId,
        to :post.user,
        type:"comment"
        })
        await notification.save()
        res.status(201).json({
            message:"Post Liked successfully",
            post
        })
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
}

export const  deletePost=async(req,res)=>{
    try {
        const post =await Post.findById(req.params.id)

        if(!post){
            return res.status(404).json({error:"Post not found"})
        }

        if(post.user.toString() !== req.user._id.toString()){
            return res.status(401).json({
                error:"You are not authorized to delete this post"
            })
        }

        await Post.findByIdAndDelete(req.params.id)

        res.status(200).json({
            message:"Psot deleted successfully"
        })


    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
}

export const getAllPost=async(req,res)=>{
    try {
        const post =await Post.find().sort({createAt:-1}).populate({
            path:'user',
            select:"-password"
        }).populate({
            path:'comments.user',
            select:"-password"
        })

        if(post.length ===0){
            return res.status(200).json([])
        }

        res.status(200).json(post);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
}

export const getLikedPosts=async(req,res)=>{
    const userId = req.params.id;
    try {
        const user =await User.findById(userId);
        if(!user) return res.status(404).json({error : "user not found"});

        const likedPost =await Post.find({_id:{$in:user.likedPost}})
        .populate({
            path:'user',
            select:"-password"
        })
        .populate({
            path:'comments.user' ,
            select:"-password"
        })
        
        res.status(200).json(likedPost)
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
}

export const getsFollowingPosts=async (req,res)=>{
    try {
        const userId =req.user._id;
        const user =await User.findById(userId);
        if(!user) return res.status(404).json({error:"user not found"});

        const following = user.following;

        const feedPosts =await Post.find({user : {$in:following}})
        .sort({createdAt:-1})
        .populate({
            path:'user',
            select:"-password"
        })
        .populate({
            path:'comments.user',
            select:"-password"
        });

        res.status(200).json(feedPosts);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
}


export const getUserPosts =async(req,res)=>{
    try {
        const {username}= req.params;
        const user =await User.findOne({username})
        if(!user){
            return res.status(404).json({
                error:"user not found"
            })
        }
        const posts =await Post.find({user:user._id})
        .sort({createdAt:-1})
        .populate({
            path:"user",
            select:"-password"
        })
        .populate({
            path:"comments.user",
            select:"-password",
        })
        res.status(200).json(posts)
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
}