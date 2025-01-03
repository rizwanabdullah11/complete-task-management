import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../Firebase';

const CallNotification = () => {
  const [incomingCall, setIncomingCall] = useState(null);
  const currentUser = useSelector(state => state.auth.currentUser);
  const navigate = useNavigate();

  useEffect(() => {

    
    if (!currentUser?.userId) return;

    const notificationRef = doc(db, 'callNotifications', currentUser.userId);
    
    const unsubscribe = onSnapshot(notificationRef, (doc) => {
      if (doc.exists()) {
        const callData = doc.data();
        if (callData.status === 'incoming') {
          console.log('Incoming call:', {
            from: callData.callerName,
            task: callData.taskTitle
          });
          setIncomingCall(callData);
        } else {
          setIncomingCall(null);
        }
      }
    });

    return () => {
      unsubscribe();
      setIncomingCall(null);
    };
  }, [currentUser]);

  const handleAcceptCall = async () => {
    if (incomingCall) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        await updateDoc(doc(db, 'calls', incomingCall.callId), {
          status: 'accepted'
        });
        
        await updateDoc(doc(db, 'callNotifications', currentUser.userId), {
          status: 'accepted'
        });
        
        navigate(`/call/${incomingCall.taskId}/${incomingCall.caller}`);
      } catch (error) {
        console.error('Error accepting call:', error);
      }
    }
  };

  const handleDeclineCall = async () => {
    if (incomingCall) {
      await updateDoc(doc(db, 'callNotifications', currentUser.userId), {
        status: 'declined'
      });
      setIncomingCall(null);
    }
  };

  if (!incomingCall) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-xl text-white">
            {incomingCall.callerName?.[0]?.toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="font-semibold">Incoming call from</h3>
          <p className="text-gray-600">{incomingCall.callerName}</p>
          <p className="text-sm text-gray-500">{incomingCall.taskTitle}</p>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleAcceptCall}
          className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          Accept
        </button>
        <button
          onClick={handleDeclineCall}
          className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Decline
        </button>
      </div>
    </div>
  );
};

export default CallNotification;
