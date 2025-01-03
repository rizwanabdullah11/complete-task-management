import React from 'react'
import Router from './Router/appRouter'
// import {useSelector} from 'react-redux'
// import CallNotification from './Component/Chat/videoCall';
const App = () => {

  // const user = useSelector(state=>state.auth.currentUser)
  return (
    <div>
      {/* {user && <CallNotification />} */}
      <Router />
    </div>
  )
}

export default App