import { useEffect, useRef, useState } from 'react';

export default function ChatModal({
  chatReady,
  isReplying,
  messages,
  onClose,
  onSend,
}) {
  const [draft, setDraft] = useState('');
  const conversationRef = useRef(null);

  useEffect(() => {
    if (!conversationRef.current) {
      return;
    }

    conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
  }, [messages, isReplying]);

  const handleSubmit = () => {
    const trimmed = draft.trim();
    if (!trimmed || isReplying) {
      return;
    }

    onSend(trimmed);
    setDraft('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="chat-modal-backdrop" role="dialog" aria-modal="true">
      <div className="chat-modal">
        <div className="chat-modal__header">
          <div>
            <p className="eyebrow">Store assistant</p>
            <h2>Active chatbot workspace</h2>
          </div>
          <button type="button" className="chat-modal__close" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="chat-modal__body">
          <p className="muted">
            {chatReady
              ? 'The assistant is connected to your backend session flow and ready to send live messages.'
              : 'Preparing the chat session with your backend. You can still open the workspace while it connects.'}
          </p>

          <div className="chat-thread" ref={conversationRef}>
            {messages.map((entry) => (
              <div
                key={entry.id}
                className={`chat-bubble chat-bubble--${entry.role}`}
              >
                <span className="eyebrow">
                  {entry.role === 'assistant' ? 'Assistant' : 'You'}
                </span>
                <p>{entry.content}</p>
              </div>
            ))}

            {isReplying ? (
              <div className="chat-bubble chat-bubble--assistant chat-bubble--typing">
                <span className="eyebrow">Assistant</span>
                <p>Typing a reply...</p>
              </div>
            ) : null}
          </div>

          <div className="chat-composer">
            <textarea
              rows="3"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about pricing, product comparisons, or delivery"
            />
            <button type="button" className="primary-button" onClick={handleSubmit}>
              Send message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
