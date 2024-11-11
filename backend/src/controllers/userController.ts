import { Request, Response } from "express";
import { db } from "../index";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { User } from "../../User";
import crypto from "crypto";
import { sendWelcomeMessage } from "./messageController";

export const createUser = async (req: Request, res: Response) => {
  const { firstName, lastName, email, plainPassword } = req.body;

  if (!firstName || !lastName || !email || !plainPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if a user with the same email already exists
    const usersRef = db.ref("users");
    const snapshot = await usersRef
      .orderByChild("email")
      .equalTo(email)
      .once("value");

    if (snapshot.exists()) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    const userId = uuidv4();

    // Generate RSA key pair for encryption
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });

    // Create a new User instance with the encryption keys
    const newUser = new User(
      firstName,
      lastName,
      email,
      hashedPassword,
      userId,
      publicKey,
      privateKey
    );

    const userRef = db.ref(`users/${userId}`);
    await userRef.set(newUser);
    res.status(201).json({ message: "User created successfully", userId });

    // Optionally send a welcome message
    await sendWelcomeMessage(userId);
  } catch (error) {
    console.error("Error creating user:", error);
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

        const { email, firstName, lastName, id, contacts } = userData;

        res.status(200).json({
          email,
          firstName,
          lastName,
          id,
          contacts,
        });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Failed to retrieve user data" });
  }
};

export const deleteUserByEmail = async (req: Request, res: Response) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Search for the user by email in the Firebase database
    const usersRef = db.ref("users");

    // Retrieve all users
    const snapshot = await usersRef.once("value");

    let userId: string | null = null;

    // Iterate through users to find the one with the matching email
    snapshot.forEach((childSnapshot) => {
      const user = childSnapshot.val();
      if (user.email === email) {
        userId = childSnapshot.key; // Get user ID
        return true; // Exit loop early once user is found
      }
    });

    if (!userId) {
      return res
        .status(404)
        .json({ message: `No user found with email: ${email}` });
    }

    // If user is found, delete the user by ID
    await db.ref(`users/${userId}`).remove();

    return res
      .status(200)
      .json({ message: `User with email ${email} deleted successfully` });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Failed to delete user" });
  }
};
