import mongoose, { Document } from "mongoose";

export  interface postInterface extends Document{
    user:string;
    content:string;
    mediaId:[string];
    createdAt:Date;
    _id:string
}


const postSchema= new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    content:{
        type:String,
        required:true,
    },
    mediaId:[{
        type:String
    }],
    createdAt:{
        type:Date,
        default:Date.now
    }
},
{
    timestamps:true
})

postSchema.index({
    content:"text"
})

export const Post=mongoose.model<postInterface>("Post",postSchema)