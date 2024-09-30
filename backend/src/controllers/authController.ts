import { Request, Response } from "express";
import { db } from "../index";
import bcrypt from "bcrypt";
import { transporter, fetchUser } from "../../utils";
import { passwordMatch } from "../../utils";

export const login = async (req: Request, res: Response) => {
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
};

export const enable2FA = async (req: Request, res: Response) => {
  const { userId } = req.body;

  try {
    // Fetch the user asynchronously
    const user = await fetchUser(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a secret key for the user
    user.secret = Math.floor(Math.random() * 899999 + 100000);
    console.log(user.secret);

    // Update the secret on the db so that it can be verified in the verify-2fa function
    await db.ref(`users/${userId}`).update({ secret: user.secret });

    const mailOptions = {
      from: "chatencrypto@gmail.com",
      to: user.email,
      subject: `Your two-factor authentication pass-key is ${user.secret}`,
      text: "This email is sent from Encrypto Chat",
    };

    transporter.sendMail(mailOptions, (error: any, info: { response: any }) => {
      if (error) {
        console.error("Error sending email: ", error);
        return res.status(500).json({ message: "Error sending 2FA code" });
      } else {
        console.log("Email sent: ", info.response);
        return res.status(200).json({ message: "2FA code sent" });
      }
    });
  } catch (error) {
    console.error("Error enabling 2FA:", error);
    res.status(500).json({ message: "Failed to enable 2FA" });
  }
};

export const verify2FA = async (req: Request, res: Response) => {
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
};
