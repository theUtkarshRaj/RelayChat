import mongoose from 'mongoose';
async function dbConnect() {
    const url = process.env.MONGO_URI;
    if (!url) {
        throw new Error("Mongo_URI is not defined in env");
    }
    try {
        await mongoose.connect(url, {
            dbName: "chatAppMicroservices"
        });
        console.log("MongoDB connected Successfully");
    }
    catch (err) {
        console.error("failed to connect mongoDB", err);
        process.exit(1);
    }
}
export default dbConnect;
//# sourceMappingURL=db.js.map