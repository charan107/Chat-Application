import { useState, useEffect, useRef } from "react";
import {
  FiSend,
  FiVideo,
  FiPhone,
  FiMoreVertical,
  FiPlus,
  FiMic,
  FiX,
} from "react-icons/fi";
import { FiArrowLeft } from "react-icons/fi";
import { FiImage, FiFileText, FiMapPin, FiUser } from "react-icons/fi";
import {
  FiInfo,
  FiCheckSquare,
  FiClock,
  FiLock,
  FiXCircle,
  FiMinusCircle,
  FiTrash2,
} from "react-icons/fi";

import "./ChatWindow.css";
import ContextMenu from "../ContextMenu/ContextMenu";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { storage } from "../../firebase/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Button from "../Button/Button";
import Message from "../Message/Message";
import ContactInfo from "../ContactInfo/ContactInfo";
import VoiceCall from "../VoiceCall/VoiceCall";

const ChatWindow = ({ onBack }) => {
  const threeDotMenuItems = [
    {
      label: "Contact info",
      icon: FiInfo,
      onClick: () => {
        setShowContactInfo(true);
        setShowMoreMenu(false);
      },
    },
    {
      label: "Select messages",
      icon: FiCheckSquare,
      onClick: () => {
        setSelectMode(true);
        setShowMoreMenu(false);
      },
    },
    { label: "Lock chat", icon: FiLock, onClick: () => {} },
    {
      label: "Close chat",
      icon: FiXCircle,
      onClick: () => {
        selectChat(null);
      },
    },
    { label: "Clear chat", icon: FiMinusCircle, onClick: () => {} },
    {
      label: "Delete chat",
      icon: FiTrash2,
      onClick: () => {
        deleteChat(activeChat);
      },
    },
  ];
  const {
    activeChat,
    messages,
    chats,
    addMessage,
    deleteChat,
    selectChat,
    deleteSelectedMessages,
    deleteMessage,
    setTyping,
    typingUsers,
  } = useChat();
  const { user } = useAuth();
  
  // Get active chat info
  const activeChatInfo = chats.find((chat) => chat.id === activeChat);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [showAttach, setShowAttach] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const attachmentItems = [
    {
      label: "Photo / Video",
      icon: FiImage,
      onClick: () => {
        fileInputRef.current?.click();
      },
    },
    {
      label: "Document",
      icon: FiFileText,
      onClick: () => {
        documentInputRef.current?.click();
      },
    },
    {
      label: "Location",
      icon: FiMapPin,
      onClick: () => {
        alert("Location sharing coming soon!");
        setShowAttach(false);
      },
    },
    {
      label: "Contact",
      icon: FiUser,
      onClick: () => {
        alert("Contact sharing coming soon!");
        setShowAttach(false);
      },
    },
  ];

  // Recording timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Close contact info when switching chats
  useEffect(() => {
    setShowContactInfo(false);
    setSelectMode(false);
    setSelectedMessages([]);
    setShowMoreMenu(false);
    setShowAttach(false);
  }, [activeChat]);

  if (!activeChat) {
    return (
      <div className="chat-window empty">
        <p>Select a chat to start messaging</p>
      </div>
    );
  }
  const chatMessages = Array.isArray(messages) ? messages : (messages?.[activeChat] || []);

  // Get message status from Firebase data
  const getMessageStatus = (message) => {
    if (message?.type !== "sent") return null;
    return message.status || "sent"; // sent, delivered, read
  };

  // Typing indicator
  useEffect(() => {
    if (!activeChat || !setTyping) return;

    if (message.trim() && !isTyping) {
      setIsTyping(true);
      setTyping(activeChat, true);
    }

    // Clear typing indicator after 3 seconds of no typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        setTyping(activeChat, false);
      }
    }, 3000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, activeChat, isTyping, setTyping]);

  // Stop typing when message is sent
  useEffect(() => {
    if (!message.trim() && isTyping && setTyping) {
      setIsTyping(false);
      setTyping(activeChat, false);
    }
  }, [message, isTyping, activeChat, setTyping]);

  const handleSend = async () => {
    if (!message.trim()) return;

    // Stop typing
    if (isTyping && setTyping) {
      setIsTyping(false);
      setTyping(activeChat, false);
    }

    await addMessage(activeChat, {
      text: message,
      type: "sent",
    });

    setMessage("");
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat || !user) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const imageRef = ref(storage, `chat-images/${activeChat}/${Date.now()}_${file.name}`);
      await uploadBytes(imageRef, file);
      const imageURL = await getDownloadURL(imageRef);

      await addMessage(activeChat, {
        text: file.name,
        type: "sent",
        imageURL: imageURL,
        fileName: file.name,
        fileType: file.type,
      });

      setShowAttach(false);
    } catch (error) {
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat || !user) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size should be less than 10MB');
      return;
    }

    setUploadingFile(true);
    try {
      const fileRef = ref(storage, `chat-files/${activeChat}/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const fileURL = await getDownloadURL(fileRef);

      await addMessage(activeChat, {
        text: file.name,
        type: "sent",
        fileURL: fileURL,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      setShowAttach(false);
    } catch (error) {
      alert("Failed to upload file. Please try again.");
    } finally {
      setUploadingFile(false);
      if (documentInputRef.current) {
        documentInputRef.current.value = '';
      }
    }
  };

  const handleMessageDelete = async (messageId) => {
    if (!messageId || !activeChat) return;

    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await deleteMessage(activeChat, messageId);
      } catch (error) {
        alert("Failed to delete message. Please try again.");
      }
    }
  };

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const sendVoiceMessage = () => {
    addMessage(activeChat, {
      type: "voice",
      duration: recordingTime,
    });
    setIsRecording(false);
  };

  const cancelRecording = () => {
    setIsRecording(false);
  };
  if (showVoiceCall) {
  return (
    <VoiceCall
      name={activeChat}
      status="Calling..."
      onEnd={() => setShowVoiceCall(false)}
    />
  );
}
  return (
    <div className={`chat-container ${showContactInfo ? "split" : ""}`}>
      {/* LEFT: CHAT */}
      <div className="chat-main">
        <div className="chat-header">
          <div className="chat-header-left" onClick = {()=> setShowContactInfo(!showContactInfo)}>
            <button className="back-btn" onClick={onBack}>
              <FiArrowLeft />
            </button>
            <div className="chat-avatar">
              {activeChatInfo?.photoURL ? (
                <img src={activeChatInfo.photoURL} alt={activeChatInfo.name} />
              ) : (
                (activeChatInfo?.name || "U").charAt(0).toUpperCase()
              )}
            </div>
            <span className="chat-title">{activeChatInfo?.name || "Unknown User"}</span>
          </div>

          <div className="chat-header-actions">
            {selectMode ? (
              <>
                <span className="selected-count">
                  {selectedMessages.length}
                </span>

                <FiTrash2
                  className="header-icon"
                  onClick={async () => {
                    try {
                      await deleteSelectedMessages(activeChat, selectedMessages);
                      setSelectedMessages([]);
                      setSelectMode(false);
                    } catch (error) {
                      alert("Failed to delete messages. Please try again.");
                    }
                  }}
                />

                <FiSend
                  className="header-icon"
                  onClick={() => {
                    // forward logic later
                    setSelectedMessages([]);
                    setSelectMode(false);
                  }}
                />

                <FiX
                  className="header-icon"
                  onClick={() => {
                    setSelectedMessages([]);
                    setSelectMode(false);
                  }}
                />
              </>
            ) : (
              <>
                <FiPhone className="header-icon" onClick={()=>setShowVoiceCall(true)} />
                <FiVideo className="header-icon" />

                <div className="menu-anchor">
                  <FiMoreVertical
                    className="header-icon"
                    onClick={() => setShowMoreMenu((p) => !p)}
                  />

                  {showMoreMenu && (
                    <ContextMenu
                      items={threeDotMenuItems}
                      onClose={() => setShowMoreMenu(false)}
                      position={{
                        top: "50px",
                        right: showContactInfo ? "calc(50% + 10px)" : "10px",
                      }}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="messages">
          {chatMessages.map((m, i) => {
            // Handle Firebase Timestamp
            let timestamp = m.timestamp || m.createdAt;
            if (timestamp?.toDate) {
              timestamp = timestamp.toDate();
            } else if (typeof timestamp === 'number') {
              timestamp = new Date(timestamp);
            } else if (!timestamp) {
              timestamp = new Date();
            }

            return (
              <Message
                key={m.id || i}
                message={m}
                type={m.type}
                timestamp={timestamp}
                status={getMessageStatus(m)}
                isSelectable={selectMode}
                isSelected={selectedMessages.includes(m.id)}
                onClick={() => {
                  if (!selectMode) {
                    // Long press or right click to delete (on mobile, show context menu)
                    return;
                  }

                  setSelectedMessages((prev) =>
                    prev.includes(m.id)
                      ? prev.filter((id) => id !== m.id)
                      : [...prev, m.id]
                  );
                }}
                onDelete={() => handleMessageDelete(m.id)}
              />
            );
          })}
          
          {/* Typing Indicator */}
          {typingUsers && typingUsers.length > 0 && (
            <div className="typing-indicator">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="typing-text">
                {typingUsers.length === 1 ? 'is typing...' : 'are typing...'}
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input + Popup Wrapper */}
        <div className="chat-input-wrapper">
          <div className={`chat-input ${isRecording ? "hidden" : ""}`}>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,video/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <input
              type="file"
              ref={documentInputRef}
              accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
              onChange={handleDocumentUpload}
              style={{ display: 'none' }}
            />
            <button
              className="input-icon-btn"
              onClick={() => setShowAttach((prev) => !prev)}
              disabled={uploadingImage || uploadingFile}
            >
              <FiPlus />
            </button>

            <input
              placeholder={uploadingImage || uploadingFile ? "Uploading..." : "Type a message..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={uploadingImage || uploadingFile}
            />

            {message.trim() ? (
              <button className="input-icon-btn voice">
                <FiSend onClick={handleSend}/>
              </button>
            ) : (
              <button className="input-icon-btn voice" onClick={startRecording}>
                <FiMic />
              </button>
            )}
          </div>

          {/* Voice Recording UI */}
          {isRecording && (
            <div className="voice-recording-ui">
              <div className="recording-dot"></div>
              <span className="recording-text">Recording...</span>
              <span className="recording-timer">
                {Math.floor(recordingTime / 60)}:
                {(recordingTime % 60).toString().padStart(2, "0")}
              </span>
              <button
                className="recording-btn cancel"
                onClick={cancelRecording}
              >
                <FiX />
                Cancel
              </button>
              <Button className="recording-send-btn" onClick={sendVoiceMessage}>
                <FiSend/>
                Send
              </Button>
            </div>
          )}

          {showAttach && (
            <ContextMenu
              items={attachmentItems}
              onClose={() => setShowAttach(false)}
              position={{
                bottom: "70px",
                left: "16px",
              }}
            />
          )}
        </div>
      </div>
      {/* RIGHT: CONTACT INFO */}
      {showContactInfo && (
        <ContactInfo
          chatId={activeChat}
          onClose={() => setShowContactInfo(false)}
        />
      )}
    </div>
  );
};

export default ChatWindow;
