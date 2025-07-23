import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import socketService from '../utils/socket';
import { 
  PaperAirplaneIcon,
  FaceSmileIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const Chat = ({ roomId }) => {
  const { user } = useAuthStore();
  const { messages, addMessage, setMessages } = useChatStore();
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Load chat history
    loadChatHistory();

    // Socket listeners
    socketService.on('message-received', (message) => {
      addMessage(message);
    });

    socketService.on('user-typing', ({ userId, username, isTyping: typing }) => {
      if (userId !== user.id) {
        setTypingUsers(prev => {
          if (typing) {
            return [...prev.filter(u => u.userId !== userId), { userId, username }];
          } else {
            return prev.filter(u => u.userId !== userId);
          }
        });
      }
    });

    return () => {
      socketService.off('message-received');
      socketService.off('user-typing');
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/rooms/${roomId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      content: newMessage,
      userId: user.id,
      username: user.username,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    socketService.emit('send-message', {
      roomId,
      message
    });

    setNewMessage('');
    setIsTyping(false);
    socketService.emit('typing', { roomId, isTyping: false });
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // Handle typing indicator
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      socketService.emit('typing', { roomId, isTyping: true });
    } else if (isTyping && e.target.value.length === 0) {
      setIsTyping(false);
      socketService.emit('typing', { roomId, isTyping: false });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (messages) => {
    const grouped = {};
    messages.forEach(message => {
      const date = new Date(message.timestamp).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(message);
    });
    return grouped;
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <h3 className="font-semibold text-sm">Chat</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {Object.entries(groupedMessages).map(([date, dayMessages]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-gray-600"></div>
              <span className="px-3 text-xs text-gray-400 bg-gray-800">
                {formatDate(dayMessages[0].timestamp)}
              </span>
              <div className="flex-1 border-t border-gray-600"></div>
            </div>

            {/* Messages for this date */}
            {dayMessages.map((message, index) => {
              const isOwnMessage = message.userId === user.id;
              const showAvatar = index === 0 || dayMessages[index - 1].userId !== message.userId;
              
              return (
                <div
                  key={message.id || index}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${
                    showAvatar ? 'mt-4' : 'mt-1'
                  }`}
                >
                  <div className={`flex max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    {showAvatar && !isOwnMessage && (
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-2 mt-auto">
                        {message.username[0].toUpperCase()}
                      </div>
                    )}
                    
                    {/* Message bubble */}
                    <div className={`${showAvatar && !isOwnMessage ? '' : isOwnMessage ? 'mr-10' : 'ml-10'}`}>
                      {/* Username (only for first message in group) */}
                      {showAvatar && !isOwnMessage && (
                        <div className="text-xs text-gray-400 mb-1 ml-1">
                          {message.username}
                        </div>
                      )}
                      
                      {/* Message content */}
                      <div
                        className={`px-3 py-2 rounded-lg ${
                          isOwnMessage
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-100'
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </div>
                        <div className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-blue-200' : 'text-gray-400'
                        }`}>
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
            </div>
            <span>
              {typingUsers.length === 1 
                ? `${typingUsers[0].username} is typing...`
                : `${typingUsers.length} people are typing...`
              }
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-700">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-500"
              rows="1"
              style={{ minHeight: '36px', maxHeight: '100px' }}
            />
          </div>
          
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
