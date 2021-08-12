import React from 'react';

import {
  FoldersCollection
} from '/imports/api/foldersCollection';

import FolderForm from './folderForm';

import {
  listPasswordsInFolderStart
} from "/imports/other/navigationLinks";

export default function AddFolderContainer( props ) {

  const addNewFolder = ( name, users ) => {
    FoldersCollection.insert( {
       name, users,
    } );
    cancel( );
  }

  const cancel = () => {
    props.history.push(`${listPasswordsInFolderStart}all`);
  }

  return (
        <FolderForm onSubmit={addNewFolder} onCancel={cancel}/>
  );
};
