import express from "express";
import * as admin from "firebase-admin";
import dotenv from "dotenv";
import { User } from "../User";
import { v4 as uuidv4 } from "uuid";

const bcrypt = require("bcrypt");

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
});

const db = admin.database(); // changed to real-time database

app.use(express.json());
console.log("hello world");

app.get("/", (req, res) => {
  res.send("Encrypto-Chat");
});

app.get("/testRealtimeDB", async (req, res) => {
  try {
    const testDocRef = db.ref("test").push(); // Create a new document in the Realtime Database
    await testDocRef.set({ test: "test" });
    res
      .status(200)
      .json({ message: "Test document created", id: testDocRef.key });
  } catch (error) {
    console.error("Error creating test document: ", error);
    res.status(500).json({ message: "Failed to create test document" });
  }
});

app.post("/createUser", async (req, res) => {
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
});

app.post("/login", async (req, res) => {
  const { email, plainPassword } = req.body;

  if (!email || !plainPassword) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Define the User type
    interface User {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      id: string;
    }

    // Find the user by email
    const usersRef = db.ref("users");
    const snapshot = await usersRef.once("value");
    let user: User | undefined;

    snapshot.forEach((childSnapshot) => {
      const userData = childSnapshot.val() as User;
      if (userData.email === email) {
        user = userData;
      }
    });

    // Ensure user is defined before proceeding
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(plainPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // If successful, respond with a success message or token
    res.status(200).json({ message: "Login successful", userId: user.id });
  } catch (error) {
    console.error("Error logging in", error);
    res.status(500).json({ message: "Failed to log in" });
  }
});

app.get("/getUser/:userId", async (req, res) => {
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
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
