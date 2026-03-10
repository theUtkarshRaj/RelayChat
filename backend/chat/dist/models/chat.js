import mongoose, { Document, Schema } from "mongoose";
const schema = new Schema({
    users: [{ type: String, required: true }],
    latestMessage: {
        text: {
            type: String
        },
        sender: {
            type: String
        }
    }
}, { timestamps: true });
export const Chat = mongoose.model("Chat", schema);
//# sourceMappingURL=chat.js.map