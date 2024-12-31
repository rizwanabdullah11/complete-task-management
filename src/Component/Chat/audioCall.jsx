import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MdCallEnd } from 'react-icons/md';
import { doc, getDoc, setDoc, collection, onSnapshot, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../Firebase';

const servers = {
  iceServers: [
    {
      urls: [
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
      ],
    },
  ],
  iceCandidatePoolSize: 10,
};

const AudioCall = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector(state => state.auth.currentUser);
  const [otherUser, setOtherUser] = useState(null);
  const [task, setTask] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [callDoc, setCallDoc] = useState(null);
  const localAudioRef = useRef();
  const remoteAudioRef = useRef();

  useEffect(() => {
    const fetchInitialData = async () => {
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (taskDoc.exists()) {
        const taskData = taskDoc.data();
        setTask(taskData);
        
        const otherUserId = taskData.client === currentUser.userId 
          ? taskData.assignee 
          : taskData.client;

        const userRef = doc(db, 'users', otherUserId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          setOtherUser(userDoc.data());
        }
      }
    };

    fetchInitialData();
  }, [taskId, currentUser]);

  useEffect(() => {
    if (!otherUser) return;

    const setupCall = async () => {
      try {
        // Initialize streams
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setLocalStream(stream);
        localAudioRef.current.srcObject = stream;

        const remote = new MediaStream();
        setRemoteStream(remote);
        remoteAudioRef.current.srcObject = remote;

        // Initialize peer connection
        const pc = new RTCPeerConnection(servers);
        setPeerConnection(pc);

        // Add tracks to peer connection
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });

        // Handle incoming tracks
        pc.ontrack = (event) => {
          event.streams[0].getTracks().forEach(track => {
            remote.addTrack(track);
          });
        };

        // Create call document
        const newCallDoc = await addDoc(collection(db, 'calls'), {
          taskId,
          caller: currentUser.userId,
          receiver: otherUser.userId,
          status: 'initiating',
          timestamp: new Date().toISOString()
        });
        
        setCallDoc(newCallDoc);

        // Handle ICE candidates
        const offerCandidates = collection(db, `calls/${newCallDoc.id}/offerCandidates`);
        const answerCandidates = collection(db, `calls/${newCallDoc.id}/answerCandidates`);

        pc.onicecandidate = async (event) => {
          if (event.candidate) {
            await addDoc(offerCandidates, event.candidate.toJSON());
          }
        };

        // Create and set offer
        const offerDescription = await pc.createOffer();
        await pc.setLocalDescription(offerDescription);

        await updateDoc(newCallDoc, {
          offer: {
            sdp: offerDescription.sdp,
            type: offerDescription.type,
          }
        });

        // Listen for answer
        onSnapshot(newCallDoc, (snapshot) => {
          const data = snapshot.data();
          if (!pc.currentRemoteDescription && data?.answer) {
            const answerDescription = new RTCSessionDescription(data.answer);
            pc.setRemoteDescription(answerDescription);
          }
        });

        // Listen for remote ICE candidates
        onSnapshot(answerCandidates, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const candidate = new RTCIceCandidate(change.doc.data());
              pc.addIceCandidate(candidate);
            }
          });
        });

        // Handle connection state changes
        pc.onconnectionstatechange = () => {
          if (pc.connectionState === 'disconnected') {
            handleEndCall();
          }
        };

      } catch (error) {
        console.error('Error in setupCall:', error);
        navigate(`/dashboard/chat/${taskId}`);
      }
    };

    setupCall();

    return () => cleanup();
  }, [otherUser]);

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection) {
      peerConnection.close();
    }
    if (callDoc) {
      updateDoc(callDoc, { status: 'ended' });
    }
  };

  const handleEndCall = async () => {
    cleanup();
    navigate(`/dashboard/chat/${taskId}`);
  };

  return (
    <div className="h-screen bg-gray-900 flex items-center justify-center">
      <audio ref={localAudioRef} autoPlay muted />
      <audio ref={remoteAudioRef} autoPlay />
      
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <div className="flex justify-center space-x-12">
            {/* Current User Avatar */}
            <div className="text-center">
              <div className="w-24 h-24 bg-green-500 rounded-full mx-auto flex items-center justify-center">
                <span className="text-3xl text-white">
                  {currentUser?.name?.[0]?.toUpperCase() || 'C'}
                </span>
              </div>
              <p className="mt-2 text-white">{currentUser?.name || 'Current User'}</p>
              <p className="text-green-500 text-sm">
                {peerConnection?.connectionState || 'Connecting...'}
              </p>
            </div>

            {/* Other User Avatar */}
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-600 rounded-full mx-auto flex items-center justify-center">
                <span className="text-3xl text-white">
                  {otherUser?.name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <p className="mt-2 text-white">{otherUser?.name || 'User'}</p>
              <p className="text-gray-400 text-sm">In Call</p>
            </div>
          </div>
        </div>

        {/* Call Controls */}
        <div className="flex justify-center">
          <button
            onClick={handleEndCall}
            className="p-4 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
          >
            <MdCallEnd className="text-white text-2xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioCall;
