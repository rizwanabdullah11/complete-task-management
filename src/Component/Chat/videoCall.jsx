import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Peer from 'simple-peer';
import { collection, addDoc, onSnapshot, query, where, getDocs, updateDoc, limit, doc, getDoc } from 'firebase/firestore';
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
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [taskData, setTaskData] = useState(null);
  const [otherUserId, setOtherUserId] = useState(null);
  const [remoteUserName, setRemoteUserName] = useState('');
  const myVideo = useRef();
  const remoteVideo = useRef();
  const connectionRef = useRef();
  const timerRef = useRef();

  useEffect(() => {
    const getTaskData = async () => {
      try {
        const taskRef = doc(db, 'tasks', taskId);
        const taskDoc = await getDoc(taskRef);
        
        if (taskDoc.exists()) {
          const data = taskDoc.data();
          setTaskData(data);
          const otherId = currentUser.id === data.client ? data.assignee : data.client;
          setOtherUserId(otherId);
          console.log('Task and user data loaded:', { taskId, otherId });
        }
      } catch (err) {
        console.error('Error fetching task data:', err);
      }
    };

    getTaskData();
  }, [taskId, currentUser]);
  useEffect(() => {
    const getRemoteUserName = async () => {
      if (otherUserId) {
        const userRef = doc(db, 'users', otherUserId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setRemoteUserName(userData.fullName || userData.clientName);
        }
      }
    };
    getRemoteUserName();
  }, [otherUserId]);
  useEffect(() => {
    if (isCallActive) {
      const code = callCode || connectionCode;
      const unsubscribe = onSnapshot(
        query(collection(db, 'activeCalls'), where('code', '==', code)),
        (snapshot) => {
          snapshot.forEach((doc) => {
            if (doc.data().status === 'ended') {
              endCall();
            }
          });
        }
      );
      return () => unsubscribe();
    }
  }, [isCallActive]);
  const getMediaStream = async () => {
    console.log('🎥 Requesting media access...');
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
      console.log('✅ Media access granted successfully');
      setIsVideoEnabled(true);
      return stream;
    } catch (err) {
      console.log(`⚠️ Media access error: ${err.name}`);
      if (err.name === 'NotReadableError' || err.name === 'AbortError') {
        console.log('🎤 Attempting audio-only fallback...');
        const audioStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          }
        });
        console.log('✅ Audio-only stream established');
        setIsVideoEnabled(false);
        return audioStream;
      }
      throw err;
    }
  };

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

  const createCallSession = async (code, signalData) => {
    if (!otherUserId) {
      console.error('Cannot create call: Other user not found');
      return;
    }

    await addDoc(collection(db, 'activeCalls'), {
      code,
      taskId,
      initiator: currentUser.id,
      receiver: otherUserId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      hasVideo: isVideoEnabled
    });

    await addDoc(collection(db, 'calls'), {
      code,
      taskId,
      from: currentUser.id,
      to: otherUserId,
      signalData,
      type: 'offer',
      timestamp: new Date().toISOString()
    });
  };

  const startCall = async () => {
    if (!otherUserId) {
      setCallStatus('Cannot start call: Other user not found');
      return;
    }

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
        await createCallSession(code, data);
      });

      newPeer.on('stream', (remoteStream) => {
        if (remoteVideo.current) {
          remoteVideo.current.srcObject = remoteStream;
          remoteVideo.current.play().catch(err => console.log('Remote video play error:', err));
        }
        setIsCallActive(true);
        setCallStatus('Connected');
        startTimer();
      });

      newPeer.on('connect', () => {
        setCallStatus('Connected');
        startTimer();
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
      const mediaStream = await getMediaStream();
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
            from: currentUser.id,
            to: offerData.from,
            signalData,
            type: 'answer',
            timestamp: new Date().toISOString()
          });
        });

        newPeer.on('stream', (remoteStream) => {
          if (remoteVideo.current) {
            remoteVideo.current.srcObject = remoteStream;
            remoteVideo.current.play().catch(err => console.log('Remote video play error:', err));
          }
          setIsCallActive(true);
          setCallStatus('Connected');
          startTimer();
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
          if (peer && data.from !== currentUser.id) {
            peer.signal(data.signalData);
          }
        });
      });

      return () => unsubscribe();
    }
  }, [isInitiator, peer, callCode, currentUser.id]);

  const endCall = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
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
          updateDoc(doc.ref, { 
            status: 'ended',
            endedAt: new Date().toISOString()
          })
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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video bg-gray-800">
            <video
              ref={myVideo}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
            />
            {!isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center">
                    <span className="text-3xl text-gray-300">
                      {(currentUser.fullName || currentUser.clientName)?.charAt(0)}
                    </span>
                  </div>
                  <span className="mt-3 text-gray-300">Audio Only</span>
                </div>
              </div>
            )}
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
              You ({currentUser.fullName || currentUser.clientName})
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video bg-gray-800">
            <video
              ref={remoteVideo}
              autoPlay
              playsInline
              className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
            />
            {!isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center">
                    <span className="text-3xl text-gray-300">
                      {remoteUserName?.charAt(0)}
                    </span>
                  </div>
                  <span className="mt-3 text-gray-300">Audio Only</span>
                </div>
              </div>
            )}
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
              {remoteUserName || 'Remote User'}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 w-full max-w-xl mx-auto">
        {callStatus && (
          <div className={`text-center mb-4 ${callStatus === 'Connected' ? 'text-emerald-400' : 'text-rose-400'}`}>
            <span className="px-4 py-2 rounded-full bg-gray-800/50 backdrop-blur-sm">
              {callStatus}
              {callDuration > 0 && ` • ${formatDuration(callDuration)}`}
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {!isCallActive && !isInitiator && (
            <div className="flex w-full sm:w-auto gap-3">
              <input
                type="text"
                value={connectionCode}
                onChange={(e) => setConnectionCode(e.target.value)}
                placeholder="Enter call code"
                className="flex-1 px-6 py-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                onClick={joinCall}
                className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <PhoneIcon className="h-5 w-5" />
                Join
              </button>
            </div>
          )}

          {!isCallActive && !connectionCode && (
            <button
              onClick={startCall}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <PhoneIcon className="h-5 w-5" />
              Start Call
            </button>
          )}

          {isCallActive && (
            <button
              onClick={endCall}
              className="px-8 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <PhoneXMarkIcon className="h-5 w-5" />
              End Call
            </button>
          )}
        </div>

        {callCode && isInitiator && (
          <div className="mt-6 bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl text-center">
            <p className="text-gray-300 mb-2">Share this code to join the call</p>
            <p className="text-2xl font-mono font-bold text-white tracking-wider">{callCode}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;