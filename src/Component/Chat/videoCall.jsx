// At the top with imports
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Peer from 'simple-peer';
import { collection, addDoc, onSnapshot, query, where, getDocs, updateDoc, limit } from 'firebase/firestore';
import { db } from '../Firebase';
import { PhoneIcon, PhoneXMarkIcon } from '@heroicons/react/24/solid';
import { Buffer } from 'buffer';
window.Buffer = Buffer;
window.process = require('process/browser');

const VideoCall = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector(state => state.auth.currentUser);
  const [stream, setStream] = useState(null);
  const [peer, setPeer] = useState(null);
  const [callCode, setCallCode] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [connectionCode, setConnectionCode] = useState('');
  const [isInitiator, setIsInitiator] = useState(false);
  const [callStatus, setCallStatus] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const myVideo = useRef();
  const remoteVideo = useRef();
  const connectionRef = useRef();
  const timerRef = useRef();

  const startTimer = () => {
    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRemoteStream = (remoteStream) => {
    console.log('📡 Remote stream connected');
    if (remoteVideo.current) {
      remoteVideo.current.srcObject = remoteStream;
      remoteVideo.current.play().catch(err => console.log('Remote video play error:', err));
    }
    setIsCallActive(true);
    setCallStatus('Connected');
    startTimer();
  };

  const startCall = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      setStream(mediaStream);
      if (myVideo.current) {
        myVideo.current.srcObject = mediaStream;
      }

      const newPeer = new Peer({
        initiator: true,
        trickle: false,
        stream: mediaStream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      newPeer.on('signal', async (data) => {
        const code = Math.random().toString(36).substring(2);
        setCallCode(code);
        await addDoc(collection(db, 'activeCalls'), {
          code,
          taskId,
          initiator: currentUser.userId,
          status: 'pending',
          createdAt: new Date().toISOString()
        });

        await addDoc(collection(db, 'calls'), {
          code,
          taskId,
          from: currentUser.userId,
          signalData: data,
          type: 'offer',
          timestamp: new Date().toISOString()
        });
      });

      newPeer.on('stream', handleRemoteStream);
      newPeer.on('connect', () => {
        console.log('🤝 Peer connection established');
        setCallStatus('Connected');
      });

      setPeer(newPeer);
      connectionRef.current = newPeer;
      setIsInitiator(true);
    } catch (err) {
      console.error('Error starting call:', err);
      setCallStatus('Failed to start call');
    }
  };

  const joinCall = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      setStream(mediaStream);
      if (myVideo.current) {
        myVideo.current.srcObject = mediaStream;
      }

      const offerQuery = query(
        collection(db, 'calls'),
        where('code', '==', connectionCode),
        where('type', '==', 'offer'),
        limit(1)
      );

      const unsubscribe = onSnapshot(offerQuery, (snapshot) => {
        const offerData = snapshot.docs[0]?.data();
        if (!offerData) return;

        const newPeer = new Peer({
          initiator: false,
          trickle: false,
          stream: mediaStream,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' }
            ]
          }
        });

        newPeer.on('signal', async (signalData) => {
          await addDoc(collection(db, 'calls'), {
            code: connectionCode,
            taskId,
            from: currentUser.userId,
            signalData,
            type: 'answer',
            timestamp: new Date().toISOString()
          });
        });

        newPeer.on('stream', handleRemoteStream);
        newPeer.on('connect', () => {
          console.log('🤝 Peer connection established');
          setCallStatus('Connected');
        });

        newPeer.signal(offerData.signalData);
        setPeer(newPeer);
        connectionRef.current = newPeer;
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Error joining call:', err);
      setCallStatus('Failed to join call');
    }
  };

  useEffect(() => {
    if (isInitiator && peer) {
      const answerQuery = query(
        collection(db, 'calls'),
        where('code', '==', callCode),
        where('type', '==', 'answer'),
        limit(1)
      );

      const unsubscribe = onSnapshot(answerQuery, (snapshot) => {
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (peer && data.from !== currentUser.userId) {
            peer.signal(data.signalData);
          }
        });
      });

      return () => unsubscribe();
    }
  }, [isInitiator, peer, callCode, currentUser.userId]);

  const endCall = async () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
    }
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const code = callCode || connectionCode;
    if (code) {
      const activeCallQuery = query(
        collection(db, 'activeCalls'),
        where('code', '==', code)
      );
      const snapshot = await getDocs(activeCallQuery);
      await Promise.all(
        snapshot.docs.map(doc => 
          updateDoc(doc.ref, { status: 'ended' })
        )
      );
    }

    setIsCallActive(false);
    setStream(null);
    setPeer(null);
    setCallCode('');
    setConnectionCode('');
    setIsInitiator(false);
    setCallStatus('');
    setCallDuration(0);
    
    if (myVideo.current) myVideo.current.srcObject = null;
    if (remoteVideo.current) remoteVideo.current.srcObject = null;

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
            You
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
            Remote User
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
          {!isCallActive && (
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
                  className="px-4 py-2 rounded-lg border"
                />
                <button
                  onClick={joinCall}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
                >
                  Join Call
                </button>
              </div>
            </>
          )}

          {isCallActive && (
            <button
              onClick={endCall}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
            >
              <PhoneXMarkIcon className="h-5 w-5" />
              End Call
            </button>
          )}
        </div>

        {callCode && isInitiator && (
          <div className="mt-4 bg-white p-4 rounded-lg">
            <p className="text-center">Share this code to join:</p>
            <p className="text-xl font-bold mt-2">{callCode}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
