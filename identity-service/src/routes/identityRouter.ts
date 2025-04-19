import { registerUser,loginUser,logoutUser,refreshTokenUser } from "../controllers/identityController";
import { Router } from "express";

const router = Router();

router.post("/register", registerUser);
router.post("/login",loginUser)
router.post("/logout",logoutUser)
router.post("/refresh",refreshTokenUser)

export default router;
