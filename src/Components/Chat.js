import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const ChatInterface = ({ user, contactsData, onClose }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeContact, setActiveContact] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const messagesEndRef = useRef(null);
  
  // Initialize Socket.IO connection
  useEffect(() => {
    // Replace with your actual backend URL
    const newSocket = io('http://localhost:5000');
    
    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      // Emit user connection with user ID
      newSocket.emit('user_connected', { userId: user.id, username: user.name });
    });
    
    newSocket.on('online_users', (users) => {
      setOnlineUsers(users);
    });
    
    newSocket.on('receive_message', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
      
      // If message is from current chat, mark as read
      if (message.senderId === activeContact?.userId) {
        newSocket.emit('mark_as_read', { 
          messageId: message.id,
          userId: user.id,
          contactId: activeContact.userId
        });
      }
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.disconnect();
    };
  }, [user]);
  
  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Fetch previous messages when selecting a contact
  useEffect(() => {
    if (activeContact && socket) {
      // Fetch message history from server
      socket.emit('get_message_history', { 
        userId: user.id,
        contactId: activeContact.userId
      });
      
      socket.on('message_history', (messageHistory) => {
        setMessages(messageHistory);
      });
      
      // Mark all messages as read
      socket.emit('mark_all_as_read', {
        userId: user.id,
        contactId: activeContact.userId
      });
    }
  }, [activeContact, socket, user]);
  
  const handleContactSelect = (contact) => {
    setActiveContact(contact);
  };
  
  const sendMessage = (e) => {
    e.preventDefault();
    
    if (newMessage.trim() === '' || !activeContact || !socket) return;
    
    const messageData = {
      senderId: user.id,
      senderName: user.name,
      receiverId: activeContact.userId,
      text: newMessage,
      timestamp: new Date().toISOString()
    };
    
    socket.emit('send_message', messageData);
    
    // Optimistically add message to UI
    setMessages(prevMessages => [...prevMessages, {
      ...messageData,
      isMine: true
    }]);
    
    setNewMessage('');
  };
  
  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Messages</h2>
        <button className="close-chat" onClick={onClose}>×</button>
      </div>
      
      <div className="chat-content">
        <div className="contacts-sidebar">
          {contactsData.map(contact => (
            <div 
              key={contact.userId}
              className={`contact-item ${activeContact?.userId === contact.userId ? 'active' : ''}`}
              onClick={() => handleContactSelect(contact)}
            >
              <div className="contact-avatar">
                <span>{contact.avatar}</span>
                <span className={`status-dot ${onlineUsers[contact.userId] ? 'online' : 'offline'}`}></span>
              </div>
              <div className="contact-details">
                <h4>{contact.name}</h4>
                <p className="last-message-preview">{contact.lastMessage}</p>
              </div>
              {contact.unread > 0 && <span className="unread-badge">{contact.unread}</span>}
            </div>
          ))}
        </div>
        
        <div className="messages-area">
          {!activeContact ? (
            <div className="no-contact-selected">
              <p>Select a contact to start chatting</p>
            </div>
          ) : (
            <>
              <div className="active-contact-header">
                <div className="contact-avatar">
                  <span>{activeContact.avatar}</span>
                  <span className={`status-dot ${onlineUsers[activeContact.userId] ? 'online' : 'offline'}`}></span>
                </div>
                <div className="contact-info">
                  <h3>{activeContact.name}</h3>
                  <p>{activeContact.role}</p>
                </div>
                <div className="contact-actions">
                  <button className="video-call" onClick={() => alert('Video call feature not implemented yet')}>
                    📹
                  </button>
                </div>
              </div>
              
              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <p>No previous messages. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="messages-list">
                    {messages.map((message, index) => (
                      <div 
                        key={index}
                        className={`message ${message.senderId === user.id ? 'sent' : 'received'}`}
                      >
                        <div className="message-content">
                          <p>{message.text}</p>
                          <span className="message-time">
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              
              <form className="message-input-form" onSubmit={sendMessage}>
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="send-button">Send</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;