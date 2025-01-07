import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Peer from 'simple-peer';
import { db } from '../Firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { BsCameraVideo, BsCameraVideoOff, BsMic, BsMicMute, BsArrowLeft, BsPerson } from 'react-icons/bs';
import { IoCall, IoCallOutline } from 'react-icons/io5';

const VideoCall = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector(state => state.auth.currentUser);
  const [stream, setStream] = useState(null);
  const [peer, setPeer] = useState(null);
  const [callCode, setCallCode] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [connectionCode, setConnectionCode] = useState('');
  const [callStatus, setCallStatus] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callData, setCallData] = useState(null);
  const myVideo = useRef();
  const remoteVideo = useRef();
  const timerRef = useRef();

  const peerConfig = {
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
      ]
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
  useEffect(() => {
    const fetchTaskAndUser = async () => {
      try {
        const taskDoc = await getDoc(doc(db, 'tasks', taskId));
        if (taskDoc.exists()) {
          const taskData = taskDoc.data();
          const otherUserId = taskData.client === currentUser.id ? taskData.assignee : taskData.client;
          
          const userDoc = await getDoc(doc(db, 'users', otherUserId));
          if (userDoc.exists()) {
            setOtherUser({ id: userDoc.id, ...userDoc.data() });
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (currentUser?.id && taskId) {
      fetchTaskAndUser();
    }
  }, [taskId, currentUser]);

  const getMediaStream = async () => {
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
      setIsVideoEnabled(true);
      return stream;
    } catch (err) {
      if (err.name === 'NotReadableError' || err.name === 'AbortError') {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          }
        });
        setIsVideoEnabled(false);
        return audioStream;
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
    await addDoc(collection(db, 'calls'), {
      code,
      taskId,
      from: currentUser.id,
      to: otherUser.id,
      signalData,
      type: 'offer',
      status: 'pending',
      timestamp: new Date().toISOString(),
      hasVideo: isVideoEnabled
    });
  };

  const startCall = async () => {
    try {
      const mediaStream = await getMediaStream();
      setStream(mediaStream);
      myVideo.current.srcObject = mediaStream;

      const newPeer = new Peer({
        initiator: true,
        trickle: false,
        stream: mediaStream,
        ...peerConfig
      });

      newPeer.on('signal', async data => {
        const code = Math.random().toString(36).substring(2);
        setCallCode(code);
        await createCallSession(code, data);
      });

      newPeer.on('stream', remoteStream => {
        remoteVideo.current.srcObject = remoteStream;
        setIsCallActive(true);
        setCallStatus('Connected');
        startTimer();
      });

      setPeer(newPeer);
    } catch (err) {
      console.error('Error starting call:', err);
      setCallStatus('Failed to start call');
    }
  };

  const joinCall = async () => {
    try {
      const mediaStream = await getMediaStream();
      setStream(mediaStream);
      myVideo.current.srcObject = mediaStream;

      const callQuery = query(
        collection(db, 'calls'),
        where('code', '==', connectionCode),
        where('type', '==', 'offer')
      );

      const snapshot = await getDocs(callQuery);
      const callData = snapshot.docs[0]?.data();

      if (!callData) {
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

      newPeer.on('stream', remoteStream => {
        remoteVideo.current.srcObject = remoteStream;
        setIsCallActive(true);
        setCallStatus('Connected');
        startTimer();
      });

      newPeer.signal(callData.signalData);
      setPeer(newPeer);
    } catch (err) {
      console.error('Error joining call:', err);
      setCallStatus('Failed to join call');
    }
  };

  const endCall = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (peer) {
      peer.destroy();
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
    };
  }, []);

  // Your existing JSX return remains the same
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-800"
            >
              <BsArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Video Call</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BsPerson className="w-4 h-4" />
                <span>{otherUser?.username || otherUser?.clientName || 'Loading...'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isCallActive && (
        <div className="bg-white p-6 rounded-lg shadow-sm mx-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={startCall}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <IoCall className="w-5 h-5" />
              Start New Call
            </button>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={connectionCode}
                onChange={(e) => setConnectionCode(e.target.value)}
                placeholder="Enter call code"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
              />
              <button
                onClick={joinCall}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Join Call
              </button>
            </div>
          </div>
          
          {callCode && (
            <div className="mt-4 text-center">
              <p className="text-gray-600">Share this code to join the call:</p>
              <p className="text-xl font-bold text-gray-800 mt-2">{callCode}</p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={myVideo}
            muted
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
            You
          </div>
        </div>
        
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={remoteVideo}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
            {otherUser?.username || otherUser?.clientName}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex justify-center gap-4">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full ${isAudioEnabled ? 'bg-gray-200' : 'bg-red-500 text-white'}`}
          >
            {isAudioEnabled ? <BsMic size={24} /> : <BsMicMute size={24} />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full ${isVideoEnabled ? 'bg-gray-200' : 'bg-red-500 text-white'}`}
          >
            {isVideoEnabled ? <BsCameraVideo size={24} /> : <BsCameraVideoOff size={24} />}
          </button>

          {(isCallActive || (callData && currentUser.id === callData.initiator)) && (
            <button
              onClick={endCall}
              className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600"
            >
              <IoCallOutline size={24} />
            </button>
          )}
        </div>

        {callDuration > 0 && (
          <div className="text-center text-gray-600 mt-2">
            {formatDuration(callDuration)}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
