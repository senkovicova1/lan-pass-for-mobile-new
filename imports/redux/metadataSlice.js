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
      selectedFolder: null,
      usedPassword: null,
      sortBy: "name",
      sortDirection: "asc",
      search: "",
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
    setFolder: ( state, action ) => {
      state.value = {
        ...state.value,
        selectedFolder: action.payload,
      }
    },
    setUsedPassword: ( state, action ) => {
      state.value = {
        ...state.value,
        usedPassword: action.payload,
      }
    },
    setSortBy: ( state, action ) => {
      state.value = {
        ...state.value,
        sortBy: action.payload,
      }
    },
    setSortDirection: ( state, action ) => {
      state.value = {
        ...state.value,
        sortDirection: action.payload,
      }
    },
    setSearch: ( state, action ) => {
      state.value = {
        ...state.value,
        search: action.payload,
      }
    },
  },
} )

export const {
  setAllMetadata,
  setLayout,
  setFolder,
  setUsedPassword,
  setSortBy,
  setSortDirection,
  setSearch
} = metadataSlice.actions

export default metadataSlice.reducer