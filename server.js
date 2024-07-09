import express from 'express'
import "dotenv/config"
import mongoose from 'mongoose'

import cors from 'cors'

import cloudinary from 'cloudinary'
import cookieParser from 'cookie-parser';



import connectDB from './config/connectDB/connectDB.js';

import errorMiddleware from './common/Error.js'

import userRouter from './routes/user/userRoute.js';
import rentCarRouter from './routes/rentCar/RentCarRoute.js'
import bookingRoute from './routes/booking/bookingRoute.js'
import driverRoute from './routes/driver/DriverRoute.js'


import {app, server } from './socket/Socket.js'




// EXPRESS SERVER PORT-ROUTE
const PORT = process.env.PORT || 3501;



// APP MAKING
// const app = express()



// DATABASE CONNECTION
connectDB();



// CLOUDIARY FILES UPLOADING SERVICE SETUP
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
})




// CUSTOM MIDDLEWARE
app.use(express.json())
app.use(cookieParser())
app.use(cors(
    {
        origin: ["http://localhost:5173", "http://localhost:4173", process.env.FRONTEND_URL_DOMAIN_I, process.env.FRONTEND_URL_DOMAIN_II],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
))








// TESTING PORT
app.get("/", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Welcome to CAR RENTAL SERVICE"
    })
})



// CUSTOM ROUTES
app.use("/user", userRouter)
app.use("/rent-car", rentCarRouter)
app.use("/booking", bookingRoute)
app.use("/driver", driverRoute)




// ERROR HANDLER
app.use(errorMiddleware)




server.listen(PORT, () => {
    console.log(`Connected to PORT: ${PORT}`)
})


export default app