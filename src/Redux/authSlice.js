import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    currentUser: null,
    userType: null,
    userData: null,
  },
  reducers: {
    setClientData: (state, action) => {
      state.currentUser = action.payload;
      state.userType = 'client';
      state.userData = action.payload;
    },
    setAssigneeData: (state, action) => {
      state.currentUser = action.payload;
      state.userType = 'assignee';
      state.userData = action.payload;
    },
    clearUserData: (state) => {
      state.currentUser = null;
      state.userType = null;
      state.userData = null;
    },
  },
});

export const { setClientData, setAssigneeData, clearUserData } = authSlice.actions;
export default authSlice.reducer;
