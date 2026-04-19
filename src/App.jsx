import { useEffect, useState } from 'react';
import './App.css';
import Data from './components/Data';
import ChatInput from './components/ChatInput';
import ChatModal from './components/ChatModel';
import Products from './components/Products';
import { initializeChatSession, sendChatMessage } from './services/chatbot';

function App() {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hi, I can help with product fit, price, delivery, and quick comparisons. Ask me about any item on this page.',
    },
  ]);
  const [isReplying, setIsReplying] = useState(false);
  const [chatReady, setChatReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function prepareSession() {
      try {
        await initializeChatSession();
      } finally {
        if (active) {
          setChatReady(true);
        }
      }
    }

    prepareSession();

    return () => {
      active = false;
    };
  }, []);

  const handleSend = async (nextMessage) => {
    const trimmed = nextMessage.trim();
    if (!trimmed) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setChatOpen(true);

    setIsReplying(true);
    try {
      const reply = await sendChatMessage(trimmed);

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: reply,
        },
      ]);
    } catch {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          content:
            'I could not get a response from the chat API just now. Please check the backend session, refresh endpoint, or chat response payload.',
        },
      ]);
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <>
      <Products data={Data} onAskAboutProduct={handleSend} />
      <ChatInput onSend={handleSend} />
      {chatOpen ? (
        <ChatModal
          chatReady={chatReady}
          isReplying={isReplying}
          messages={messages}
          onClose={() => setChatOpen(false)}
          onSend={handleSend}
        />
      ) : null}
    </>
  );
}

export default App;
