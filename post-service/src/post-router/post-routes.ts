import { Router, Request, Response, Handler, RequestHandler } from "express";
import { createPost,getAllPost} from "../post-controller/post-controller";
import { authenticateRequest } from "../middleware/authMiddleware";

const router = Router();

// Middleware works fine because we use `req as AuthReq` inside the middleware itself
// router.use(authenticateRequest as RequestHandler)


router.post("/create-post",createPost)
router.get("/getallpost",getAllPost)

export default router;  