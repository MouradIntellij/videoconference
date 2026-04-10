import { useState } from 'react';
import { useSocket } from '../context/SocketContext.jsx';
import { useMedia } from '../context/MediaContext.jsx';
import VideoGrid from '../components/VideoGrid.jsx';
import Controls from '../components/Controls.jsx';
import Chat from '../components/Chat.jsx';
import Whiteboard from '../components/Whiteboard.jsx';

export default function Room({ roomId, userName, onLeave }) {
  const { socket, connected } = useSocket();
  const { localStream, getMedia, participants, peerConnections } = useMedia();
  const [mediaStarted, setMediaStarted] = useState(false);
  const [error, setError] = useState('');

  const startMedia = async () => {
    try {
      await getMedia();
      setMediaStarted(true);
      
      socket.emit('join-room', {
        roomId,
        userId: socket.id,
        userName
      });
    } catch (err) {
      setError('Impossible d\'accéder à la caméra/micro. Vérifiez les permissions.');
      console.error(err);
    }
  };

  const handleLeave = () => {
    onLeave();
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p>Connexion au serveur...</p>
        </div>
      </div>
    );
  }

  if (!mediaStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Rejoindre la réunion
          </h2>
          <p className="text-gray-600 mb-6">
            Salle: {roomId}
          </p>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <button
            onClick={startMedia}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-4"
          >
            🎥 Démarrer la vidéo et l'audio
          </button>
          
          <button
            onClick={handleLeave}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">VideoConf</h1>
          <p className="text-sm text-gray-400">Salle: {roomId}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            {participants.length + 1} participant{participants.length + 1 > 1 ? 's' : ''}
          </span>
          <button
            onClick={handleLeave}
            className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Quitter
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 overflow-auto">
        <VideoGrid
          localStream={localStream}
          participants={participants}
          peerConnections={peerConnections}
        />
      </div>

      {/* Controls */}
      <Controls />

      {/* Chat and Whiteboard */}
      <Chat roomId={roomId} />
      <Whiteboard roomId={roomId} />
    </div>
  );
}
