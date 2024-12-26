// import React, { useState, useEffect } from 'react';
// import { collection, addDoc, getDocs } from 'firebase/firestore';
// import { db, auth } from '../Firebase';
// import { FaRegCircle } from 'react-icons/fa';
// import { MdArrowForwardIos } from "react-icons/md";
// import { CiCalendar } from "react-icons/ci";
// import CreateClientModal from './clientModal';

// const Client = () => {
//   const [clients, setClients] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const fetchClients = async () => {
//     try {
//       const clientSnapshot = await getDocs(collection(db, "clients"));
//       const clientList = clientSnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));
//       setClients(clientList);
//     } catch (error) {
//       console.error("Error fetching clients:", error);
//     }
//   };

//   const handleCreateClient = async (clientData) => {
//     try {
//       const clientsRef = collection(db, "clients");
//       const newClientData = {
//         ...clientData,
//         createdBy: auth.currentUser?.uid,
//         createdAt: new Date().toISOString(),
//         status: 'active'
//       };

//       await addDoc(clientsRef, newClientData);
//       fetchClients();
//     } catch (error) {
//       console.error("Error adding client:", error);
//     }
//   };

//   useEffect(() => {
//     fetchClients();
//   }, []);

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-bold text-gray-800">Clients Management</h2>
//         <button
//           onClick={() => setIsModalOpen(true)}
//           className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 font-medium"
//         >
//           Create Client
//         </button>
//       </div>

//       <div className="bg-white border-2 border-gray-200 rounded-lg">
//         <table className="w-full table-fixed">
//           <thead>
//             <tr className="border-b">
//               <th className="text-left p-2 text-sm text-gray-600 font-medium w-1/4">Client</th>
//               <th className="text-left p-2 text-sm text-gray-600 font-medium w-1/4">Company</th>
//               <th className="text-left p-2 text-sm text-gray-600 font-medium w-1/4">Email</th>
//               <th className="text-left p-2 text-sm text-gray-600 font-medium w-1/4">Contact #</th>
//               <th className="text-left p-2 text-sm text-gray-600 font-medium w-1/4">Address</th>
//               <th className="text-left p-2 text-sm text-gray-600 font-medium w-1/4">Project Type</th>
//             </tr>
//           </thead>
//           <tbody>
//             {clients.map((client) => (
//               <tr key={client.id} className="border-b last:border-b-0 hover:bg-gray-50">
//                 <td className="p-2">
//                   <div className="flex items-center truncate">
//                     <MdArrowForwardIos className="text-gray-500 mr-2 w-3.5 h-3.5 flex-shrink-0" />
//                     <FaRegCircle className="text-green-500 mr-2 w-3.5 h-3.5 flex-shrink-0" />
//                     <span className="truncate text-xs font-semibold">{client.clientName}</span>
//                   </div>
//                 </td>
//                 <td className="p-2">
//                   <div className="flex items-center gap-2 truncate">
//                     <span className="truncate text-xs">{client.companyName}</span>
//                   </div>
//                 </td>
//                 <td className="p-2">
//                   <div className="text-gray-600 truncate text-xs">
//                     {client.email}
//                   </div>
//                 </td>
//                 <td className="p-2">
//                   <div className="text-gray-600 truncate text-xs">
//                     {client.contactNumber}
//                   </div>
//                 </td>
//                 <td className="p-2">
//                   <div className="text-gray-600 truncate text-xs">
//                     {client.address}
//                   </div>
//                 </td>
//                 <td className="p-2">
//                   <div className="flex items-center gap-2 truncate">
//                     <CiCalendar className="text-gray-500 flex-shrink-0" />
//                     <span className="truncate text-xs">{client.projectType}</span>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <CreateClientModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         onSubmit={handleCreateClient}
//       />
//     </div>
//   );
// };

// export default Client;
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db, auth } from '../Firebase';
import { FaRegCircle } from 'react-icons/fa';
import { MdArrowForwardIos } from "react-icons/md";
import { CiCalendar } from "react-icons/ci";
import CreateClientModal from './clientModal';

const Client = () => {
  const [clients, setClients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchClients = async () => {
    try {
      const clientSnapshot = await getDocs(collection(db, "clients"));
      const clientList = clientSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClients(clientList);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const handleCreateClient = async (clientData) => {
    try {
      const clientsRef = collection(db, "clients");
      const newClientData = {
        ...clientData,
        type: 'client',
        createdBy: auth.currentUser?.uid,
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      await addDoc(clientsRef, newClientData);
      fetchClients();
    } catch (error) {
      console.error("Error adding client:", error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Clients Management</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 font-medium"
        >
          Create Client
        </button>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-lg">
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2 text-sm text-gray-600 font-medium w-1/4">Client</th>
              <th className="text-left p-2 text-sm text-gray-600 font-medium w-1/4">Company</th>
              <th className="text-left p-2 text-sm text-gray-600 font-medium w-1/4">Email</th>
              <th className="text-left p-2 text-sm text-gray-600 font-medium w-1/4">Password</th>
              <th className="text-left p-2 text-sm text-gray-600 font-medium w-1/4">Contact #</th>
              <th className="text-left p-2 text-sm text-gray-600 font-medium w-1/4">Address</th>
              <th className="text-left p-2 text-sm text-gray-600 font-medium w-1/4">Project Type</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="p-2">
                  <div className="flex items-center truncate">
                    <MdArrowForwardIos className="text-gray-500 mr-2 w-3.5 h-3.5 flex-shrink-0" />
                    <FaRegCircle className="text-green-500 mr-2 w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate text-xs font-semibold">{client.clientName}</span>
                  </div>
                </td>
                <td className="p-2">
                  <div className="flex items-center gap-2 truncate">
                    <span className="truncate text-xs">{client.companyName}</span>
                  </div>
                </td>
                <td className="p-2">
                  <div className="text-gray-600 truncate text-xs">
                    {client.email}
                  </div>
                </td>
                <td className="p-2">
                  <div className="text-gray-600 truncate text-xs">
                    {client.password}
                  </div>
                </td>
                <td className="p-2">
                  <div className="text-gray-600 truncate text-xs">
                    {client.contactNumber}
                  </div>
                </td>
                <td className="p-2">
                  <div className="text-gray-600 truncate text-xs">
                    {client.address}
                  </div>
                </td>
                <td className="p-2">
                  <div className="flex items-center gap-2 truncate">
                    <CiCalendar className="text-gray-500 flex-shrink-0" />
                    <span className="truncate text-xs">{client.projectType}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CreateClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateClient}
      />
    </div>
  );
};

export default Client;
