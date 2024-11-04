export const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const day = date.getDate().toString().padStart(2, "0"); // Ensure it's two digits
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-indexed
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes} ${day}/${month}`;
};

//This function ensures the first letters are capatalised
export const capataliseFirstLetter = (value: string) => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isStrongPassword = (password: string) => {
  // Criteria for a strong password:
  const minLength = 8; // Minimum length of 8 characters
  const hasUpperCase = /[A-Z]/.test(password); // At least one uppercase letter
  const hasLowerCase = /[a-z]/.test(password); // At least one lowercase letter
  const hasNumber = /\d/.test(password); // At least one digit
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password); // At least one special character

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber &&
    hasSpecialChar
  );
};
