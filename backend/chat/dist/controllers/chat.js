import TryCatch from "../config/tryCatch.js";
import { isAuth } from "../middlewares/isAuth.js";
import { Chat } from "../models/chat.js";
import { Messages } from "../models/messages.js";
import axios from "axios";
import { io, getReceiverSocketId } from "../config/socket.js";
export const createNewChat = TryCatch(async (req, res) => {
    //khud  ka id
    const userId = req.user?._id;
    //jisse baat kr rhe uska id
    const { otherUserId } = req.body;
    if (!otherUserId) {
        res.status(401).json({
            message: "Other userid is required"
        });
        return;
    }
    // 2 logo ka existing chat
    const existingChat = await Chat.findOne({
        users: { $all: [userId, otherUserId], $size: 2 }
    });
    if (existingChat) {
        res.json({
            message: "chat already exists",
            chatId: existingChat._id
        });
        return;
    }
    const newChat = await Chat.create({
        users: [userId, otherUserId]
    });
    res.status(201).json({
        message: "New chat created",
        chatId: newChat._id
    });
});
//chat fetch krne ke liye
export const getAllChats = TryCatch(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        res.status(401).json({
            message: "userId missing"
        });
        return;
    }
    const chats = await Chat.find({ users: userId }).sort({ updatedAt: -1 });
    const chatWithUserData = await Promise.all(chats.map(async (chat) => {
        const otherUserId = chat.users.find((id) => id !== userId);
        //unseen count
        const unseenCount = await Messages.countDocuments({
            chatId: chat._id,
            sender: { $ne: userId },
            seen: false
        });
        try {
            const { data } = await axios.get(`${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`);
            return {
                user: data,
                chat: {
                    ...chat.toObject(),
                    latestMessage: chat.latestMessage || null,
                    unseenCount,
                }
            };
        }
        catch (err) {
            console.log(err);
            return {
                user: { _id: otherUserId, name: "Unknown User" },
                chat: {
                    ...chat.toObject(),
                    latestMessage: chat.latestMessage || null,
                    unseenCount,
                }
            };
        }
    }));
    res.json({
        chats: chatWithUserData
    });
});
//send message
export const sendMessage = TryCatch(async (req, res) => {
    const senderId = req.user?._id;
    const { chatId, text } = req.body;
    const imageFile = req.file;
    if (!senderId) {
        res.status(401).json({
            message: "unauthorized"
        });
        return;
    }
    if (!chatId) {
        res.status(400).json({
            message: "chat ID required"
        });
        return;
    }
    if (!text && !imageFile) {
        res.status(400).json({
            message: "Either text or image is required"
        });
        return;
    }
    const chat = await Chat.findById(chatId);
    if (!chat) {
        res.status(404).json({
            message: "chat not found"
        });
        return;
    }
    //other user not allowed in chat
    const isUserinChat = chat.users.some((userId) => userId.toString() === senderId.toString());
    if (!isUserinChat) {
        res.status(403).json({
            message: "You are not a participant of this chat"
        });
        return;
    }
    const otherUserId = chat.users.find((userId) => userId.toString() !== senderId.toString());
    if (!otherUserId) {
        res.status(401).json({
            message: "no other user"
        });
        return;
    }
    //socket setup
    const receiverSocketId = getReceiverSocketId(otherUserId.toString());
    let isReceiverInChatRoom = false;
    if (receiverSocketId) {
        const receiverSocket = io.sockets.sockets.get(receiverSocketId);
        if (receiverSocket && receiverSocket.rooms.has(chatId)) {
            isReceiverInChatRoom = true;
        }
    }
    let messageData = {
        chatId: chatId,
        sender: senderId,
        seen: isReceiverInChatRoom,
        seenAt: isReceiverInChatRoom ? new Date() : undefined
    };
    if (imageFile) {
        messageData.image = {
            url: imageFile.path,
            publicId: imageFile.filename,
        };
        messageData.messageType = "image";
        messageData.text = text || "";
    }
    else {
        messageData.text = text;
        messageData.messageType = "text";
    }
    const message = new Messages(messageData);
    const saveMessage = await message.save();
    const latestMessage = imageFile ? "📷 Image" : text;
    await Chat.findByIdAndUpdate(chatId, {
        latestMessage: {
            text: latestMessage,
            sender: senderId
        },
        updatedAt: new Date(),
    }, {
        new: true
    });
    // Emit real-time message to receiver via Socket.IO
    io.to(chatId).emit("newMessage", saveMessage);
    if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", saveMessage);
    }
    const senderSocketId = getReceiverSocketId(senderId.toString());
    if (senderSocketId) {
        io.to(senderSocketId).emit("newMessage", saveMessage);
    }
    if (isReceiverInChatRoom && senderSocketId) {
        io.to(senderSocketId).emit("messagesSeen", {
            chatId: chatId,
            seenBy: otherUserId,
            messageIds: [saveMessage._id]
        });
    }
    res.status(201).json({
        message: saveMessage,
        sender: senderId
    });
});
//messages of chat
export const getMessagesByChat = TryCatch(async (req, res) => {
    const userId = req.user?._id;
    const { chatId } = req.params;
    if (!chatId) {
        res.status(400).json({
            message: "chat id required"
        });
        return;
    }
    if (!userId) {
        res.status(401).json({
            message: "Unauthorized"
        });
        return;
    }
    const chat = await Chat.findById(chatId);
    if (!chat) {
        res.status(404).json({
            message: "Chat not found"
        });
        return;
    }
    //other user not allowed in chat
    const isUserinChat = chat.users.some((id) => id.toString() === userId.toString());
    if (!isUserinChat) {
        res.status(403).json({
            message: "You are not a participant of this chat"
        });
        return;
    }
    //message ko seen mark krna
    const messagesToMarkSeen = await Messages.find({
        chatId: chatId,
        sender: { $ne: userId },
        seen: false,
    });
    await Messages.updateMany({
        chatId: chatId,
        sender: { $ne: userId },
        seen: false,
    }, {
        seen: true,
        seenAt: new Date()
    });
    const messages = await Messages.find({ chatId }).sort({ createdAt: 1 });
    const otherUserId = await chat.users.find((id) => id !== userId);
    try {
        const { data } = await axios.get(`${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`);
        if (!otherUserId) {
            res.status(403).json({
                message: "No other User"
            });
            return;
        }
        //socket work
        if (messagesToMarkSeen.length > 0) {
            const otherUserSocketId = getReceiverSocketId(otherUserId.toString());
            if (otherUserSocketId) {
                io.to(otherUserSocketId).emit("messagesSeen", {
                    chatId: chatId,
                    seenBy: userId,
                    messageIds: messagesToMarkSeen.map((msg) => msg._id)
                });
            }
        }
        res.json({
            messages,
            user: data
        });
    }
    catch (err) {
        console.log(err);
        res.json({
            messages,
            user: { _id: otherUserId, name: "unknown User" }
        });
    }
});
//# sourceMappingURL=chat.js.map