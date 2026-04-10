import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext.jsx';

export default function Chat({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !roomId) return;

    socket.on('chat-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('chat-message');
    };
  }, [socket, roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    socket.emit('chat-message', {
      roomId,
      message: newMessage,
      userId: socket.id,
      userName: 'Moi'
    });
    setNewMessage('');
  };

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`absolute left-0 top-1/2 -translate-x-full bg-blue-600 text-white px-3 py-2 rounded-l-lg shadow ${isOpen ? 'hidden' : ''}`}
      >
        💬
      </button>

      <div className={`h-full flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h3 className="font-semibold">Discussion</h3>
          <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg ${
                msg.userId === socket.id
                  ? 'bg-blue-100 ml-8'
                  : 'bg-gray-100 mr-8'
              }`}
            >
              <div className="text-xs text-gray-600 font-medium">{msg.userName}</div>
              <div className="text-sm">{msg.message}</div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écrire un message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ➤
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
