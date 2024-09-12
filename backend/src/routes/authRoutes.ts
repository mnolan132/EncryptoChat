import { Router } from "express";
import { login, enable2FA, verify2FA } from "../controllers/authController";

const router = Router();

router.post("/login", login);
router.post("/enable-2fa", enable2FA);
router.post("/verify-2fa", verify2FA);

export default router;
