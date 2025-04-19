import logger from "../utils/logger";
import { Post } from "../modals/post";
import { Handler, json, Request, RequestHandler, Response } from "express";
import { validateCreatePOst } from "../utils/validation";
import { error, log } from "winston";


export const createPost=async(req:Request ,res:Response):Promise<void>=>{
    try{
        logger.info("hitting create post endpoint")
        const {content,mediaId}=req.body;

        const {error}=validateCreatePOst(req.body)
        if (error) {
            logger.warn("Validation error", error.details[0].message);
            res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        return;
         }
        console.log(content)
        const userId= (req as any).user.userId
        const newlyCreatedPost= new Post({
           user:userId,
           content,
           mediaId:mediaId ||[]
        })


        await newlyCreatedPost.save()
        logger.info("post created successfully")
        res.status(201).json({
            success:true,
            message:"post created sucess"
        })
        return

    }
    catch(error){
        logger.error("Error creating post",error);
        res.json({
            success:false,
            message:"Error creating post"
        })
        return
    }
}



export const getAllPost = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const startIndex = (page - 1) * limit;

        const cacheKey = `post:${page}:${limit}`;
        const cachedPost = await req.redisClient.get(cacheKey);
        if (cachedPost) {
         
             res.json(JSON.parse(cachedPost));
             return
        }

        const posts = await Post.find({})
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        const total = await Post.countDocuments();
        const result = {
            posts,
            currentPage: page,
            totalPage: Math.ceil(total / limit),
            totalPost: total,
        };

        await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));
        res.json(result);
        return
    } catch (error) {
        logger.error("Error fetching posts", error);
        res.status(500).json({
            success: false,
            message: "Error fetching posts",
        });
        return
    }
};

const getPost=async(req:Request,res:Response)=>{
    try{

    }
    catch(error){
        logger.error("Error creating post",error);
        res.json({
            success:false,
            message:"Error creating post"
        })
    }
}




const deletPost=async(req:Request,res:Response)=>{
    try{

    }
    catch(error){
        logger.error("Error creating post",error);
        res.json({
            success:false,
            message:"Error creating post"
        })
    }
}


