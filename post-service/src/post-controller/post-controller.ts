import logger from "../utils/logger";
import { Post } from "../modals/post";
import { Request, Response } from "express";
import { validateCreatePOst } from "../utils/validation";
import { publishEvent } from "../utils/rabbitmq";


async function invlaidateCahce(req:Request,input:String){
    const cachedKey=`post:${input}`
    await req.redisClient.del(cachedKey)

    const keys= await req.redisClient.keys("posts:*");
    if(keys.length>0){
        await req.redisClient.del(keys)
    }
}
export const createPost=async(req:Request ,res:Response):Promise<void>=>{
    try{
        logger.info("hitting create post endpoint")
        const {content,mediaId}=req.body;
        console.log(req.body)

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


        await invlaidateCahce(req,newlyCreatedPost._id.toString());
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
             logger.info("cache hit")
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

export const getPost=async(req:Request,res:Response):Promise<void>=>{
    try{
        const postid=req.params.id as string
        const cacheKey=`post:${postid}`

        const cachedPost=await req.redisClient.get(cacheKey)
        if(cachedPost){
            res.json(JSON.parse(cachedPost))
            return
        }

        const singlePostDetail= await Post.findById(postid)
        if(!singlePostDetail){
            res.json({
                success:false,
                message:"false"
            })
            return
        }
        await req.redisClient.setex(cacheKey,36000,JSON.stringify(singlePostDetail))
        res.json(singlePostDetail)
    }
    catch(error){
        logger.error("Error creating post",error);
        res.json({
            success:false,
            message:"Error creating post"
        })
    }
}




export const deletPost=async(req:Request,res:Response)=>{
    try{
        const post =await Post.findOneAndDelete({
            _id:req.params.id,
            user:(req as any).user.userId
        })

        if(!post){
            res.status(404).json({
                message:"Post not found",
                success:false
            })
        }
        await invlaidateCahce(req,req.params.id)
        res.json({
            message:"post deleted success"
        })
         await publishEvent('post.deleted',{
            postId:post?._id.toString(),
            userId:(req as any).user.userId,
            mediaId:post?.mediaId
         })

    }
    //publish post envent
    catch(error){
        logger.error("Error creating post",error);
        res.json({
            success:false,
            message:"Error creating post"
        })
    }
}


