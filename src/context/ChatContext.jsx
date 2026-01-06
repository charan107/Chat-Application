import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { db } from "../firebase/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getUserChats } from "../firebase/chats";
import { getMessages } from "../firebase/messages";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [typingUsers, setTypingUsers] = useState({}); // { chatId: [userId1, userId2] }

  // Fetch current user data from Firestore
  useEffect(() => {
    if (!user) {
      setCurrentUserData(null);
      setChats([]);
      setMessages({});
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setCurrentUserData({ id: userDoc.id, ...userDoc.data() });
        } else {
          console.warn("User document not found in Firestore");
          setCurrentUserData(null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setCurrentUserData(null);
      }
    };

    fetchUserData();
  }, [user]);

  // Real-time listener for user's chats
  useEffect(() => {
    if (!user) {
      setChats([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Query for chats where current user is a member
    const chatsQuery = query(
      collection(db, "chats"),
      where("members", "array-contains", user.uid)
    );

    // Set up real-time listener
    const unsubscribeChats = onSnapshot(
      chatsQuery,
      async (snapshot) => {
        const chatsData = [];
        
        for (const chatDoc of snapshot.docs) {
          const chatData = { id: chatDoc.id, ...chatDoc.data() };
          
          // Get the other member's info for display
          const otherMemberId = chatData.members.find((id) => id !== user.uid);
          if (otherMemberId) {
            try {
              const otherUserDoc = await getDoc(doc(db, "users", otherMemberId));
              if (otherUserDoc.exists()) {
                const otherUserData = otherUserDoc.data();
                chatData.name = otherUserData.displayName || otherUserData.fullName || "Unknown User";
                chatData.photoURL = otherUserData.photoURL || "";
                chatData.otherMemberId = otherMemberId;
              }
            } catch (error) {
              console.error("Error fetching other user data:", error);
              chatData.name = "Unknown User";
            }
          }

          // Format last message time
          if (chatData.lastMessageTime) {
            const time = chatData.lastMessageTime.toDate ? 
              chatData.lastMessageTime.toDate() : 
              new Date(chatData.lastMessageTime);
            const now = new Date();
            const diff = now - time;
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);

            if (minutes < 1) chatData.time = "Now";
            else if (minutes < 60) chatData.time = `${minutes}m ago`;
            else if (hours < 24) chatData.time = `${hours}h ago`;
            else if (days < 7) chatData.time = `${days}d ago`;
            else chatData.time = time.toLocaleDateString();
          } else {
            chatData.time = "";
          }

          chatsData.push(chatData);
        }

        // Sort by last message time (most recent first)
        chatsData.sort((a, b) => {
          const timeA = a.lastMessageTime?.toDate ? 
            a.lastMessageTime.toDate().getTime() : 
            (a.lastMessageTime || 0);
          const timeB = b.lastMessageTime?.toDate ? 
            b.lastMessageTime.toDate().getTime() : 
            (b.lastMessageTime || 0);
          return timeB - timeA;
        });

        setChats(chatsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to chats:", error);
        setChats([]);
        setLoading(false);
      }
    );

    return () => unsubscribeChats();
  }, [user]);

  // Real-time listener for messages of active chat
  useEffect(() => {
    if (!activeChat || !user) {
      setMessages({});
      return;
    }

    const messagesQuery = query(
      collection(db, `chats/${activeChat}/messages`),
      orderBy("createdAt", "asc")
    );

    const unsubscribeMessages = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messagesData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            text: data.text,
            type: data.senderId === user.uid ? "sent" : "received",
            senderId: data.senderId,
            createdAt: data.createdAt,
            status: data.status,
            ...data,
          };
        });

        setMessages((prev) => ({
          ...prev,
          [activeChat]: messagesData,
        }));

        // Mark messages as read when chat is active
        if (messagesData.length > 0 && user) {
          updateChatUnreadCount(activeChat, 0);
          // Mark received messages as read
          const unreadMessages = messagesData.filter(
            (msg) => msg.senderId !== user.uid && msg.status !== "read"
          );
          if (unreadMessages.length > 0) {
            import("../firebase/messages").then(({ markMessagesAsRead }) => {
              markMessagesAsRead(
                activeChat,
                unreadMessages.map((m) => m.id)
              ).catch(console.error);
            });
          }
        }
      },
      (error) => {
        console.error("Error listening to messages:", error);
      }
    );

    return () => unsubscribeMessages();
  }, [activeChat, user]);

  const updateChatUnreadCount = async (chatId, count) => {
    try {
      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, { unreadCount: count });
    } catch (error) {
      console.error("Error updating unread count:", error);
    }
  };

  const selectChat = (chatId) => {
    setActiveChat(chatId);
    if (chatId) {
      // Reset unread count when chat is selected
      updateChatUnreadCount(chatId, 0);
    }
  };

  const toggleFavourite = async (chatId) => {
    try {
      const chatRef = doc(db, "chats", chatId);
      const chatDoc = await getDoc(chatRef);
      if (chatDoc.exists()) {
        const currentFavourite = chatDoc.data().isFavourite || false;
        await updateDoc(chatRef, { isFavourite: !currentFavourite });
      }
    } catch (error) {
      console.error("Error toggling favourite:", error);
    }
  };

  const deleteChat = async (chatId) => {
    try {
      // Note: In a real app, you might want to soft delete or archive
      // For now, we'll just remove it from the user's view
      // You can implement actual deletion in Firestore if needed
      setActiveChat((prev) => (prev === chatId ? null : prev));
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const addMessage = async (chatId, message) => {
    if (!user || !chatId) return;
    
    try {
      // Import sendMessage dynamically to avoid circular dependency
      const { sendMessage } = await import("../firebase/messages");
      
      // Send message to Firebase
      await sendMessage(chatId, message, user.uid);
      
      // The real-time listener will automatically update the messages
      // Update chat's lastMessage
      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, {
        lastMessage: message.text || "",
        lastMessageTime: new Date(),
        lastMessageSenderId: user.uid,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  const deleteSelectedMessages = async (chatId, messageIds) => {
    if (!user || !chatId || !messageIds.length) return;
    
    try {
      const { deleteMessage } = await import("../firebase/messages");
      await Promise.all(
        messageIds.map((messageId) => deleteMessage(chatId, messageId))
      );
      // Real-time listener will update automatically
    } catch (error) {
      console.error("Error deleting messages:", error);
      throw error;
    }
  };

  const deleteMessage = async (chatId, messageId) => {
    if (!user || !chatId || !messageId) return;
    
    try {
      const { deleteMessage: deleteMessageFn } = await import("../firebase/messages");
      await deleteMessageFn(chatId, messageId);
      // Real-time listener will update automatically
    } catch (error) {
      console.error("Error deleting message:", error);
      throw error;
    }
  };

  const setTyping = async (chatId, isTyping) => {
    if (!user || !chatId) return;
    
    try {
      const chatRef = doc(db, "chats", chatId);
      const typingField = `typing.${user.uid}`;
      await updateDoc(chatRef, {
        [typingField]: isTyping ? serverTimestamp() : null,
      });
    } catch (error) {
      console.error("Error setting typing status:", error);
    }
  };

  const createChat = async (otherUserId) => {
    if (!user || !otherUserId) return null;
    
    try {
      const { createChat: createChatFn } = await import("../firebase/chats");
      const chatRef = await createChatFn([user.uid, otherUserId]);
      return chatRef.id;
    } catch (error) {
      console.error("Error creating chat:", error);
      throw error;
    }
  };

  // Listen to typing indicators
  useEffect(() => {
    if (!activeChat || !user) {
      setTypingUsers({});
      return;
    }

    const chatRef = doc(db, "chats", activeChat);
    const unsubscribe = onSnapshot(chatRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const chatData = docSnapshot.data();
        const typing = chatData.typing || {};
        const typingUserIds = Object.keys(typing).filter(
          (uid) => uid !== user.uid && typing[uid] !== null
        );
        setTypingUsers((prev) => ({
          ...prev,
          [activeChat]: typingUserIds,
        }));
      }
    });

    return () => unsubscribe();
  }, [activeChat, user]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        messages, // Full messages object for compatibility
        activeChat,
        selectChat,
        addMessage,
        deleteChat,
        deleteSelectedMessages,
        deleteMessage,
        toggleFavourite,
        createChat,
        setTyping,
        typingUsers: typingUsers[activeChat] || [],
        loading,
        currentUserData,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
