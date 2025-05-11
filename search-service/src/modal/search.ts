import mongoose from "mongoose";


const SearchSchema=new mongoose.Schema({
    postId:{
        type:String,
        required:true,
        unique:true
    },
    userId:{
        type:String,
        required:true,
        unique:true 
    },
    content:{
        type:String,
        required:true,
        unique:true
    }
},{
    timestamps:true
})

SearchSchema.index({content:"text"});
SearchSchema.index({createdAt:-1});

export const Search=mongoose.model("SearchPost",SearchSchema)