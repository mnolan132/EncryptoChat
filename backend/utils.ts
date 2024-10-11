import { db } from "./src/index";
import { User } from "./User";
import dotenv from "dotenv";

const nodemailer = require("nodemailer");

dotenv.config();

export const fetchUser = (userId: string): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    try {
      const userRef = db.ref(`users/${userId}`);

      userRef.once("value", (snapshot) => {
        if (snapshot.exists()) {
          resolve(snapshot.val());
        } else {
          resolve(null); // User not found
        }
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      reject(new Error("Failed to retrieve user data"));
    }
  });
};

export const getUserIdFromEmail = async (
  email: string
): Promise<string | null> => {
  try {
    // Get a reference to the users node in the database
    const usersRef = db.ref("users");

    // Retrieve all users
    const snapshot = await usersRef.once("value");

    // Iterate through each user to find the one with the matching email
    let userId = null;
    snapshot.forEach((childSnapshot) => {
      const user = childSnapshot.val();

      if (user.email === email) {
        userId = childSnapshot.key;
        return true; // Exit the loop early when a match is found
      }
    });

    return userId;
  } catch (error) {
    console.error("Error retrieving user ID from email:", error);
    return null;
  }
};

// This funciton takes in a string and a number, converts the number into a string and then compares the two values to return either true or false
export const passwordMatch = (passwordAttempt: string, secret: number) => {
  const secretString = JSON.stringify(secret);
  if (passwordAttempt === secretString) {
    return true;
  } else {
    return false;
  }
};

export const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "chatencrypto@gmail.com",
    pass: process.env.GMAIL_PASS,
  },
});

export const getConversationId = (senderId: string, recipientId: string) => {
  return [senderId, recipientId].sort().join("_");
};
