import express from "express";
import * as admin from "firebase-admin";
import dotenv from "dotenv";
import { User } from "../User";
import { v4 as uuidv4 } from "uuid";
import { fetchUser, passwordMatch } from "../utils";
import { stringify } from "querystring";

const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "chatencrypto@gmail.com",
    pass: "jtgjdwirnnulqsbz",
  },
});

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

app.post("/createUser", async (req, res) => {
  const { firstName, lastName, email, plainPassword } = req.body;

  if (!firstName || !lastName || !email || !plainPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

  const userId = uuidv4();
  const newUser = new User(firstName, lastName, email, hashedPassword, userId);

  try {
    const userRef = db.ref(`users/${userId}`);
    await userRef.set(newUser);
    res.status(201).json({ message: "User created successfully", userId });
  } catch (error) {
    console.error("Error adding document", error);
    res.status(500).json({ message: "Failed to create user" });
  }
});

app.post("/login", async (req, res) => {
  const { email, plainPassword } = req.body;

  if (!email || !plainPassword) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Define the User type
    interface User {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      id: string;
    }

    // Find the user by email
    const usersRef = db.ref("users");
    const snapshot = await usersRef.once("value");
    let user: User | undefined;

    snapshot.forEach((childSnapshot) => {
      const userData = childSnapshot.val() as User;
      if (userData.email === email) {
        user = userData;
      }
    });

    // Ensure user is defined before proceeding
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(plainPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // If successful, respond with a success message or token
    res.status(200).json({ message: "Login successful", userId: user.id });
  } catch (error) {
    console.error("Error logging in", error);
    res.status(500).json({ message: "Failed to log in" });
  }
});

// Endpoint to enable two-way authentication
app.post("/enable-2fa", async (req, res) => {
  const { userId } = req.body;

  try {
    // Fetch the user asynchronously
    const user = await fetchUser(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Generate a secret key for the user
    user.secret = Math.floor(Math.random() * 899999 + 100000);
    console.log(user.secret);

    // Update the secret on the db so that it can be verified in the verify-2fa function
    await db.ref(`users/${userId}`).update({ secret: user.secret });

    //Need to build in a way to save this secret key to the database

    const mailOptions = {
      from: "chatencrypto@gmail.com",
      to: user.email,
      subject: `Your two-factor authenication pass-key is ${user.secret} `,
      text: "This email is sent from Encrypto Chat",
    };

    transporter.sendMail(mailOptions, (error: any, info: { response: any }) => {
      if (error) {
        console.error("Error sending email: ", error);
      } else {
        console.log("Email sent: ", info.response);
        res.status(200).send("2FA code sent");
      }
    });
  } catch (error) {
    console.error("Error enabling 2FA:", error);
    res.status(500).send("Failed to enable 2FA");
  }
});

app.post("/verify-2fa", async (req, res) => {
  const { userId, secretAttempt } = req.body;

  if (!secretAttempt) {
    return res.status(400).json({ message: "Please provide your secure code" });
  }

  try {
    const user = await fetchUser(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    const isMatch = passwordMatch(secretAttempt, user.secret);

    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect key" });
    }

    res
      .status(200)
      .json({ message: "Verification successful", userId: user.id });
  } catch (error) {
    console.error("Error verifying 2FA:", error);
    res.status(500).send("Failed to verify 2FA");
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

// Contacts
// Add contact
app.post("/addContact/:userId", async (req, res) => {
  const { userId } = req.params;
  const { name, phone, email } = req.body;

  if (!name || !phone || !email) {
    return res.status(400).json({ message: "All contact fields are required" });
  }

  try {
    const contactId = uuidv4();
    const contactRef = db.ref(`users/${userId}/contacts/${contactId}`);
    await contactRef.set({ contactId, name, phone, email });
    res.status(201).json({ message: "Contact added successfully", contactId });
  } catch (error) {
    console.error("Error adding contact:", error);
    res.status(500).json({ message: "Failed to add contact" });
  }
});

// Retrieved Contact
app.get("/getContact/:userId/:contactId", async (req, res) => {
  const { userId, contactId } = req.params;

  try {
    const userRef = db.ref(`users/${userId}/contacts/${contactId}`);

    userRef.once("value", (snapshot) => {
      if (snapshot.exists()) {
        res.status(200).json(snapshot.val());
      } else {
        res.status(404).json({ message: "Contact not found" });
      }
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Failed to retrieve contact data" });
  }
});

// Edit contact
app.put("/editContact/:userId/:contactId", async (req, res) => {
  const { userId, contactId } = req.params;
  const { name, phone, email } = req.body;

  if (!name || !phone || !email) {
    return res.status(400).json({ message: "All contact fields are required" });
  }

  try {
    const contactRef = db.ref(`users/${userId}/contacts/${contactId}`);
    await contactRef.update({ name, phone, email });
    res.status(200).json({ message: "Contact updated successfully" });
  } catch (error) {
    console.error("Error updating contact:", error);
    res.status(500).json({ message: "Failed to update contact" });
  }
});

// Delete contact
app.delete("/deleteContact/:userId/:contactId", async (req, res) => {
  const { userId, contactId } = req.params;

  try {
    const contactRef = db.ref(`users/${userId}/contacts/${contactId}`);
    await contactRef.remove();
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ message: "Failed to delete contact" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
