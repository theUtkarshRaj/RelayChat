import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
import dbConnect from './config/db.js';
import userRoutes from './routes/user.js';
import { createClient } from 'redis';
import { ConnectRabbitmq } from './config/rabbitmq.js';
import cors from 'cors';
//mongoDB connect
dbConnect();
//redis setup
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
    throw new Error("Redis url not defined");
}
export const redisClient = createClient({
    url: redisUrl,
});
redisClient.connect()
    .then(() => {
    console.log("redis connected");
})
    .catch(console.error);
app.use(express.json());
//cors
app.use(cors());
//Routes
app.use("/api/v1", userRoutes);
//Rabbitmq connection
ConnectRabbitmq();
//listening server
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`server is running on Port ${port}`);
});
//# sourceMappingURL=index.js.map