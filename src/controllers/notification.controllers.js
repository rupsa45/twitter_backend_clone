import {Notification} from '../models/notification.models.js'


export const getNotification=async(req,res)=>{

    try {
        const userId =req.user._id;
        const notification =await Notification.find({to : userId}).populate({
            path:"from",
            select:"username profileImg"
        })

        await Notification.updateMany({to:userId},{read:true})

        res.status(200).json(notification)
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
}

export const deleteNotifications=async(req,res)=>{
    try {
        const userId =req.user._id;
        await Notification.deleteMany({to:userId})

        res.status(200).json({
            message:'Notifications deleted successfully!'
        })
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
}

export const deleteNotification=async(req,res)=>{
    
    try {
        const notificationId = req.params.id;
        const userId =req.user._id;
        const notification = await Notification.findById(notificationId);
        if(!notificationId){
            return res.status(400).json({
                error:"No such notification exists!"
            })
        }
        if(notification.to.toString() !== userId.toString()){
            return res.status(403).json({
                error:" you are not allowed to delete this notification "
            })
        }

        await Notification.findByIdAndDelete(notification);

        res.status(200).json({
            message:"Notifcation deleted successfully"
        })
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
}