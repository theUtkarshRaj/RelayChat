import mongoose, { Document } from 'mongoose';
export interface Imessage extends Document {
    chatId: mongoose.Types.ObjectId;
    sender: String;
    text?: String;
    image?: {
        url: String;
        publicId: String;
    };
    messageType: "text" | "image";
    seen: Boolean;
    seenAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Messages: mongoose.Model<Imessage, {}, {}, {}, mongoose.Document<unknown, {}, Imessage, {}, mongoose.DefaultSchemaOptions> & Imessage & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, Imessage>;
//# sourceMappingURL=messages.d.ts.map