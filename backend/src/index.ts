import express from "express";
import * as admin from "firebase-admin";
import dotenv from "dotenv";
import { User } from "../User";
import { v4 as uuidv4 } from "uuid";
import { fetchUser, passwordMatch } from "../utils";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import { stringify } from "querystring";
import { snapshot } from "node:test";

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

// Routes
app.use("/users", userRoutes);
app.use("/auth", authRoutes);

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

// Contacts
// Add contact
app.post("/addContact/:userId", async (req, res) => {
  const { userId } = req.params;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "All contact fields are required" });
  }

  try {
    // Check if the contact's email exists in the users database || NOTE: need to change email to unique username
    const usersRef = db.ref("users");
    const snapshot = await usersRef.once("value");
    let contactExists = false;
    let contactUserId = null;

    snapshot.forEach((childSnapshot) => {
      const userData = childSnapshot.val();
      if (userData.email === email) {
        contactExists = true;
        contactUserId = childSnapshot.key; // get the userId of the contact
      }
    });

    if (!contactExists) {
      return res.status(404).json({ message: "Contact user not found" });
    }

    // If the contact exists, add them to the current user's contact list
    const contactId = uuidv4();
    const contactRef = db.ref(`users/${userId}/contacts/${contactId}`);
    await contactRef.set({ contactId, name, email, contactUserId });
    res.status(201).json({ message: "Contact added successfully", contactId });
  } catch (error) {
    console.error("Error adding contact:", error);
    res.status(500).json({ message: "Failed to add contact" });
  }
});

// Shows all the contacts added by the specific user
app.get("/getContacts/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const contactsRef = db.ref(`users/${userId}/contacts`);

    contactsRef.once("value", (snapshot) => {
      if (snapshot.exists()) {
        const contacts = snapshot.val();
        res.status(200).json(contacts);
      } else {
        res.status(404).json({ message: "No contacts found for this user" });
      }
    });
  } catch (error) {
    console.error("Error fetching contacts", error);
    res.status(500).json({ message: "Failed to retrieve contacts" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
