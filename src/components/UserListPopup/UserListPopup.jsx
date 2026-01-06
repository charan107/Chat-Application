import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { db } from "../../firebase/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { FiX, FiSearch, FiUser } from "react-icons/fi";
import "./UserListPopup.css";

const UserListPopup = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { createChat, chats, selectChat } = useChat();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [creatingChat, setCreatingChat] = useState(null);

  // Real-time listener for all users
  useEffect(() => {
    if (!isOpen || !user) {
      setUsers([]);
      setFilteredUsers([]);
      return;
    }

    setLoading(true);
    
    // Set up real-time listener for users
    const usersQuery = collection(db, "users");
    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        const usersData = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
            };
          })
          .filter((u) => {
            // Exclude current user
            if (u.id === user.uid) return false;
            // Only include users with valid data
            return u.email || u.displayName || u.fullName;
          })
          .sort((a, b) => {
            // Sort client-side by displayName or fullName
            const nameA = (a.displayName || a.fullName || a.email || "").toLowerCase();
            const nameB = (b.displayName || b.fullName || b.email || "").toLowerCase();
            return nameA.localeCompare(nameB);
          });

        setUsers(usersData);
        setFilteredUsers(usersData);
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to users:", error);
        setUsers([]);
        setFilteredUsers([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen, user]);

  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      (u) =>
        u.displayName?.toLowerCase().includes(query) ||
        u.fullName?.toLowerCase().includes(query) ||
        u.username?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  // Check if chat already exists with a user
  const getExistingChatId = (userId) => {
    const existingChat = chats.find((chat) => {
      return (
        chat.members?.includes(userId) && chat.members?.includes(user.uid)
      );
    });
    return existingChat?.id;
  };

  const handleStartChat = async (otherUserId) => {
    // Check if chat already exists
    const existingChatId = getExistingChatId(otherUserId);
    if (existingChatId) {
      // Chat exists, just select it
      selectChat(existingChatId);
      onClose();
      return;
    }

    // Create new chat
    setCreatingChat(otherUserId);
    try {
      const chatId = await createChat(otherUserId);
      if (chatId) {
        selectChat(chatId);
        onClose();
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      alert("Failed to create chat. Please try again.");
    } finally {
      setCreatingChat(null);
    }
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="user-list-overlay" onClick={onClose}>
      <div className="user-list-popup" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="user-list-header">
          <h2>Select a user to chat</h2>
          <button className="user-list-close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* Search */}
        <div className="user-list-search">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search users by name, username, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* User List */}
        <div className="user-list-content">
          {loading ? (
            <div className="user-list-loading">
              <p>Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="user-list-empty">
              <FiUser className="empty-icon" />
              <p>{searchQuery ? "No users found" : "No users available"}</p>
              {!searchQuery && (
                <p className="empty-hint">
                  {users.length === 0 
                    ? "No other users have registered yet. Ask someone to sign up!" 
                    : "Try searching for a user"}
                </p>
              )}
              {searchQuery && (
                <p className="empty-hint">Try a different search term</p>
              )}
            </div>
          ) : (
            <div className="user-list-items">
              {filteredUsers.map((userItem) => {
                const existingChatId = getExistingChatId(userItem.id);
                const isCreating = creatingChat === userItem.id;

                return (
                  <div
                    key={userItem.id}
                    className={`user-list-item ${
                      isCreating ? "creating" : ""
                    }`}
                    onClick={() => !isCreating && handleStartChat(userItem.id)}
                  >
                    <div className="user-list-avatar">
                      {userItem.photoURL ? (
                        <img
                          src={userItem.photoURL}
                          alt={userItem.displayName || userItem.fullName}
                        />
                      ) : (
                        <div className="user-list-avatar-placeholder">
                          {(userItem.displayName || userItem.fullName || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                      {userItem.isOnline && (
                        <span className="user-online-indicator"></span>
                      )}
                    </div>
                    <div className="user-list-info">
                      <h3>{userItem.displayName || userItem.fullName || "Unknown User"}</h3>
                      <p className="user-list-username">
                        @{userItem.username || "no username"}
                      </p>
                      {userItem.about && (
                        <p className="user-list-about">{userItem.about}</p>
                      )}
                    </div>
                    <div className="user-list-action">
                      {existingChatId ? (
                        <span className="chat-exists-badge">Chat exists</span>
                      ) : isCreating ? (
                        <span className="creating-badge">Creating...</span>
                      ) : (
                        <button className="start-chat-btn">Start Chat</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserListPopup;
