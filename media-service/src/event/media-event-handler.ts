import { deleteMediaFromCloudinary } from "../utils/cloudinary";
import { Media } from "../modals/media";
import logger from "../utils/logger";


const handlePostDeleted=async(event:any)=>{
    
    const{ postId,userId,mediaId}=event;
    try{
        console.log(event,"inside handle post deleted")
        const mediToDelete=await Media.find({_id:mediaId})
        for(const media of mediToDelete){
            console.log(media._id)
            await deleteMediaFromCloudinary(media.publicId)
            await Media.findByIdAndDelete(media._id);

            logger.info(`deleted media ${media._id} associated with ${postId}`)
        }
        logger.info(`processed the deletion for post id ${postId}`)
    }
    catch(e){
        logger.info("error while while media deletion");
    }
}

export {handlePostDeleted}