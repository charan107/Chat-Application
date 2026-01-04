import "./ChatListItem.css";

const ChatListItem = ({ name, message, time, unreadCount = 0 }) => {
  return (
    <div className="chat-item">
      <div className="avatar">{name.charAt(0)}</div>

      <div className="chat-details">
        <div className="chat-top">
          <h4>{name}</h4>
          <span className="time">{time}</span>
        </div>

        <div className="chat-bottom">
          <p>{message}</p>
          {unreadCount > 0 && (
  <span className="unread-count">{unreadCount}</span>
)}

        </div>
      </div>
    </div>
  );
};

export default ChatListItem;
