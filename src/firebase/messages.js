import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

export const sendMessage = async (chatId, message, senderId) => {
  return addDoc(collection(db, `chats/${chatId}/messages`), {
    text: message.text || message,
    type: message.type || "sent",
    senderId: senderId,
    createdAt: serverTimestamp(),
    status: "sent", // sent, delivered, read
    ...message, // Allow additional fields
  });
};

export const getMessages = async (chatId) => {
  const q = query(
    collection(db, `chats/${chatId}/messages`),
    orderBy("createdAt", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};
