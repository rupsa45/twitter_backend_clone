import express from 'express'
import cors from "cors"
import cookieParser from 'cookie-parser';
import morgan  from 'morgan'


const app=express();


app.use(morgan('dev'));
const corsOptions = {
    origin: ['http://localhost:5173', 'https://twitter-clone-frontend-gyut.onrender.com'],
    optionsSuccessStatus: 200,
    credentials: true, // Include this in the options if you want to support credentials
};

const dynamicCorsOptions = {
    origin: (origin, callback) => {
        if (process.env.CORS_ORIGIN) {
            callback(null, process.env.CORS_ORIGIN);
        } else {
            callback(null, corsOptions.origin);
        }
    },
    optionsSuccessStatus: 200,
    credentials: true,
};

app.use(cors(dynamicCorsOptions));

app.use(express.json({limit: "5mb"}))// to parse req.body


app.use(express.urlencoded({limit: "5mb",extended:true}))  // to parse form data(urlencoded)

app.use(cookieParser())


import authRoutes from './routes/auth.routes.js'
app.use("/api/auth",authRoutes)

import userRoutes from './routes/user.routes.js'
app.use('/api/users',userRoutes);

import postRoutes from './routes/post.routes.js'
app.use('/api/posts',postRoutes);

import notificationRoutes from './routes/notifictation.routes.js'
app.use('/api/notifications',notificationRoutes);

export {app}