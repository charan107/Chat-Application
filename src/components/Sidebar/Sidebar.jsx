import "./Sidebar.css";
import ChatListItem from "../ChatListItem/ChatListItem";
import UserListPopup from "../UserListPopup/UserListPopup";
import { FiPlus, FiMoreVertical, FiSearch, FiLogOut, FiUser } from "react-icons/fi";
import { FiLock } from "react-icons/fi";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const Sidebar = () => {
  const { chats, selectChat, loading, currentUserData } = useChat();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [category, setCategory] = useState("all");
  const [showUserList, setShowUserList] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout. Please try again.");
    }
  };

  const filteredChats = chats.filter((chat) => {
  if (category === "unread") return chat.unreadCount > 0;
  if (category === "favourites") return chat.isFavourite;
  return true; // all
});

  return (
    <div className="sidebar" >
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-header-user">
          {currentUserData?.photoURL ? (
            <img 
              src={currentUserData.photoURL} 
              alt={currentUserData.displayName || currentUserData.fullName}
              className="sidebar-user-avatar"
            />
          ) : (
            <div className="sidebar-user-avatar-placeholder">
              {(currentUserData?.displayName || currentUserData?.fullName || "U").charAt(0).toUpperCase()}
            </div>
          )}
          <h2>Chats</h2>
        </div>
        <div className="sidebar-icons">
          <FiPlus 
            onClick={() => setShowUserList(true)} 
            style={{ cursor: "pointer" }}
            title="New Chat"
          />
          <div className="user-menu-container" ref={userMenuRef}>
            <FiUser 
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{ cursor: "pointer" }}
              title="User Menu"
            />
            {showUserMenu && (
              <div className="user-menu-dropdown">
                <div className="user-menu-info">
                  <p className="user-menu-name">
                    {currentUserData?.displayName || currentUserData?.fullName || "User"}
                  </p>
                  <p className="user-menu-email">{currentUserData?.email || ""}</p>
                </div>
                <button className="user-menu-item" onClick={handleLogout}>
                  <FiLogOut />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
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
        {loading ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
            Loading chats...
          </div>
        ) : filteredChats.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
            <p>No chats yet</p>
            <p style={{ fontSize: "12px", marginTop: "8px" }}>
              Start a new conversation to begin chatting
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div key={chat.id} onClick={() => selectChat(chat.id)}>
              <ChatListItem
                name={chat.name || "Unknown User"}
                message={chat.lastMessage || ""}
                time={chat.time || ""}
                unreadCount={chat.unreadCount || 0}
              />
            </div>
          ))
        )}
      </div>

      {/* User List Popup */}
      <UserListPopup
        isOpen={showUserList}
        onClose={() => setShowUserList(false)}
      />
    </div>
  );
};

export default Sidebar;
