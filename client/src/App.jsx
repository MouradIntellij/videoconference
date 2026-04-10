import { useState } from 'react';
import { SocketProvider } from './context/SocketContext.jsx';
import { MediaProvider } from './context/MediaContext.jsx';
import Room from './components/Room.jsx';

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [activeRoomId, setActiveRoomId] = useState('');

  const createRoom = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setActiveRoomId(data.roomId);
      setCurrentScreen('room');
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const joinRoom = async (e) => {
    e.preventDefault();
    if (!roomId.trim()) return;

    try {
      const response = await fetch(`http://localhost:4000/api/rooms/${roomId}`, {
        method: 'GET'
      });
      const data = await response.json();
      
      if (data.exists) {
        setActiveRoomId(roomId);
        setCurrentScreen('room');
      } else {
        alert('Cette salle n\'existe pas. Créez-la d\'abord ou vérifiez l\'ID.');
      }
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  const handleLeave = () => {
    setActiveRoomId('');
    setCurrentScreen('home');
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📹</div>
          <h1 className="text-3xl font-bold text-gray-800">VideoConf</h1>
          <p className="text-gray-600 mt-2">
            Conférence collaborative en temps réel
          </p>
        </div>

        {/* User Name */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Votre nom
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Entrez votre nom"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Create Room */}
        <button
          onClick={createRoom}
          disabled={!userName.trim()}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ➕ Créer une nouvelle salle
        </button>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">ou</span>
          </div>
        </div>

        {/* Join Room Form */}
        <form onSubmit={joinRoom}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              ID de la salle
            </label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Collez l'ID de la salle"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={!userName.trim() || !roomId.trim()}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🚪 Rejoindre la salle
          </button>
        </form>

        {/* Features */}
        <div className="mt-8 pt-6 border-t">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Fonctionnalités:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <span>✅</span> Vidéo et audio en temps réel
            </li>
            <li className="flex items-center gap-2">
              <span>✅</span> Chat intégré
            </li>
            <li className="flex items-center gap-2">
              <span>✅</span> Tableau blanc collaboratif
            </li>
            <li className="flex items-center gap-2">
              <span>✅</span> Partage d'écran (bientôt)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
