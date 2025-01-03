import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../Firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import { FiSend } from 'react-icons/fi';
import { BsPerson } from 'react-icons/bs';
import { FaArrowLeft } from 'react-icons/fa';
import { IoCallOutline } from 'react-icons/io5';
import { useSelector } from 'react-redux';

const ChatRoom = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [otherUserId, setOtherUserId] = useState(null);
  const [task, setTask] = useState(null);
  const user = useSelector(state => state.auth.currentUser);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const chatRef = doc(db, 'taskChats', taskId);
    
    const initializeChat = async () => {
      const getTaskRef = doc(db, 'tasks', taskId);
      const getTask = await getDoc(getTaskRef);

      if(getTask.data()) {
        setTask(getTask.data());
        setTaskTitle(getTask.data().title);
        const definetheser = getTask.data()?.client === user.userId ? getTask.data()?.assignee : getTask.data()?.client;
        setOtherUserId(definetheser);

        const chatDoc = await getDoc(chatRef);
        if (!chatDoc.exists()) {
          await setDoc(chatRef, {
            messages: [],
            participants: [user.userId, definetheser],
            taskId: taskId,
            createdAt: new Date().toISOString()
          });
        }
      }
    };

    initializeChat();

    const unsubscribe = onSnapshot(chatRef, (doc) => {
      if (doc.exists()) {
        const chatData = doc.data();
        setMessages(chatData.messages || []);
        scrollToBottom();
      }
    });

    return () => unsubscribe();
  }, [taskId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const chatRef = doc(db, 'taskChats', taskId);
      
      const messageData = {
        text: newMessage,
        sender: user.userId,
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
      };

      await updateDoc(chatRef, {
        messages: arrayUnion(messageData)
      });

      setNewMessage('');
    }
  };

  // const startCall = async () => {
  //   console.log('Starting call...');
    
  //   const otherUserId = task?.client === user.userId ? task?.assignee : task?.client;
    
  //   if (otherUserId && user) {
  //     // Create a new call document
  //     const callData = {
  //       callId: Date.now().toString(),
  //       caller: {
  //         id: user.userId,
  //         name: user.name || 'Unknown User',
  //         type: user.userType
  //       },
  //       receiver: {
  //         id: otherUserId
  //       },
  //       taskId: taskId,
  //       taskTitle: task.title,
  //       status: 'initiating',
  //       timestamp: new Date().toISOString(),
  //       participants: [user.userId, otherUserId]
  //     };
  
  //     // Create call notification
  //     await setDoc(doc(db, 'calls', callData.callId), callData);
      
  //     // Create notification for receiver
  //     await setDoc(doc(db, 'callNotifications', otherUserId), {
  //       ...callData,
  //       status: 'incoming'
  //     });
  
  //     navigate(`/call/${taskId}/${otherUserId}`);
  //   }
  // };
  // Add call status tracking
  const startCall = () => {
    navigate(`/call/${taskId}/${otherUserId}`);
  };
  

  
  

  return (
    <div className="p-4 bg-gray-50 h-screen">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        <div className="bg-white shadow-sm rounded-t-lg">
          <div className="p-4 flex items-center justify-between border-b">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-800"
              >
                <FaArrowLeft />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <BsPerson className="text-gray-600 text-xl" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">{taskTitle || 'Task Chat'}</h2>
                  <span className="text-xs text-gray-500">
                    Chatting with {user.userType === 'client' ? 'Assignee' : 'Client'}
                  </span>
                </div>
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

        <div className="flex-1 bg-gray-50 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.sender === user.userId ? 'flex-row-reverse' : ''}`}>
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <BsPerson className="text-gray-600 text-lg" />
                </div>
              </div>
              <div className={`flex-1 ${message.sender === user ? 'text-right' : ''}`}>
                <div className={`inline-block max-w-[70%] p-3 rounded-lg ${
                  message.sender === user.userId 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white text-gray-800'
                }`}>
                  <p className="text-sm">{message.text}</p>
                  <span className="text-xs opacity-75 mt-1 block">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white p-4 border-t">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message"
              className="flex-1 p-3 bg-gray-50 rounded-lg text-sm focus:outline-none"
            />
            <button
              type="submit"
              className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600"
            >
              <FiSend className="text-lg" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
