
import express from "express";
import * as admin from "firebase-admin";
import dotenv from "dotenv";


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
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Encrypto-Chat");
});


app.post("/createUser", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const newUser = {firstName, lastName, email, password};

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
