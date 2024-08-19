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
// app.use(express.json());

app.get("/", (req, res) => {
  res.send("Encrypto-Chat");
});

app.listen(port, () => {
  console.log(`Server is running http://localhost:${port}`);
});
