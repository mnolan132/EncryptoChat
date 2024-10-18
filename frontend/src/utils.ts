export const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const day = date.getDate().toString().padStart(2, "0"); // Ensure it's two digits
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-indexed
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes} ${day}/${month}`;
};
