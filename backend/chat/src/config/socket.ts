import { Server, Socket } from "socket.io"
import http from 'http'
import express from "express"

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

const userSocketMap: Record<string, string> = {}

export function getReceiverSocketId(receiverId: string): string | undefined {
    return userSocketMap[receiverId]
}

io.on("connection", (socket: Socket) => {
    console.log("user connected", socket.id);

    const userId = socket.handshake.query.userId as string | undefined;

    // Map userId to socketId on connection
    if (userId && userId !== 'undefined') {
        userSocketMap[userId] = socket.id
        console.log(`user ${userId} mapped to socket ${socket.id}`)
    }

    // Broadcast updated online users list to everyone
    io.emit("getOnlineUser", Object.keys(userSocketMap))

    if(userId){
        socket.join(userId)
    }
    socket.on("typing",(data)=>{
        console.log(`user ${data.userId} is typing in chat ${data.chatId}`);
        socket.to(data.chatId).emit("userTyping",{
            chatId : data.chatId,
            userId: data.userId
        })
    })

    socket.on("stopTyping",(data)=>{
        console.log(`User ${data.userId} stopped typing in chat ${data.chatId}`)
        socket.to(data.chatId).emit("stopTyping",{
            chatId : data.chatId,
            userId: data.userId
        })
    })

    socket.on("joinChat",(chatId)=>{
        socket.join(chatId)
        console.log(`user ${userId} joined a chat room ${chatId}`)
    })

    socket.on("leaveChat",(chatId)=>{
        socket.leave(chatId)
        console.log(`user ${userId} left the chat room ${chatId}`)
    })

    socket.on("disconnect", () => {
        console.log("user disconnected", socket.id)

        // Remove user from map on disconnect
        if (userId && userId !== 'undefined') {
            delete userSocketMap[userId]
            console.log(`user ${userId} removed from socket map`)
        }

        // Broadcast updated online users list
        io.emit("getOnlineUser", Object.keys(userSocketMap))
    })
})

export { app, server, io }