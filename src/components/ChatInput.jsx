import { useState } from 'react';
import './ChatInput.css';

export default function ChatInput({ onSend }) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    onSend(trimmed);
    setMessage('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="chat-launcher">
      <div className="chat-launcher__shell">
        <span className="chat-launcher__spark">Ask</span>
        <input
          type="text"
          placeholder="Ask about sizing, material, or delivery"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button type="button" className="chat-launcher__send" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
}
