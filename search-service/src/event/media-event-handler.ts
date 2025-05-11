
import { Search } from "../modal/search";
import logger from "../utils/logger";


const handlePostCreated=async(event:any)=>{
    
    const{       postId,useId,content,createdAt}=event
    try{
        const newSeachPost=new Search({
            postId:postId,
            userId:useId,
            content:content,
            createdAt:createdAt
        })

        await newSeachPost.save()
       
        logger.info(`serach post created : ${postId}`)

    }
    catch(e){
        logger.info("error while while media deletion");
    }
}

export {handlePostCreated}