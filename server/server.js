import express from 'express'
import {createServer} from 'http';
import {Server} from 'socket.io';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';




const app = express();
const port = process.env.PORT || 3000;
const server = new createServer(app);
const io = new Server(server, {
    cors:{
        origin: "https://common-chat-rho.vercel.app",
        method: ['GET', 'POST'],
        credentials: true,
    }
})

const randomNameConfig = {
    dictionaries: [colors, animals],
    separator: ' ',
    length: 2
}

app.get('/', (req, res) => {
    res.send("hi")
})


const countUsers = () => {
    io.to("chat").emit('user-count', io.engine.clientsCount)
}

io.on('connection', (socket) => {
    console.log(`user connected: ${socket.id}`)
    socket.join("chat")
    countUsers();

    socket.on('message', (data) => {
        const message = data.message
        const id = socket.id
        if(!socket.username || socket.username.trim() === ""){
            socket.username = uniqueNamesGenerator(randomNameConfig)
        }
        const username = socket.username
        console.log({username, message: data.message});
        io.to(data.roomName).emit('recieved-message', {message,username,id})
    })

    socket.on('submit-username', (data) => {
        if(!data || data.trim() === ""){
            socket.username = uniqueNamesGenerator(randomNameConfig)
        }else{
            socket.username = data
        }
        
    })

    socket.on('disconnect', () => {
        console.log(`user disconnected: ${socket.id}`);
        countUsers();
        
    })
})

server.listen(port, () => {
    console.log(`listening to port: ${port}`)
})