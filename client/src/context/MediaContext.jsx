import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useSocket } from './SocketContext.jsx';

const MediaContext = createContext(null);

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error('useMedia must be used within MediaProvider');
  }
  return context;
};

export const MediaProvider = ({ children }) => {
  const { socket } = useSocket();
  const [localStream, setLocalStream] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const peerConnections = useRef(new Map());

  const RTCPeerConnectionConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  const createPeerConnection = (userId) => {
    const pc = new RTCPeerConnection(RTCPeerConnectionConfig);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          candidate: event.candidate,
          targetUserId: userId
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote track from:', userId);
    };

    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    return pc;
  };

  const getMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
        socket.emit('toggle-audio', { userId: socket.id, enabled: audioTrack.enabled });
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
        socket.emit('toggle-video', { userId: socket.id, enabled: videoTrack.enabled });
      }
    }
  };

  const leaveRoom = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();
    setParticipants([]);
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('user-joined', async (user) => {
      console.log('User joined:', user);
      setParticipants(prev => [...prev, user]);

      // Create offer for new user
      const pc = createPeerConnection(user.id);
      peerConnections.current.set(user.id, pc);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('offer', {
        offer: pc.localDescription,
        targetUserId: user.id
      });
    });

    socket.on('offer', async ({ offer, fromUserId }) => {
      let pc = peerConnections.current.get(fromUserId);
      if (!pc) {
        pc = createPeerConnection(fromUserId);
        peerConnections.current.set(fromUserId, pc);
      }

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('answer', {
        answer: pc.localDescription,
        targetUserId: fromUserId
      });
    });

    socket.on('answer', async ({ answer, fromUserId }) => {
      const pc = peerConnections.current.get(fromUserId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on('ice-candidate', async ({ candidate, fromUserId }) => {
      const pc = peerConnections.current.get(fromUserId);
      if (pc && candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on('user-left', (user) => {
      console.log('User left:', user);
      setParticipants(prev => prev.filter(p => p.id !== user.id));
      const pc = peerConnections.current.get(user.id);
      if (pc) {
        pc.close();
        peerConnections.current.delete(user.id);
      }
    });

    return () => {
      socket.off('user-joined');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('user-left');
    };
  }, [socket, localStream]);

  return (
    <MediaContext.Provider value={{
      localStream,
      participants,
      audioEnabled,
      videoEnabled,
      getMedia,
      toggleAudio,
      toggleVideo,
      leaveRoom,
      peerConnections
    }}>
      {children}
    </MediaContext.Provider>
  );
};
