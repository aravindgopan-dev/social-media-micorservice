import { Request,Response,NextFunction } from "express"
import logger from "../utils/logger"
import { Search } from "../modal/search";

export const searchPostController=async(req:Request,res:Response):Promise<void>=>{
    logger.info("hitting search endpoint");
    try{
        const {query}=req.body;
        const resultes=await Search.find({
            $text:{$search:query}
        },{
            score:{$meta:"textScore"}
        }
    
    ).sort({score:{$meta:"textScore"}}).limit(10);

    res.json({
        result:resultes
    })

    }
    catch(error){
        logger.error("Error while searching post", error);
            res.status(500).json({
            success: false,
            message: "Error while searching post",
            });
    }
}
