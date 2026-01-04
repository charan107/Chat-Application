import { useState } from "react";
import ReactDOM from "react-dom";
import {
  FiMicOff,
  FiVideo,
  FiUserPlus,
  FiMessageSquare,
  FiPhoneOff,
  FiMinus,
  FiMaximize2,
  FiX,
} from "react-icons/fi";
import "./VoiceCall.css";

const VoiceCall = ({ name, status, onEnd }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
    const [micControl, setmicControl] = useState(false);
    const [videoControl, setvideoControl] = useState(false);
  if (isMinimized) {
  return ReactDOM.createPortal(
    <div className="call-mini-window">
      <div
        className="mini-avatar"
        onClick={() => setIsMinimized(false)}
      >
        {name.charAt(0)}
      </div>

      <div className="mini-info">
        <span className="mini-name">{name}</span>
        <span className="mini-status">Calling…</span>
      </div>

      <FiPhoneOff
        className="mini-end"
        onClick={onEnd}
      />
    </div>,
    document.getElementById("call-root")
  );
}


  return ReactDOM.createPortal(
    <div className="voice-call-overlay">
      <div className={`voice-call-window ${isFullscreen ? "fullscreen" : ""}`}>
        {/* Window Header */}
        <div className="call-window-header">
          <span className="secure">🔒 End-to-end encrypted</span>
          <div className="window-controls">
  <span
    className="window-control"
    onClick={() => setIsMinimized(true)}
  >
    <FiMinus />
  </span>

  <span
    className="window-control"
    onClick={() => setIsFullscreen((p) => !p)}
  >
    <FiMaximize2 />
  </span>

  <span
    className="window-control danger"
    onClick={onEnd}
  >
    <FiX />
  </span>
</div>


        </div>

        {/* Center */}
        <div className="voice-call-center">
          <div className="call-avatar">{name.charAt(0)}</div>
          <h2>{name}</h2>
          <p>{status}</p>
        </div>

        {/* Controls */}
        <div className="voice-call-controls">
          <button
  className={`call-btn secondary ${micControl ? "active" : ""}`}
  onClick={() => setmicControl(!micControl)}
>
  <FiMicOff />
</button>

<button
  className={`call-btn secondary ${videoControl ? "active" : ""}`}
  onClick={() => setvideoControl(!videoControl)}
>
  <FiVideo />
</button>

<button className="call-btn secondary" ><FiMessageSquare /></button> <button className="call-btn secondary"><FiUserPlus />
</button>

          <button className="call-btn end" onClick={onEnd}>
            <FiPhoneOff />
          </button>
        </div>
      </div>
    </div>,
    document.getElementById("call-root")
  );
};

export default VoiceCall;
