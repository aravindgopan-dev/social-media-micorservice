import mongoose, {Document } from 'mongoose'



interface MediaInterface extends Document{
    publicId:string;
    mimeType:string;
    url:string;
    userId:mongoose.Schema.Types.ObjectId
}


const mediaSchema=new mongoose.Schema({
    publicId:{
        type:String,
        required:true
    },
    mimeType:{
        type:String,
        required:true
    },
    url:{
        type:String,
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},{
    timestamps:true
})

export const Media=mongoose.model<MediaInterface>("Media",mediaSchema)