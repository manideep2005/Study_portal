import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Peer } from "peerjs";
import "./Videocall.css"; // You'll need to create this CSS file

function VideoCall() {
  const { contactId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const contact = location.state?.contact;
  
  const [peerId, setPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [error, setError] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  
  const peerInstance = useRef(null);
  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Initialize PeerJS when component mounts
  useEffect(() => {
    const initializePeer = async () => {
      try {
        // Create a new Peer instance with explicit configuration
        const peer = new Peer(undefined, {
          host: 'localhost',
          port: 9000,
          path: '/peerjs',
          debug: 3, // Set to 3 for all logs, helpful for debugging
          config: {
            'iceServers': [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' }
            ]
          }
        });

        // Handle peer open event
        peer.on("open", (id) => {
          console.log("My peer ID is: " + id);
          setPeerId(id);
          
          // Generate a room ID based on the contact and user
          const userId = JSON.parse(localStorage.getItem('user'))?.id || 'user';
          const roomId = `${userId}-${contactId}`;
          console.log("Room ID:", roomId);
          
          // Here you would typically emit a socket event to join a room
          // socket.emit('join-room', roomId, id);
        });

        // Handle incoming calls
        peer.on("call", async (call) => {
          try {
            console.log("Received call from:", call.peer);
            
            if (!localStream) {
              const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
              });
              
              setLocalStream(stream);
              myVideoRef.current.srcObject = stream;
              
              // Answer the call with our stream
              call.answer(stream);
              setIsCallStarted(true);
              
              // Handle incoming stream
              call.on("stream", (remoteStream) => {
                console.log("Received remote stream");
                remoteVideoRef.current.srcObject = remoteStream;
                setIsConnected(true);
              });
            } else {
              call.answer(localStream);
            }
          } catch (err) {
            console.error("Failed to get local stream", err);
            setError("Failed to access camera and microphone: " + err.message);
          }
        });

        // Handle peer errors
        peer.on('error', (err) => {
          console.error('Peer connection error:', err);
          setError("Connection error: " + err.message);
        });

        // Save peer instance
        peerInstance.current = peer;
        
        // Initialize camera/mic access
        initializeMedia();
        
        // Clean up on unmount
        return () => {
          peer.destroy();
          if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
          }
        };
      } catch (err) {
        console.error("Failed to create peer", err);
        setError("Failed to initialize video call: " + err.message);
      }
    };
    
    initializePeer();
  }, [contactId]);

  // Initialize media stream
  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      setLocalStream(stream);
      if (myVideoRef.current) {
        myVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Failed to get local stream", err);
      setError("Failed to access camera and microphone: " + err.message);
    }
  };

  // Call the remote peer
  const callUser = async () => {
    try {
      if (!peerInstance.current) {
        setError("Peer connection not established");
        return;
      }
      
      if (!remotePeerId) {
        setError("Please enter a valid peer ID");
        return;
      }
      
      console.log("Calling peer:", remotePeerId);
      
      if (!localStream) {
        await initializeMedia();
      }
      
      const call = peerInstance.current.call(remotePeerId, localStream);
      setIsCallStarted(true);
      
      call.on("stream", (remoteStream) => {
        console.log("Received remote stream");
        remoteVideoRef.current.srcObject = remoteStream;
        setIsConnected(true);
      });
      
      call.on('error', (err) => {
        console.error('Call error:', err);
        setError("Call failed: " + err.message);
      });
      
      call.on('close', () => {
        console.log('Call closed');
        setIsConnected(false);
        setIsCallStarted(false);
      });
    } catch (err) {
      console.error("Failed to make call", err);
      setError("Failed to make call: " + err.message);
    }
  };

  // End call and return to chat
  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    navigate(`/chat`);
  };

  return (
    <div className="video-call-container">
      <div className="video-call-header">
        <h2>Video Call {contact ? `with ${contact.name}` : ''}</h2>
        <div className="connection-status">
          {isConnected ? 
            <span className="status-connected">Connected</span> : 
            isCallStarted ? 
              <span className="status-connecting">Connecting...</span> : 
              <span className="status-disconnected">Not Connected</span>
          }
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      <div className="video-grid">
        <div className="video-container local-video">
          <video 
            ref={myVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className="my-video"
          />
          <div className="video-label">You</div>
        </div>
        
        <div className="video-container remote-video">
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="remote-video"
          />
          <div className="video-label">{contact ? contact.name : 'Remote User'}</div>
        </div>
      </div>
      
      <div className="video-controls">
        {!isCallStarted ? (
          <div className="connection-controls">
            <div className="peer-id-container">
              <p>Your ID: <span className="peer-id">{peerId}</span></p>
              <button 
                className="copy-id-btn"
                onClick={() => {
                  navigator.clipboard.writeText(peerId);
                  alert("Peer ID copied to clipboard!");
                }}
              >
                Copy ID
              </button>
            </div>
            
            <div className="call-form">
              <input
                type="text"
                placeholder="Enter peer ID to call"
                value={remotePeerId}
                onChange={(e) => setRemotePeerId(e.target.value)}
                className="peer-id-input"
              />
              <button 
                onClick={callUser}
                className="call-btn"
                disabled={!peerId || !remotePeerId}
              >
                Start Call
              </button>
            </div>
          </div>
        ) : (
          <div className="active-call-controls">
            <button className="end-call-btn" onClick={endCall}>
              End Call
            </button>
          </div>
        )}
      </div>
      
      <div className="back-to-chat">
        <button onClick={endCall}>
          Return to Chat
        </button>
      </div>
    </div>
  );
}

export default VideoCall;