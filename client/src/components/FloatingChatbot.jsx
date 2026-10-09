import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaLocationArrow, FaTrash } from 'react-icons/fa';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', parts: [{ text: "Hi there! I'm KisanMithra's AI Assistant. How can I help you today?" }], isInitial: true }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleClearChat = () => {
    setMessages([
      { role: 'model', parts: [{ text: "Hi there! I'm KisanMithra's AI Assistant. How can I help you today?" }], isInitial: true }
    ]);
  };

  const handleDeleteMessage = (index) => {
    setMessages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = { role: 'user', parts: [{ text: inputValue }] };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      if (!API_URL) {
        throw new Error('The chat service URL is not configured.');
      }

      const { data } = await axios.post(`${API_URL}/ai/chat`, {
        message: inputValue,
        history: messages.filter(m => !m.isInitial),
      });

      if (data.success) {
        setMessages((prev) => [...prev, { role: 'model', parts: [{ text: data.data }] }]);
      } else {
        throw new Error("Failed to get response");
      }
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message ||
        (error.message === 'The chat service URL is not configured.'
          ? 'The chat service is still being configured. Please try again shortly.'
          : 'Sorry, I am having trouble connecting right now. Please try again later.');

      setMessages((prev) => [...prev, { role: 'model', parts: [{ text: message }] }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col h-[500px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-4 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <FaRobot className="text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-none">KisanMithra AI</h3>
                <span className="text-xs text-green-100">Online 24/7</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearChat}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors flex items-center justify-center group relative"
                title="Clear Chat"
              >
                <FaTrash className="text-sm" />
                <span className="absolute -bottom-8 bg-gray-800 text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Clear
                </span>
              </button>
              <button
                onClick={toggleChat}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                title="Close Chat"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group items-center gap-2`}
              >
                {msg.role === 'user' && !msg.isInitial && (
                  <button
                    onClick={() => handleDeleteMessage(idx)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1"
                    title="Delete message"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-green-600 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  }`}
                >
                  {msg.parts[0].text}
                </div>
                {msg.role === 'model' && !msg.isInitial && (
                  <button
                    onClick={() => handleDeleteMessage(idx)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1"
                    title="Delete message"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm"
              />
              <button
                type="submit"
                disabled={isTyping || !inputValue.trim()}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white p-3 rounded-xl transition-colors shadow-sm"
              >
                <FaLocationArrow className="transform rotate-45" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full shadow-2xl hover:shadow-green-500/50 hover:scale-110 flex items-center justify-center transition-all duration-300"
        aria-label="Open AI Assistant"
      >
        <FaRobot className="text-3xl" />
        {!isOpen && (
          <span className="absolute top-0 right-0 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
          </span>
        )}
      </button>
    </div>
  );
};

export default FloatingChatbot;
