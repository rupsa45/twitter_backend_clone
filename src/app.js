import express from 'express'
import cors from "cors"
import cookieParser from 'cookie-parser';
import morgan  from 'morgan'
import fs from 'fs'
import path from 'path';
import { fileURLToPath } from 'url';

const app=express();
const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename);

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

app.use(morgan('dev'));

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))


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