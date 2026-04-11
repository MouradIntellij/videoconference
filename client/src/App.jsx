import { useState } from 'react';
import { SocketProvider } from './context/SocketContext.jsx';
import { MediaProvider } from './context/MediaContext.jsx';
import Room from './components/Room.jsx';

// URL dynamique
const API_URL = import.meta.env.VITE_API_URL;
console.log("API_URL =", API_URL);

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [activeRoomId, setActiveRoomId] = useState('');

  // ✅ CREATE ROOM
  const createRoom = async () => {
    try {
      const response = await fetch(`${API_URL}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const text = await response.text();
      console.log("RAW RESPONSE =", text);

      const data = JSON.parse(text);

      setActiveRoomId(data.roomId);
      setCurrentScreen('room');

    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  // ✅ JOIN ROOM
  const joinRoom = async (e) => {
    e.preventDefault();
    if (!roomId.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/rooms/${roomId}`);
      const data = await response.json();

      if (data.exists) {
        setActiveRoomId(roomId);
        setCurrentScreen('room');
      } else {
        alert("Cette salle n'existe pas.");
      }
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  // ✅ LEAVE
  const handleLeave = () => {
    setActiveRoomId('');
    setCurrentScreen('home');
  };

  // ROOM SCREEN
  if (currentScreen === 'room') {
    return (
        <SocketProvider>
          <MediaProvider>
            <Room
                roomId={activeRoomId}
                userName={userName || 'Utilisateur'}
                onLeave={handleLeave}
            />
          </MediaProvider>
        </SocketProvider>
    );
  }

  // HOME
  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">

          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📹</div>
            <h1 className="text-3xl font-bold text-gray-800">VideoConf</h1>
          </div>

          <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Votre nom"
              className="w-full mb-4 p-3 border rounded"
          />

          <button
              onClick={createRoom}
              disabled={!userName.trim()}
              className="w-full bg-blue-600 text-white p-3 rounded mb-4"
          >
            ➕ Créer une salle
          </button>

          <form onSubmit={joinRoom}>
            <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Room ID"
                className="w-full mb-4 p-3 border rounded"
            />

            <button
                type="submit"
                className="w-full bg-purple-600 text-white p-3 rounded"
            >
              🚪 Rejoindre
            </button>
          </form>

        </div>
      </div>
  );
}

export default App;