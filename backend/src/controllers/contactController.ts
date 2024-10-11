import { Request, Response } from "express";
import { db } from "../index";
import { User } from "../../User";

export const addContact = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "All contact fields are required" });
  }

  try {
    // Define User type
    interface User {
      contacts: string[];
      firstName: string;
      lastName: string;
      email: string;
      id: string;
    }

    // Check if the contact's email exists in the users database
    const usersRef = db.ref("users");
    const snapshot = await usersRef.once("value");
    let contactExists = false;
    let contactUserId: string | null = null;

    snapshot.forEach((childSnapshot) => {
      const userData = childSnapshot.val() as User;
      if (userData.email === email) {
        contactExists = true;
        contactUserId = childSnapshot.key; // get the userId of the contact
      }
    });

    if (!contactExists || !contactUserId) {
      return res.status(404).json({ message: "Contact user not found" });
    }

    // Get the current user's contacts
    const userRef = db.ref(`users/${userId}`);
    const userSnapshot = await userRef.once("value");
    const userData = userSnapshot.val() as User;

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the contact is already in the user's contact list
    const contacts = userData.contacts || [];
    if (contacts.includes(contactUserId)) {
      return res
        .status(400)
        .json({ message: "Contact is already in your contacts list" });
    }

    // Add update contact to user's data
    contacts.push(contactUserId);
    await userRef.update({ contacts });

    res
      .status(201)
      .json({ message: "Contact added successfully", name, contactUserId });
  } catch (error) {
    console.error("Error adding contact:", error);
    res.status(500).json({ message: "Failed to add contact" });
  }
};

export const getContacts = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const userRef = db.ref(`users/${userId}`);
    const userSnapshot = await userRef.once("value");
    const userData = userSnapshot.val() as User;

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    const contacts = userData.contacts || [];

    // Show contact details
    const contactDetails = await Promise.all(
      contacts.map(async (contactId) => {
        //console.log("Fetching details for contact ID: ", contactId);
        const contactRef = db.ref(`users/${contactId}`);
        const contactSnapshot = await contactRef.once("value");

        if (!contactSnapshot.exists()) {
          console.error(`Contact with ID ${contactId} does not exist`);
          throw new Error(`Contact with ID ${contactId} not found`);
        }

        const contactData = contactSnapshot.val();
        return {
          id: contactId,
          name: `${contactData.firstName} ${contactData.lastName}`,
          email: contactData.email,
        };
      })
    );

    res.status(200).json({ contacts: contactDetails });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ message: "Failed to fetch contacts" });
  }
};

export const deleteContact = async (req: Request, res: Response) => {
    const { userId, contactId } = req.params;

  try {
    const userRef = db.ref(`users/${userId}`);
    const userSnapshot = await userRef.once("value");
    const userData = userSnapshot.val() as User;

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    let contacts = userData.contacts || [];
    if (!contacts.includes(contactId)) {
      return res.status(404).json({ message: "Contact not found in user's contact list" });
    }

    // Delete the contact from user's contact list and update the list
    contacts = contacts.filter((id) => id !== contactId);
    await userRef.update({ contacts });

    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ message: "Failed to delete contact" });
  }
};
