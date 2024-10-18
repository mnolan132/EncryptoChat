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
        const userData = snapshot.val();

        // Destructure the fields you want to include
        const { email, firstName, lastName, id, contacts } = userData;

        // Send only the selected fields
        res.status(200).json({ email, firstName, lastName, id, contacts });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Failed to retrieve user data" });
  }
};

// export const updateUser = async (req: Request, res: Response) => {
//   console.log("Update route hit!"); // Add this log

//   const { userId } = req.params;
//   console.log("User ID:", userId); // Log the userId to confirm

//   //const { userId } = req.params;
//   const { firstName, lastName, email, plainPassword } = req.body;

//   if (!userId) {
//     return res.status(400).json({ message: "User ID is required" });
//   }

//   try {
//     const userRef = db.ref(`users/${userId}`);
//     const snapshot = await userRef.once("value");

//     if (!snapshot.exists()) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const updates: Partial<User> = {};

//     if (firstName) updates.firstName = firstName;
//     if (lastName) updates.lastName = lastName;
//     if (email) updates.email = email;

//     if (plainPassword) {
//       const saltRounds = 10;
//       const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
//       updates.password = hashedPassword;
//     }

//     await userRef.update(updates);
//     res.status(200).json({ message: "User updated successfully", updates });
//   } catch (error) {
//     console.error("Error updating user:", error);
//     res.status(500).json({ message: "Failed to update user" });
//   }
// };