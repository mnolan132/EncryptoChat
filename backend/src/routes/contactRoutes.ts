import { Router } from "express";
import {
  addContact,
  getContacts,
  //   deleteContact,
} from "../controllers/contactController";

const router = Router();

router.post("/addContact/:userId", addContact);
router.get("/getContacts/:userId", getContacts);
// router.delete("/deleteContact/:userId/:contactId", deleteContact);

export default router;
