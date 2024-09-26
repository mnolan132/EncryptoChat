import express from "express";
import * as admin from "firebase-admin";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import contactRoutes from "./routes/contactRoutes";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
});

export const db = admin.database(); // changed to real-time database

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({ origin: "http://localhost:5173" }));

// Routes
app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.use("/contacts", contactRoutes);

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

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
