import { FiClock, FiCheck, FiPlay } from "react-icons/fi";
import "./Message.css";

const Message = ({ message, type, timestamp, status, isSelectable, isSelected, onClick }) => {
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

    return <span>{message.text || message}</span>;
  };

  return (
    <div
      className={`message ${type} ${isSelectable ? "selectable" : ""} ${
        isSelected ? "selected" : ""
      }`}
      onClick={onClick}
    >
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