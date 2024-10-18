import express from "express";
import { getUser } from "../controllers/userController";
import { updateUser } from "../controllers/profileController";

const router = express.Router();

router.get("/user/:userId", getUser);
router.put("/user/:userId", updateUser);

export default router;
