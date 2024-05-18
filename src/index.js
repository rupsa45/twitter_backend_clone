import {app} from './app.js'

import dotenv from "dotenv"

import connectDB from './db/index.js'

dotenv.config({
    path: './.env'
})


import {v2 as cloudinary} from 'cloudinary';


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

connectDB()
.then(()=>{
    app.listen(process.env.PORT|| 3030 ,()=>{
        console.log(`Server is running at port: http://localhost:${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("MONGODB connection failed !!", error)
})

