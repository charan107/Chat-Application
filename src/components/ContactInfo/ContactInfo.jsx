import {
  FiX,
  FiEdit2,
  FiSearch,
  FiVideo,
  FiPhone,
  FiStar,
  FiBell,
  FiHeart,
  FiSlash,
  FiFlag,
  FiTrash2,
} from "react-icons/fi";
import { useChat } from "../../context/ChatContext";
import "./ContactInfo.css";

const ContactInfo = ({ chatId, onClose }) => {
  const { chats } = useChat();

  const chat = chats.find((c) => c.id === chatId);

  if (!chat) return null;

  return (
    <div className="contact-info-panel">
      {/* Header */}
      <div className="ci-header">
        <FiX className="ci-icon" onClick={onClose} />
        <span className="ci-title">Contact info</span>
        <FiEdit2 className="ci-icon" />
      </div>

      {/* Profile */}
      <div className="ci-profile">
        <div className="ci-avatar">
          {chat.avatar ? (
            <img src={chat.avatar} alt={chat.name} />
          ) : (
            chat.name.charAt(0)
          )}
        </div>

        <h2 className="ci-name">{chat.name}</h2>
        <p className="ci-userId">{chat.phone || "—"}</p>
      </div>

      {/* Quick actions */}
      <div className="ci-actions">
        <div className="ci-action">
          <FiSearch />
          <span>Search</span>
        </div>
        <div className="ci-action">
          <FiVideo />
          <span>Video</span>
        </div>
        <div className="ci-action">
          <FiPhone />
          <span>Voice</span>
        </div>
      </div>

      {/* About */}
      <div className="ci-section">
        <h4>About</h4>
        <p>{chat.about || "No info available"}</p>
      </div>

      {/* Media */}
      <div className="ci-section ci-media">
        <div className="ci-section-header">
          <span>Media, links and docs</span>
          <span className="ci-count">{chat.mediaCount ?? 0}</span>
        </div>

        <div className="ci-media-grid">
          {(chat.mediaPreview || []).slice(0, 4).map((_, i) => (
            <div key={i} className="ci-media-item" />
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="ci-options">
        <div className="ci-option">
          <FiStar />
          <span>Starred messages</span>
        </div>
        <div className="ci-option">
          <FiBell />
          <span>Notification settings</span>
        </div>
        <div className="ci-option">
          <FiHeart />
          <span>Add to favourites</span>
        </div>
      </div>

      {/* Divider */}
      <div className="ci-divider" />

      {/* Danger Options */}
      <div className="ci-options">
        <div className="ci-option danger">
          <FiSlash />
          <span>Block {chat.name}</span>
        </div>
        <div className="ci-option danger">
          <FiFlag />
          <span>Report {chat.name}</span>
        </div>
        <div className="ci-option danger" >
          <FiTrash2 />
          <span>Delete chat</span>
        </div>
      </div>

    </div>
  );
};

export default ContactInfo;
