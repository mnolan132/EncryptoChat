import { Router } from "express";
import {
  getUser,
  createUser,
  deleteUserByEmail,
} from "../controllers/userController";

const router = Router();

router.post("/createUser", createUser);
router.get("/:userId", getUser);
router.delete("/:email", deleteUserByEmail);

export default router;
