import { useState, useEffect } from "react";
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
import Button from "../Button/Button";
import Message from "../Message/Message";
import ContactInfo from "../ContactInfo/ContactInfo";
import VoiceCall from "../VoiceCall/VoiceCall";

const attachmentItems = [
  {
    label: "Photo / Video",
    icon: FiImage,
    onClick: () => {
      alert("Photo/Video picker coming soon!");
      setShowAttach(false);
    },
  },
  {
    label: "Document",
    icon: FiFileText,
    onClick: () => {
      alert("Document picker coming soon!");
      setShowAttach(false);
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
    addMessage,
    deleteChat,
    selectChat,
    deleteSelectedMessages,
  } = useChat();
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [showAttach, setShowAttach] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showVoiceCall, setShowVoiceCall] = useState(false);

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

  const handleSend = () => {
    if (!message.trim()) return;

    addMessage(activeChat, {
      text: message,
      type: "sent",
    });

    setMessage("");
  };

  const startRecording = () => {
    setIsRecording(true);
    // Here you would start actual audio recording
    console.log("Started recording...");
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Here you would stop recording and get the audio blob
    console.log("Stopped recording...");
  };

  const sendVoiceMessage = () => {
    // Here you would send the recorded audio
    addMessage(activeChat, {
      type: "voice",
      duration: recordingTime,
      // audioBlob would be added here
    });
    setIsRecording(false);
  };

  const cancelRecording = () => {
    setIsRecording(false);
    console.log("Recording cancelled");
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
            <div className="chat-avatar">{activeChat.charAt(0)}</div>
            <span className="chat-title">{activeChat}</span>
          </div>

          <div className="chat-header-actions">
            {selectMode ? (
              <>
                <span className="selected-count">
                  {selectedMessages.length}
                </span>

                <FiTrash2
                  className="header-icon"
                  onClick={() => {
                    deleteSelectedMessages(activeChat, selectedMessages);
                    setSelectedMessages([]);
                    setSelectMode(false);
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
                isSelected={selectedMessages.includes(i)}
                onClick={() => {
                  if (!selectMode) return;

                  setSelectedMessages((prev) =>
                    prev.includes(i)
                      ? prev.filter((id) => id !== i)
                      : [...prev, i]
                  );
                }}
              />
            );
          })}
        </div>

        {/* Input + Popup Wrapper */}
        <div className="chat-input-wrapper">
          <div className={`chat-input ${isRecording ? "hidden" : ""}`}>
            <button
              className="input-icon-btn"
              onClick={() => setShowAttach((prev) => !prev)}
            >
              <FiPlus />
            </button>

            <input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
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
