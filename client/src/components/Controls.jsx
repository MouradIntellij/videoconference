import { useMedia } from '../context/MediaContext.jsx';

export default function Controls() {
  const { toggleAudio, toggleVideo, leaveRoom, audioEnabled, videoEnabled } = useMedia();

  return (
    <div className="bg-gray-900 p-4 flex justify-center gap-4">
      <button
        onClick={toggleAudio}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
          audioEnabled
            ? 'bg-gray-700 text-white hover:bg-gray-600'
            : 'bg-red-500 text-white hover:bg-red-600'
        }`}
      >
        {audioEnabled ? '🎤' : '🔇'}
        {audioEnabled ? 'Couper' : 'Activer'} le son
      </button>

      <button
        onClick={toggleVideo}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
          videoEnabled
            ? 'bg-gray-700 text-white hover:bg-gray-600'
            : 'bg-red-500 text-white hover:bg-red-600'
        }`}
      >
        {videoEnabled ? '📹' : '📷'}
        {videoEnabled ? 'Désactiver' : 'Activer'} la vidéo
      </button>

      <button
        onClick={leaveRoom}
        className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
      >
        📞 Quitter
      </button>
    </div>
  );
}
