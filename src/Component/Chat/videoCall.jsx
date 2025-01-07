import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Peer from 'simple-peer';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../Firebase';
import { BsCameraVideo, BsCameraVideoOff, BsMic, BsMicMute, BsArrowLeft, BsPerson } from 'react-icons/bs';
import { IoCall, IoCallOutline } from 'react-icons/io5';

const VideoCall = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector(state => state.auth.currentUser);
  const [stream, setStream] = useState(null);
  const [peer, setPeer] = useState(null);
  const [callCode, setCallCode] = useState('');
  const [connectionCode, setConnectionCode] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callData, setCallData] = useState(null);
  const [task, setTask] = useState(null);
  const myVideo = useRef();
  const remoteVideo = useRef();
  const timerRef = useRef();

  const peerConfig = {
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    }
  };

  useEffect(() => {
    const fetchTaskAndUser = async () => {
      try {
        console.log('Current User:', currentUser);
        const taskDoc = await getDoc(doc(db, 'tasks', taskId));
        if (taskDoc.exists()) {
          const taskData = taskDoc.data();
          console.log('Task Data:', taskData);
          setTask(taskData);
          
          const otherUserId = taskData.client === currentUser.id ? taskData.assignee : taskData.client;
          console.log('Other User ID:', otherUserId);
          
          const userDoc = await getDoc(doc(db, 'users', otherUserId));
          if (userDoc.exists()) {
            const otherUserData = { id: userDoc.id, ...userDoc.data() };
            console.log('Other User Data:', otherUserData);
            setOtherUser(otherUserData);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (currentUser?.id && taskId) {
      fetchTaskAndUser();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [taskId, currentUser]);

  useEffect(() => {
    if (peer) {
      peer.on('error', err => {
        console.error('Peer connection error:', err);
      });

      peer.on('close', () => {
        console.log('Peer connection closed');
        endCall();
      });
    }

    return () => {
      if (peer) {
        peer.destroy();
      }
    };
  }, [peer]);

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

  const initializeStream = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setStream(mediaStream);
      if (myVideo.current) {
        myVideo.current.srcObject = mediaStream;
      }
      return mediaStream;
    } catch (error) {
      console.error('Media access error:', error);
      return null;
    }
  };

  const startCall = async () => {
    console.log('Starting call...');
    const mediaStream = await initializeStream();
    if (!mediaStream) return;

    const newPeer = new Peer({
      ...peerConfig,
      initiator: true,
      trickle: false,
      stream: mediaStream
    });

    newPeer.on('signal', async data => {
      console.log('Signaling data generated:', data.type);
      const newCallData = {
        taskId,
        initiator: currentUser.id,
        receiver: otherUser.id,
        signal: data,
        status: 'initiated',
        timestamp: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'calls'), newCallData);
      setCallCode(docRef.id);
      setCallData(newCallData);
      console.log('Call initiated with code:', docRef.id);
    });

    newPeer.on('connect', () => {
      console.log('Peer connection established');
      setIsCallActive(true);
    });

    newPeer.on('stream', remoteStream => {
      console.log('Remote stream received');
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = remoteStream;
      }
      startTimer();
    });

    setPeer(newPeer);
  };

  const joinCall = async () => {
    console.log('Joining call...');
    if (!connectionCode) return;

    const mediaStream = await initializeStream();
    if (!mediaStream) return;

    try {
      const callDoc = await getDoc(doc(db, 'calls', connectionCode));
      if (!callDoc.exists()) {
        console.error('Invalid call code');
        return;
      }

      const existingCallData = callDoc.data();
      setCallData(existingCallData);

      const newPeer = new Peer({
        ...peerConfig,
        initiator: false,
        trickle: false,
        stream: mediaStream
      });

      newPeer.on('signal', async data => {
        await updateDoc(doc(db, 'calls', connectionCode), {
          answer: data,
          status: 'connected',
          answeredAt: new Date().toISOString()
        });
      });

      newPeer.on('connect', () => {
        console.log('Peer connection established');
        setIsCallActive(true);
      });

      newPeer.on('stream', remoteStream => {
        console.log('Remote stream received');
        if (remoteVideo.current) {
          remoteVideo.current.srcObject = remoteStream;
        }
        startTimer();
      });

      newPeer.signal(existingCallData.signal);
      setPeer(newPeer);
    } catch (error) {
      console.error('Error joining call:', error);
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
    console.log('Ending call...');
    if (callCode) {
      await updateDoc(doc(db, 'calls', callCode), {
        status: 'ended',
        endedAt: new Date().toISOString()
      });
    }

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (peer) {
      peer.destroy();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setIsCallActive(false);
    setCallDuration(0);
    console.log('Call ended successfully');
    navigate(`/dashboard/chat/${taskId}`);
  };

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
