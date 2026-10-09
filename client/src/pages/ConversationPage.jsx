/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
} from "../redux/slices/messageSlice";
import Loader from "../components/Loader";
import { FaArrowLeft, FaPaperPlane } from "react-icons/fa";
import DealSummaryCard from "../components/DealSummaryCard";
import SmartReplyPanel from "../components/SmartReplyPanel";
import SentimentIndicator from "../components/SentimentIndicator";
import TranslatedMessage from "../components/TranslatedMessage";
import { socketService } from "../services/socketService";

const ConversationPage = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);

  const [newMessage, setNewMessage] = useState("");
  const { messages, loading } = useSelector((state) => state.messages);
  const { user } = useSelector((state) => state.auth);
  const { dealSummaries, sentiments, smartReplies } = useSelector((state) => state.ai);

  const conversationMessages = messages[userId] || [];
  
  // Generate conversation ID
  const conversationId = [user._id, userId].sort().join('_');
  const dealSummary = dealSummaries[conversationId];

  useEffect(() => {
    dispatch(getConversationMessages(userId));
    dispatch(markMessagesAsRead(userId));
    
    // Join conversation room for real-time updates
    if (socketService.isConnected()) {
      socketService.joinConversation(conversationId);
    }
    
    return () => {
      // Leave conversation room on unmount
      if (socketService.isConnected()) {
        socketService.leaveConversation(conversationId);
      }
    };
  }, [dispatch, userId, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    dispatch(
      sendMessage({
        recipient: userId,
        content: newMessage,
      })
    );
    setNewMessage("");
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading && conversationMessages.length === 0) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/messages"
        className="flex items-center text-green-500 hover:text-green-700 mb-6"
      >
        <FaArrowLeft className="mr-2" />
        Back to Messages
      </Link>

      <div className="glass rounded-xl overflow-hidden">
        <div className="bg-green-500 text-white p-4">
          <h2 className="text-xl font-semibold">
            {conversationMessages.length > 0
              ? conversationMessages[0].sender._id === user._id
                ? conversationMessages[0].receiver.name
                : conversationMessages[0].sender.name
              : "Conversation"}
          </h2>
        </div>

        <div className="p-4 h-[60vh] overflow-y-auto bg-gray-50">
          {/* Deal Summary Card - Display prominently at top if exists */}
          {dealSummary && (
            <div className="mb-4">
              <DealSummaryCard 
                dealSummary={dealSummary} 
                conversationId={conversationId}
              />
            </div>
          )}
          
          {conversationMessages.length > 0 ? (
            <div className="space-y-4">
              {conversationMessages.map((message) => {
                const sentiment = sentiments[message._id];
                const isFromCurrentUser = message.sender._id === user._id;
                
                return (
                  <div
                    key={message._id}
                    className={`flex ${
                      isFromCurrentUser
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isFromCurrentUser
                          ? "bg-green-500 text-white rounded-tr-none"
                          : `bg-white border rounded-tl-none ${
                              sentiment?.isAngry 
                                ? "border-red-500 border-2" 
                                : sentiment?.isUrgent
                                ? "border-yellow-500 border-2"
                                : "border-gray-200"
                            }`
                      }`}
                    >
                      {/* Sentiment Indicator for incoming messages */}
                      {!isFromCurrentUser && sentiment && (
                        <div className="mb-2">
                          <SentimentIndicator sentiment={sentiment} />
                        </div>
                      )}
                      
                      {/* Message Content with Translation Support */}
                      <TranslatedMessage 
                        message={message}
                        isFromCurrentUser={isFromCurrentUser}
                      />
                      
                      <p
                        className={`text-xs ${
                          isFromCurrentUser
                            ? "text-green-100"
                            : "text-gray-500"
                        } text-right mt-1`}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">
                No messages yet. Start the conversation!
              </p>
            </div>
          )}
        </div>

        {/* Smart Reply Panel - Show for farmers when there are buyer messages */}
        {user.role === 'farmer' && conversationMessages.length > 0 && (
          <SmartReplyPanel 
            conversationId={conversationId}
            recipientId={userId}
            lastMessage={conversationMessages[conversationMessages.length - 1]}
          />
        )}

        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="form-input flex-grow"
              placeholder="Type your message..."
            />
            <button
              type="submit"
              className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
              disabled={newMessage.trim() === ""}
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;
