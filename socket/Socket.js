import express from 'express'
import cors from 'cors'

import { Server } from 'socket.io'
import { createServer } from 'http'


import { MESSAGE, RECIVED_MESSAGES, TRIGGERINGREQUEST, WELCOME } from '../helper/events.js'




// creating a app
const app = express()



// MAKING SOCKET Connection 
const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:4173", process.env.FRONTEND_URL_DOMAIN_I, process.env.FRONTEND_URL_DOMAIN_II],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"]
    },
    // transports:['websocket', 'polling']
})






io.on("connection", (socket)=>{

    console.log("User Connected:- ", socket.id)

    // sending the messing to frontend
    socket.emit(WELCOME, "Welcome to the CAR RENTAL SERVICE")



    socket.on(TRIGGERINGREQUEST, ()=>{
        socket.broadcast.emit('requestTriggered')
    })


    socket.on(MESSAGE, (data)=>{
        console.log(data)

        // EMMITTING DATA BACK TO FRONTEND
        io.emit(RECIVED_MESSAGES, data);
    })


    // when user get disconnected
    socket.on("disconnect", ()=>{
        console.log(`User Disconnected:- ${socket.id}`)
    })
})





export {app, server}