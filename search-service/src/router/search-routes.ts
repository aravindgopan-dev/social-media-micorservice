import { searchPostController } from "../controller/serach-controller";
import { Router } from "express";
import { authenticateRequest } from "../middleware/authMiddleware";


const router=Router()


router.get("/",searchPostController)

export default router