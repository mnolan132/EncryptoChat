import { Request, Response } from "express";
import { db } from "../index";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { User } from "../../User";

export const createUser = async (req: Request, res: Response) => {
  const { firstName, lastName, email, plainPassword } = req.body;

  if (!firstName || !lastName || !email || !plainPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

  const userId = uuidv4();
  const newUser = new User(firstName, lastName, email, hashedPassword, userId);

  try {
    const userRef = db.ref(`users/${userId}`);
    await userRef.set(newUser);
    res.status(201).json({ message: "User created successfully", userId });
  } catch (error) {
    console.error("Error adding document", error);
    res.status(500).json({ message: "Failed to create user" });
  }
};

export const getUser = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const userRef = db.ref(`users/${userId}`);

    userRef.once("value", (snapshot) => {
      if (snapshot.exists()) {
        res.status(200).json(snapshot.val());
      } else {
        res.status(404).json({ message: "User not found" });
      }
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Failed to retrieve user data" });
  }
};
