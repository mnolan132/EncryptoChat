import express from "express";
import * as admin from "firebase-admin";
import dotenv from "dotenv";
import { User } from "../User";

const bcrypt = require("bcrypt");

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
});

const db = admin.firestore();

app.use(express.json());

// Firestore write operation test wrapped in an async function
async function testFirestoreWrite() {
  try {
    const testDoc = await db.collection("users").add({
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
    });
    console.log("Document written with ID: ", testDoc.id);
  } catch (error) {
    console.error("Error adding document: ", error);
  }
}

// // Call the function
testFirestoreWrite();

app.get("/", (req, res) => {
  res.send("Encrypto-Chat");
});

app.listen(port, () => {
  console.log(`Server is running http://localhost:${port}`);
});

app.get("/testFirestore", async (req, res) => {
  try {
    const testDocRef = await db.collection("test").add({ test: "test" });
    res
      .status(200)
      .json({ message: "Test document created", id: testDocRef.id });
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

  try {
    // Hash the plain password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Create a new User instance
    const newUser = new User(firstName, lastName, email, hashedPassword);

    // Convert the User instance to a plain object
    const newUserObject = newUser.toPlainObject();

    // Add the plain object to Firestore
    const docRef = await db.collection("users").add(newUserObject);

    // Respond with success
    res
      .status(201)
      .json({ message: "User created successfully", userId: docRef.id });
  } catch (error) {
    console.error("Error adding document", error);
    res.status(500).json({ message: "Failed to create user" });
  }
});
