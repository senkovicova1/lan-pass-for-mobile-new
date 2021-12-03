import {
  configureStore
} from '@reduxjs/toolkit'
import foldersReducer from './foldersSlice';
import usersReducer from './usersSlice';
import passwordsReducer from './passwordsSlice';
import metadataReducer from './metadataSlice';
import encryptionDataReducer from './encryptionSlice';

export default configureStore( {
  reducer: {
    folders: foldersReducer,
    users: usersReducer,
    passwords: passwordsReducer,
    metadata: metadataReducer,
    encryptionData: encryptionDataReducer,
  },
} )