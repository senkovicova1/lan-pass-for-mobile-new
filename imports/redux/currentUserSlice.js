import {
  createSlice
} from '@reduxjs/toolkit';

export const currentUserSlice = createSlice( {
  name: 'currentUserData',
  initialState: {
    value: {
      secretKey: "",
      secretKeyVerified: false,
    },
  },
  reducers: {
    setCurrentUserData: ( state, action ) => {
      state.value = action.payload
    },
  },
} )

export const {
  setCurrentUserData
} = currentUserSlice.actions

export default currentUserSlice.reducer
