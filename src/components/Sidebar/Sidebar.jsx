import "./Sidebar.css";
import ChatListItem from "../ChatListItem/ChatListItem";
import { FiPlus, FiMoreVertical, FiSearch } from "react-icons/fi";
import { FiLock } from "react-icons/fi";
import { useChat } from "../../context/ChatContext";
import { useState } from "react";

const Sidebar = () => {
  const { chats, selectChat } = useChat();
  const [category, setCategory] = useState("all");

  const filteredChats = chats.filter((chat) => {
  if (category === "unread") return chat.unreadCount > 0;
  if (category === "favourites") return chat.isFavourite;
  return true; // all
});

  return (
    <div className="sidebar" >
      {/* Header */}
      <div className="sidebar-header">
        <h2>Chats</h2>
        <div className="sidebar-icons">
          <FiPlus />
          <FiMoreVertical />
        </div>
      </div>
    

      {/* Search */}
      <div className="search-box">
        <FiSearch />
        <input placeholder="Search chats" />
      </div>

      {/* Categories */}
      <div className="categories">
  <button
    className={category === "all" ? "active" : ""}
    onClick={() => setCategory("all")}
  >
    All
  </button>

  <button
    className={category === "unread" ? "active" : ""}
    onClick={() => setCategory("unread")}
  >
    Unread
  </button>
  <button
    className={category === "groups" ? "active" : ""}
    onClick={() => setCategory("groups")}
  >
    Groups
  </button>

  <button
    className={category === "favourites" ? "active" : ""}
    onClick={() => setCategory("favourites")}
  >
    Favourites
  </button>
</div>

{/* Locked Folder */}
<div className="locked-folder">
  <div className="locked-folder-header">
    <FiLock />
    <span>Locked chats</span>
  </div>

  <div className="locked-folder-hint">
    Protected by device security
  </div>
</div>

      {/* Chat List */}
      <div className="chat-list">
          {filteredChats.map((chat) => (

          <div key={chat.id} onClick={() => selectChat(chat.id)}>
            <ChatListItem
              name={chat.name}
              message={chat.lastMessage}
              time={chat.time}
              unreadCount={chat.unreadCount}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
