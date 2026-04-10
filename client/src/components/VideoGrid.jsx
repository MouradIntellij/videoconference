import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext.jsx';

export default function VideoGrid({ localStream, participants, peerConnections }) {
  const localVideoRef = useRef(null);
  const remoteVideosRef = useRef(new Map());
  const { socket } = useSocket();

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    participants.forEach(participant => {
      const pc = peerConnections.current.get(participant.id);
      if (pc) {
        pc.ontrack = (event) => {
          const videoElement = remoteVideosRef.current.get(participant.id);
          if (videoElement && event.streams[0]) {
            videoElement.srcObject = event.streams[0];
          }
        };
      }
    });
  }, [participants, peerConnections]);

  const addRemoteVideo = (participantId) => {
    if (!remoteVideosRef.current.has(participantId)) {
      remoteVideosRef.current.set(participantId, React.createRef());
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {/* Local video */}
      <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full"
        />
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-3 py-1 rounded text-white text-sm">
          Moi
        </div>
      </div>

      {/* Remote videos */}
      {participants.map((participant) => (
        <div
          key={participant.id}
          className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video"
        >
          <video
            ref={(el) => {
              if (el) {
                remoteVideosRef.current.set(participant.id, { current: el });
                const pc = peerConnections.current.get(participant.id);
                if (pc) {
                  pc.ontrack = (event) => {
                    if (event.streams[0]) {
                      el.srcObject = event.streams[0];
                    }
                  };
                }
              }
            }}
            autoPlay
            playsInline
            className="w-full h-full"
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-3 py-1 rounded text-white text-sm">
            {participant.name}
          </div>
        </div>
      ))}
    </div>
  );
}
