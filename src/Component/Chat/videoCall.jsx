import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Peer from 'simple-peer';
import { collection, addDoc, onSnapshot, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../Firebase';
import { PhoneIcon, PhoneXMarkIcon } from '@heroicons/react/24/solid';

const VideoCall = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector(state => state.auth.currentUser);
  const [stream, setStream] = useState(null);
  const [peer, setPeer] = useState(null);
  const [callCode, setCallCode] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionCode, setConnectionCode] = useState('');
  const [callStatus, setCallStatus] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const myVideo = useRef();
  const remoteVideo = useRef();
  const timerRef = useRef();
  const peerRef = useRef();

  const peerConfig = {
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        {
          urls: [
            'turn:relay.metered.ca:80',
            'turn:relay.metered.ca:443',
            'turn:relay.metered.ca:80?transport=tcp',
            'turn:relay.metered.ca:443?transport=tcp',
            'turns:relay.metered.ca:443'
          ],
          username: 'e8e9e650c3a7c6ee8e2442f2',
          credential: 'uBJCrqXhZHYwxwF9'
        }
      ],
      iceCandidatePoolSize: 10,
      iceTransportPolicy: 'relay'
    }
  };
  
  
  

  useEffect(() => {
    const fetchTaskAndUser = async () => {
      try {
        console.log('🔄 Fetching task and user data...');
        const taskDoc = await getDoc(doc(db, 'tasks', taskId));
        if (taskDoc.exists()) {
          const taskData = taskDoc.data();
          const otherUserId = taskData.client === currentUser.id ? taskData.assignee : taskData.client;
          
          const userDoc = await getDoc(doc(db, 'users', otherUserId));
          if (userDoc.exists()) {
            const userData = { id: userDoc.id, ...userDoc.data() };
            console.log('👤 Other user data:', userData);
            setOtherUser(userData);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching data:', error);
      }
    };

    if (currentUser?.id && taskId) {
      fetchTaskAndUser();
    }
  }, [taskId, currentUser]);

  const getMediaStream = async () => {
    console.log('📹 Getting media stream...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      console.log('✅ Media stream obtained');
      return stream;
    } catch (err) {
      console.error('❌ Media stream error:', err);
      if (err.name === 'NotReadableError' || err.name === 'AbortError') {
        console.log('🎤 Falling back to audio only...');
        return await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          }
        });
      }
      throw err;
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const createCallSession = async (code, signalData) => {
    console.log('📝 Creating call session...', { code });
    return await addDoc(collection(db, 'calls'), {
      code,
      taskId,
      from: currentUser.id,
      to: otherUser.id,
      signalData,
      type: 'offer',
      status: 'pending',
      timestamp: new Date().toISOString()
    });
  };

  const startCall = async () => {
    console.log('🟢 Starting call as initiator...');
    try {
      const mediaStream = await getMediaStream();
      setStream(mediaStream);
      if (myVideo.current) {
        myVideo.current.srcObject = mediaStream;
      }

      const newPeer = new Peer({
        initiator: true,
        trickle: false,
        stream: mediaStream,
        ...peerConfig
      });

      newPeer.on('signal', async data => {
        console.log('📡 Generated offer signal');
        const code = Math.random().toString(36).substring(2);
        setCallCode(code);
        await createCallSession(code, data);
      });

      newPeer.on('connect', () => {
        console.log('🤝 Peer connection established');
        setIsConnected(true);
        setCallStatus('Connected');
        setIsCallActive(true);
        startTimer();
      });

      newPeer.on('stream', remoteStream => {
        console.log('📺 Received remote stream');
        if (remoteVideo.current) {
          remoteVideo.current.srcObject = remoteStream;
        }
      });

      setPeer(newPeer);
      peerRef.current = newPeer;

    } catch (err) {
      console.error('❌ Error starting call:', err);
      setCallStatus('Failed to start call');
    }
  };

  const joinCall = async () => {
    console.log('🔵 Joining call with code:', connectionCode);
    try {
      const mediaStream = await getMediaStream();
      setStream(mediaStream);
      if (myVideo.current) {
        myVideo.current.srcObject = mediaStream;
      }

      const callQuery = query(
        collection(db, 'calls'),
        where('code', '==', connectionCode),
        where('type', '==', 'offer')
      );

      const snapshot = await getDocs(callQuery);
      const callData = snapshot.docs[0]?.data();

      if (!callData) {
        console.error('❌ Invalid call code');
        setCallStatus('Invalid call code');
        return;
      }

      const newPeer = new Peer({
        initiator: false,
        trickle: false,
        stream: mediaStream,
        ...peerConfig
      });

      newPeer.on('signal', async data => {
        console.log('📡 Generated answer signal');
        await addDoc(collection(db, 'calls'), {
          code: connectionCode,
          taskId,
          from: currentUser.id,
          to: callData.from,
          signalData: data,
          type: 'answer',
          timestamp: new Date().toISOString()
        });
      });

      newPeer.on('connect', () => {
        console.log('🤝 Peer connection established');
        setIsConnected(true);
        setCallStatus('Connected');
        setIsCallActive(true);
        startTimer();
      });

      newPeer.on('stream', remoteStream => {
        console.log('📺 Received remote stream');
        if (remoteVideo.current) {
          remoteVideo.current.srcObject = remoteStream;
        }
      });
      newPeer.on('iceStateChange', (state) => {
        console.log('🧊 ICE State:', state);
      });
      
      newPeer.on('iceCandidate', (candidate) => {
        console.log('🎯 ICE Candidate:', candidate);
      });
      

      newPeer.signal(callData.signalData);
      setPeer(newPeer);
      peerRef.current = newPeer;

    } catch (err) {
      console.error('❌ Error joining call:', err);
      setCallStatus('Failed to join call');
    }
  };

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !isAudioEnabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const endCall = async () => {
    console.log('🔴 Ending call...');
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const code = callCode || connectionCode;
    if (code) {
      const callQuery = query(collection(db, 'calls'), where('code', '==', code));
      const snapshot = await getDocs(callQuery);
      await Promise.all(
        snapshot.docs.map(doc => 
          updateDoc(doc.ref, { 
            status: 'ended',
            endedAt: new Date().toISOString()
          })
        )
      );
    }

    setIsCallActive(false);
    setIsConnected(false);
    setStream(null);
    setPeer(null);
    setCallCode('');
    setConnectionCode('');
    setCallStatus('');
    setCallDuration(0);

    navigate(`/dashboard/chat/${taskId}`);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="grid grid-cols-2 gap-4 w-full max-w-4xl">
        <div className="relative aspect-video">
          <video
            ref={myVideo}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
            You ({currentUser?.fullName || currentUser?.clientName})
          </div>
        </div>

        <div className="relative aspect-video">
          <video
            ref={remoteVideo}
            autoPlay
            playsInline
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
            {otherUser?.username || otherUser?.clientName || 'Remote User'}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-4">
        {callStatus && (
          <div className={`text-sm ${callStatus === 'Connected' ? 'text-green-500' : 'text-red-500'}`}>
            {callStatus}
          </div>
        )}
        
        {callDuration > 0 && (
          <div className="text-white">
            Duration: {formatDuration(callDuration)}
          </div>
        )}

        <div className="flex gap-4">
          {!isCallActive ? (
            <>
              <button
                onClick={startCall}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
              >
                <PhoneIcon className="h-5 w-5" />
                Start Call
              </button>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={connectionCode}
                  onChange={(e) => setConnectionCode(e.target.value)}
                  placeholder="Enter call code"
                  className="px-4 py-2 rounded-lg border text-black"
                />
                <button
                  onClick={joinCall}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
                >
                  Join Call
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={endCall}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
            >
              <PhoneXMarkIcon className="h-5 w-5" />
              End Call
            </button>
          )}
        </div>

        {callCode && !isCallActive && (
          <div className="mt-4 bg-white p-4 rounded-lg">
            <p className="text-center text-gray-700">Share this code to join:</p>
            <p className="text-xl font-bold text-gray-900 mt-2">{callCode}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;