import {
  createSlice
} from '@reduxjs/toolkit'

import {
  PLAIN
} from "/imports/other/constants";

export const metadataSlice = createSlice( {
  name: 'metadata',
  initialState: {
    value: {
      layout: PLAIN,
    },
  },
  reducers: {
    setAllMetadata: ( state, action ) => {
      state.value = action.payload
    },
    setLayout: ( state, action ) => {
      state.value = {
        ...state.value,
        layout: action.payload,
      }
    },
  },
} )

export const {
  setAllMetadata,
  setLayout,
} = metadataSlice.actions

export default metadataSlice.reducer