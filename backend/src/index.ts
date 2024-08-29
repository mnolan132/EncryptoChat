
import express from "express";
import * as admin from "firebase-admin";
import dotenv from "dotenv";


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

app.get("/", (req, res) => {
  res.send("Encrypto-Chat");
});


app.get("/testRealtimeDB", async (req, res) => {
  try {
    const testDocRef = db.ref("test").push();  // Create a new document in the Realtime Database
    await testDocRef.set({ test: "test" });
    res.status(200).json({ message: "Test document created", id: testDocRef.key });
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

  const newUser = {firstName, lastName, email, plainPassword,};

  try {
    const userId = Date.now().toString();
    const userRef = db.ref(`users/${userId}`);
    await userRef.set(newUser);
    res.status(201).json({ message: "User created successfully", userId });
  } catch (error) {
    console.error("Error adding document", error);
    res.status(500).json({ message: "Failed to create user" });
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
