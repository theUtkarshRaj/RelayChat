    import mongoose , {Document,Schema} from 'mongoose'

    export interface Imessage extends Document{
        chatId : mongoose.Types.ObjectId;
        sender : String;
        text?:String;
        image?:{
            url:String,
            publicId:String
        };
        messageType : "text" | "image";
        seen: Boolean;
        seenAt : Date;
        createdAt:Date;
        updatedAt:Date;
    }

    const schema = new Schema<Imessage>({
        chatId:{
            type:Schema.Types.ObjectId,
            ref:"Chat",
            required:true
        },
        sender:{
            type:String,
            required:true
        },
        text:String,
        image:{
            url:String,
            publicId:String,
        },

        messageType:{
            type:String,
            enum:['text',"image"],
            default:'text'
        },

        seen:{
            type:Boolean,
            default:false,
        },

        seenAt:{
            type:Date,
            default:null
        }
    },{
        timestamps:true
    })

    export const Messages = mongoose.model<Imessage>("Messages",schema)