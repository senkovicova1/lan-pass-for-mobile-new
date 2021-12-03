import {
  createSlice
} from '@reduxjs/toolkit';

export const encryptionSlice = createSlice( {
  name: 'encryptionData',
  initialState: {
    value: "AAAAAAAAAAAAAAAAAAA",
  },
  reducers: {
    setEncryptionData: ( state, action ) => {
      state.value = action.payload
    },
  },
} )

export const {
  setEncryptionData
} = encryptionSlice.actions

export default encryptionSlice.reducer