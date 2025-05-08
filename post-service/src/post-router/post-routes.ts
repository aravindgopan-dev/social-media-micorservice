import { Router, Request, Response, Handler, RequestHandler } from "express";
import { createPost,getAllPost,getPost,deletPost} from "../post-controller/post-controller";
const router = Router();

// Middleware works fine because we use `req as AuthReq` inside the middleware itself
// router.use(authenticateRequest as RequestHandler)


router.post("/create-post",createPost)
router.get("/getallpost",getAllPost)
router.get("/:id",getPost)
router.delete("/:id",deletPost)

export default router;  