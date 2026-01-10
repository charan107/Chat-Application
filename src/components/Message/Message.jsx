import { FiClock, FiCheck, FiPlay, FiX } from "react-icons/fi";
import "./Message.css";

const Message = ({ message, type, timestamp, status, isSelectable, isSelected, onClick, onDelete }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'waiting':
        return <FiClock className="status-icon waiting" />;
      case 'sent':
        return <FiCheck className="status-icon sent" />;
      case 'delivered':
        return <FiCheck className="status-icon delivered" />;
      case 'read':
        return <FiCheck className="status-icon read" />;
      default:
        return null;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return '📎';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('doc')) return '📝';
    if (fileType.includes('sheet') || fileType.includes('xls')) return '📊';
    if (fileType.includes('presentation') || fileType.includes('ppt')) return '📊';
    if (fileType.includes('zip') || fileType.includes('rar')) return '🗜️';
    if (fileType.includes('text')) return '📄';
    return '📎';
  };

  const renderMessageContent = () => {
    if (message.type === 'voice') {
      return (
        <div className="voice-message">
          <FiPlay className="play-icon" />
          <span className="voice-duration">
            {message.duration || 0}s
          </span>
          <div className="voice-waveform">
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
          </div>
        </div>
      );
    }

    if (message.imageURL) {
      return (
        <div className="message-image-container">
          <img
            src={message.imageURL}
            alt={message.text || "Shared image"}
            className="message-image"
            onClick={(e) => {
              e.stopPropagation();
              window.open(message.imageURL, '_blank');
            }}
          />
          {message.text && <p className="image-caption">{message.text}</p>}
        </div>
      );
    }

    if (message.fileURL) {
      return (
        <div className="file-message">
          <div className="file-icon">{getFileIcon(message.fileType)}</div>
          <div className="file-info">
            <div className="file-name">{message.fileName || 'Document'}</div>
            {message.fileSize && (
              <div className="file-size">{formatFileSize(message.fileSize)}</div>
            )}
          </div>
          <button
            className="file-download-btn"
            onClick={(e) => {
              e.stopPropagation();
              window.open(message.fileURL, '_blank');
            }}
            title="Download file"
          >
            ⬇️
          </button>
        </div>
      );
    }

    return <span>{message.text || message}</span>;
  };

  const handleContextMenu = (e) => {
    if (onDelete && type === 'sent') {
      e.preventDefault();
      if (window.confirm("Delete this message?")) {
        onDelete();
      }
    }
  };

  return (
    <div
      className={`message ${type} ${isSelectable ? "selectable" : ""} ${
        isSelected ? "selected" : ""
      }`}
      onClick={onClick}
      onContextMenu={handleContextMenu}
    >
      {onDelete && type === 'sent' && !isSelectable && (
        <button 
          className="message-delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm("Delete this message?")) {
              onDelete();
            }
          }}
          title="Delete message"
        >
          <FiX />
        </button>
      )}
      <div className="message-content">
        {renderMessageContent()}
      </div>
      <div className="message-footer">
        <span className="message-time">
          {timestamp ? formatTime(timestamp) : formatTime(new Date())}
        </span>
        {type === 'sent' && status && (
          <div className="message-status">
            {getStatusIcon(status)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;