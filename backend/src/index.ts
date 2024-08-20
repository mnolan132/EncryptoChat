
import express from "express";
import * as admin from "firebase-admin";
import dotenv from "dotenv";
import { User } from "../User";
const { collection, addDoc } = require("firebase/firestore");

const bcrypt = require("bcrypt");
const saltrounds = 10;

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

var serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
});

const db = admin.database();

// Middleware
// app.use(express.json());

app.get("/", (req, res) => {
  res.send("Encrypto-Chat");
});

app.listen(port, () => {
  console.log(`Server is running http://localhost:${port}`);
});

app.post("/createUser", async (req, res) => {
  const { firstName, lastName, email, plainPassword } = req.body;

  if (!firstName || !lastName || !email || !plainPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  async function createUser(
    firstName: string,
    lastName: string,
    email: string,
    plainPassword: string
  ) {
    const saltRounds = 10;
    const password = await bcrypt.hash(plainPassword, saltRounds);
    const newUser: User = new User(firstName, lastName, email, password);
    return newUser;
  }

  try {
    const docRef = await addDoc(collection(db, "users"), createUser);
    res
      .status(201)
      .json({ message: "User created successfully", userId: docRef.id });
  } catch (error) {
    console.error("Error adding document", error);
    res.status(500).json({ message: "Failed to create user" });
  }
});
