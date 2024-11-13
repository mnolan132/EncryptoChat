import express from "express";
import * as admin from "firebase-admin";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import contactRoutes from "./routes/contactRoutes";
import messageRoutes from "./routes/messageRoutes";
import profileRoutes from "./routes/profileRoutes";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH!);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
});

export const db = admin.database();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allow multiple origins (local and deployed frontend)
const allowedOrigins = [
  "http://localhost:5173",
  "https://encrypto-chat.netlify.app",
  "https://encrypto-chat-theta.vercel.app",
];

// CORS Middleware
app.use(cors());

// Explicitly handle preflight OPTIONS request
app.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.sendStatus(204); // Send 204 for preflight requests
});

// Routes
app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.use("/contacts", contactRoutes);
app.use("/message", messageRoutes);
app.use("/profile", profileRoutes);

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
