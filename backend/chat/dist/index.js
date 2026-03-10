import express from "express";
import dotenv from 'dotenv';
import dbConnect from "./config/db.js";
import chatRoutes from "./routes/chat.js";
import cors from "cors";
import { app, server } from "./config/socket.js";
dotenv.config();
app.use(express.json());
app.use(cors());
//database
dbConnect();
//routes
app.use("/api/v1", chatRoutes);
//server 
const port = process.env.PORT;
server.listen(port, () => {
    console.log(`server is listening at ${port}`);
});
//# sourceMappingURL=index.js.map