import { Router } from "express";
import { getUser, createUser } from "../controllers/userController";

const router = Router();

router.post("/createUser", createUser);
router.get("/:userId", getUser);

export default router;
