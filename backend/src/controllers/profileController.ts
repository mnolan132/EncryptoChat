import { Request, Response } from "express";
import { db } from "../index";
import bcrypt from "bcrypt";


// User type definition
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contacts: string[];
  profilePicture?: string;
}

export const updateUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  console.log("User ID:", userId); // Log the userId to confirm
  
  const { firstName, lastName, email, plainPassword } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const userRef = db.ref(`users/${userId}`);
    const snapshot = await userRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "User not found" });
    }

    const updates: Partial<User> = {};

    if (firstName) {updates.firstName = firstName;}
    if (lastName) {updates.lastName = lastName;}
    if (email) {updates.email = email;}

    if (plainPassword) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
      updates.password = hashedPassword;
    }

    await userRef.update(updates);
    res.status(200).json({ message: "User updated successfully", updates });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
};
