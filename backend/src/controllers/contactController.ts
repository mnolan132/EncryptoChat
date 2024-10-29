import { Request, Response } from "express";
import { db } from "../index";
import { User } from "../../User";


export const addContact = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { firstName, lastName, email } = req.body;

  if (!firstName || !lastName || !email) {
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
        contactUserId = childSnapshot.key; // Get the userId of the contact
      }
    });

    if (!contactExists || !contactUserId) {
      return res.status(404).json({ message: "Contact user not found" });
    }

    // Fetch both users' data
    const [userSnapshot, contactSnapshot] = await Promise.all([
      db.ref(`users/${userId}`).once("value"),
      db.ref(`users/${contactUserId}`).once("value"),
    ]);

    const userData = userSnapshot.val() as User;
    const contactData = contactSnapshot.val() as User;

    if (!userData || !contactData) {
      return res.status(404).json({ message: "User or contact not found" });
    }

    const userContacts = userData.contacts || [];
    const contactContacts = contactData.contacts || [];

    // Check if the contact is already in either user's contact list
    if (userContacts.includes(contactUserId)) {
      return res
        .status(400)
        .json({ message: "Contact is already in your contacts list" });
    }

    // Add contact to both users' contact lists
    userContacts.push(contactUserId);
    contactContacts.push(userId);

    await Promise.all([
      db.ref(`users/${userId}`).update({ contacts: userContacts }),
      db.ref(`users/${contactUserId}`).update({ contacts: contactContacts }),
    ]);

    res.status(201).json({
      message: "Contact added successfully for both users",
      firstName,
      contactUserId,
    });
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
          firstName: contactData.firstName,
          lastName: contactData.lastName,
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
