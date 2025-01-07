import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import { db } from '../Firebase';
import { useSelector } from 'react-redux';
import { BsArrowLeft, BsPerson } from 'react-icons/bs';
import { IoSend } from 'react-icons/io5';
import { IoCallOutline } from 'react-icons/io5';

const ChatRoom = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [task, setTask] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [otherUserId, setOtherUserId] = useState(null);
  const messagesEndRef = useRef(null);
  const currentUser = useSelector(state => state.auth.currentUser);

  useEffect(() => {
    const fetchTaskAndUsers = async () => {
      try {
        console.log('Current User:', currentUser);
        const taskDoc = await getDoc(doc(db, 'tasks', taskId));
        if (taskDoc.exists()) {
          const taskData = taskDoc.data();
          console.log('Task Data:', taskData);
          setTask(taskData);
          
          const otherUserId = taskData.client === currentUser.id 
            ? taskData.assignee 
            : taskData.client;
          console.log('Other User ID:', otherUserId);
          
          const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
          if (otherUserDoc.exists()) {
            const otherUserData = { id: otherUserDoc.id, ...otherUserDoc.data() };
            console.log('Other User Data:', otherUserData);
            setOtherUser(otherUserData);
          }
        }
      } catch (error) {
        console.log('Error fetching data:', error);
      }
    };

    if (currentUser?.id && taskId) {
      fetchTaskAndUsers();
    }
  }, [taskId, currentUser]);

  useEffect(() => {
    const chatDocRef = doc(db, 'taskChats', taskId);
    
    const unsubscribe = onSnapshot(chatDocRef, (doc) => {
      if (doc.exists()) {
        const chatData = doc.data();
        setMessages(chatData.messages || []);
        scrollToBottom();
      }
    });

    return () => unsubscribe();
  }, [taskId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !otherUser) return;

    try {
      const chatDocRef = doc(db, 'taskChats', taskId);
      const chatDoc = await getDoc(chatDocRef);

      const messageData = {
        text: newMessage,
        senderId: currentUser.id,
        senderName: currentUser.username || currentUser.clientName,
        senderType: currentUser.userType,
        receiverId: otherUser.id,
        receiverName: otherUser.username || otherUser.clientName,
        receiverType: otherUser.userType,
        timestamp: new Date().toISOString(),
        read: false
      };

      if (chatDoc.exists()) {
        await updateDoc(chatDocRef, {
          messages: arrayUnion(messageData)
        });
      } else {
        await setDoc(chatDocRef, {
          taskId: taskId,
          participants: [currentUser.id, otherUser.id],
          messages: [messageData]
        });
      }
      
      setNewMessage('');
    } catch (error) {
      console.log('Send message error:', error);
    }
  };
  const startCall = () => {
    navigate(`/call/${taskId}/${otherUserId}`);
  };
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="text-gray-600 hover:text-gray-800"
          >
            <BsArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{task?.title}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BsPerson className="w-4 h-4" />
              <span>
                {otherUser?.username || otherUser?.clientName || 'Loading...'}
                {' - '}
                {otherUser?.userType === 'client' ? 'Client' : 'Assignee'}
              </span>
            </div>
          </div>
          <button
              onClick={startCall}
              className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200"
            >
              <IoCallOutline className="text-xl" />
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.senderId === currentUser.id
                  ? 'bg-green-100 text-green-800'
                  : 'bg-white text-gray-800'
              } shadow-sm`}
            >
              <div className="text-xs text-gray-500 mb-1">
                {message.senderId === currentUser.id ? 'You' : message.senderName}
              </div>
              <div className="text-sm break-words">{message.text}</div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(message.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="bg-white border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !otherUser}
            className="bg-green-500 text-white rounded-lg px-4 py-2 hover:bg-green-600 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IoSend className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatRoom;