import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export const sendMessage = async (chatId, message, senderId) => {
  return addDoc(collection(db, `chats/${chatId}/messages`), {
    text: message.text || message,
    type: message.type || "sent",
    senderId: senderId,
    createdAt: serverTimestamp(),
    status: "sent", // sent, delivered, read
    imageURL: message.imageURL || null,
    fileURL: message.fileURL || null,
    fileName: message.fileName || null,
    fileType: message.fileType || null,
    ...message, // Allow additional fields
  });
};

export const deleteMessage = async (chatId, messageId) => {
  const messageRef = doc(db, `chats/${chatId}/messages`, messageId);
  await deleteDoc(messageRef);
};

export const updateMessageStatus = async (chatId, messageId, status) => {
  const messageRef = doc(db, `chats/${chatId}/messages`, messageId);
  await updateDoc(messageRef, { status });
};

export const markMessagesAsRead = async (chatId, messageIds) => {
  const batch = messageIds.map((messageId) => {
    const messageRef = doc(db, `chats/${chatId}/messages`, messageId);
    return updateDoc(messageRef, { status: "read" });
  });
  await Promise.all(batch);
};

export const getMessages = async (chatId) => {
  const q = query(
    collection(db, `chats/${chatId}/messages`),
    orderBy("createdAt", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};
