import { db } from "./src/index";
import { User } from "./User";

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
