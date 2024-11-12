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

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or server-side requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies to be sent
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS", // Allow these HTTP methods
    allowedHeaders: "Content-Type,Authorization", // Allow these headers
  })
);

app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
  );
  res.sendStatus(200);
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
