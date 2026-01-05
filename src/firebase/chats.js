import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";

export const createChat = async (members) => {
  const ref = collection(db, "chats");
  const chatDoc = await addDoc(ref, {
    members,
    createdAt: serverTimestamp(),
    lastMessage: "",
    lastMessageTime: null,
    lastMessageSenderId: null,
    unreadCount: 0,
    isFavourite: false,
  });

  // Note: We don't update chatIds in user documents
  // Chats are queried directly using where("members", "array-contains", userId)
  // This is more efficient and avoids data duplication
  
  return chatDoc;
};

export const getUserChats = async (userId) => {
  const q = query(
    collection(db, "chats"),
    where("members", "array-contains", userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};
