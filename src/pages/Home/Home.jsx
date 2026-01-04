import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import ChatWindow from "../../components/ChatWindow/ChatWindow";
import { useChat } from "../../context/ChatContext";
import "./Home.css";

const Home = () => {
  const { activeChat,selectChat} = useChat();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Trigger entrance animations after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`home-container ${isAnimated ? 'home-animated' : ''}`}>
      {/* Sidebar */}
      {(!isMobile || !activeChat) && (
        <Sidebar onSelectChat={(chat) => selectChat(chat)} />
      )}

      {/* Chat Window */}
      {(!isMobile || activeChat) && (
        <ChatWindow
          activeChat={activeChat}
          onBack={() => selectChat(null)}
        />
      )}
    </div>
  );
};

export default Home;
