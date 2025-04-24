import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

const MessagingPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const ws = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!user?.token) return;

    // Establish WebSocket connection
    ws.current = new WebSocket(`ws://localhost:3001?token=${user.token}&conversationId=${id}`);

    ws.current.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message') {
        setMessages((prev) => [...prev, data.message]);
      } else if (data.type === 'initial') {
        setMessages(data.messages);
      }
    };

    ws.current.onerror = (err) => {
      console.error('WebSocket error:', err);
      setError("Connection issue. Try reloading.");
    };

    ws.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      ws.current?.close();
    };
  }, [id, user?.token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      type: 'message',
      content: newMessage,
      conversationId: id,
    };

    try {
      ws.current?.send(JSON.stringify(messageData));
      setNewMessage('');
    } catch (err) {
      console.error('Send error:', err);
      toast.error('Failed to send message.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="border-b p-4">
              <h1 className="text-xl font-semibold">Chat</h1>
            </div>

            {error ? (
              <div className="p-4 text-center text-red-500">
                {error}
              </div>
            ) : (
              <>
                <div className="h-[calc(100vh-16rem)] p-4 overflow-auto">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div 
                        key={msg._id || Math.random()} 
                        className={`max-w-[80%] ${
                          msg.sender._id === user?._id 
                            ? "ml-auto bg-blue-50" 
                            : "bg-white"
                        } rounded-lg border shadow-sm`}
                      >
                        <div className="p-3">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <p className="text-sm font-medium text-gray-600">
                                {msg.sender._id === user?._id ? "You" : msg.sender.name}
                              </p>
                              <p className="mt-1">{msg.content}</p>
                            </div>
                            <span className="text-xs text-gray-400">
                              {new Date(msg.createdAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
                
                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input 
                      type="text" 
                      placeholder="Type your message..." 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-grow"
                    />
                    <Button 
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Send
                    </Button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MessagingPage;
