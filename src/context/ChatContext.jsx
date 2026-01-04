import { createContext, useContext, useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useLocalStorage("chats", [
  {
    id: "john",
    name: "John Doe",
    lastMessage: "Hey!",
    time: "10:45 AM",
    unreadCount: 3,
    isFavourite: true,
  },
  {
    id: "team",
    name: "Team Alpha",
    lastMessage: "Meeting at 6 PM",
    time: "Yesterday",
    unreadCount: 0,
    isFavourite: false,
  },
]);


  const [messages, setMessages] = useLocalStorage("messages", {
    john: [
      { text: "Hey!", type: "received" },
      { text: "Hi 👋", type: "sent" },
      { text: "How are you?", type: "received" },
      { text: "I'm good, thanks! You?", type: "sent" },
    ],
    team: [{ text: "Meeting at 6 PM", type: "received" }],
  });

  const [activeChat, setActiveChat] = useState(null);

  const selectChat = (chatId) => {
    setActiveChat(chatId);
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId ? { ...c, unreadCount: 0 } : c
      )
    );
  };
  const toggleFavourite = (chatId) => {
  setChats((prev) =>
    prev.map((c) =>
      c.id === chatId
        ? { ...c, isFavourite: !c.isFavourite }
        : c
    )
  );
};

  const deleteChat = (chatId) => {
  // remove chat from chat list
  setChats((prev) => prev.filter((chat) => chat.id !== chatId));

  // remove messages of that chat
  setMessages((prev) => {
    const updated = { ...prev };
    delete updated[chatId];
    return updated;
  });

  // reset active chat if deleted
  setActiveChat((prev) => (prev === chatId ? null : prev));
};

  const addMessage = (chatId, message) => {
    setMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), message],
    }));

    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              lastMessage: message.text,
              time: "Now",
            }
          : c
      )
    );
  };
const deleteSelectedMessages = (chatId, indexes) => {
  setMessages((prev) => ({
    ...prev,
    [chatId]: prev[chatId].filter(
      (_, index) => !indexes.includes(index)
    ),
  }));
};
  return (
    <ChatContext.Provider
      value={{
        chats,
        messages,
        activeChat,
        selectChat,
        addMessage,
        deleteChat,
        deleteSelectedMessages
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
