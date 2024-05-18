import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required:true,
        unique:true
    },
    fullName:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required: true
    },
    email:{
        type:String,
        require:true,
        unique:true
    },
    followers:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            default:[]
        }
    ],
    following:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            default:[]
        }
    ],
    profileImg:{
        type:String,
        default:"",
    },
    coverImg:{
        type:String,
        default:"",
    },
    bio:{
        type:String,
        maxLength:100,
        default:""
    },
    link:{
        type:String,
        default:"",
    },
    likedPost:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Post",
            default:[]
        }
    ]
},{
    timestamps:true
})

export const  User = mongoose.model("User",userSchema)