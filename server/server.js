import { Socket } from 'dgram';
import express from 'express'
import {createServer} from 'http';
import {Server} from 'socket.io';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';


const timeFunc = () => {
    const date = new Date(Date.now());
    const time = `${date.getHours()}:${date.getMinutes()}`
    return time
}

const app = express();
const port = 3000;
const server = new createServer(app);
const io = new Server(server, {
    cors:{
        origin: "http://localhost:5173",
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
    res.send("<h1>Helloz</h1>")
})

io.on('connection', (socket) => {
    console.log(`user connected: ${socket.id}`)
    socket.join("chat")

    socket.on('message', (data) => {
        const message = data.message
        const id = socket.id
        let sendTime = timeFunc()
        if(!socket.username || socket.username.trim() === ""){
            socket.username = uniqueNamesGenerator(randomNameConfig)
        }
        const username = socket.username
        console.log({username, message: data.message});
        io.to(data.roomName).emit('recieved-message', {message,username,id, sendTime})
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
    })
})

server.listen(port, () => {
    console.log(`listening to port: ${port}`)
})