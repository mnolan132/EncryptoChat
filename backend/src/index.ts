import express from "express";
import * as admin from "firebase-admin";
import dotenv from "dotenv";
import { User } from "../User";
const { collection, addDoc } = require("firebase/firestore");

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
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const newUser = new User(firstName, lastName, email, password);

  try {
    const docRef = await addDoc(collection(db, "users"), newUser);
    res
      .status(201)
      .json({ message: "User created successfully", userId: docRef.id });
  } catch (error) {
    console.error("Error adding document", error);
    res.status(500).json({ message: "Failed to create user" });
  }
});
