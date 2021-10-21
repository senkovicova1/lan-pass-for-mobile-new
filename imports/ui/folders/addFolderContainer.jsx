import React from 'react';

import {
  FoldersCollection
} from '/imports/api/foldersCollection';

import FolderForm from '/imports/ui/folders/folderForm';

import {
  listPasswordsInFolderStart
} from "/imports/other/navigationLinks";

export default function AddFolderContainer( props ) {

  const {
    history
  } = props;

  const addNewFolder = ( name, users ) => {
    FoldersCollection.insert( {
      name,
      users,
    }, ( error, _id ) => {
      if ( error ) {
        console.log( error );
      } else {
        history.push( `/folders/list/${_id}` );
      }
    } );
  }

  const cancel = () => {
    history.push( `` );
  }

  return (
    <FolderForm
      onSubmit={addNewFolder}
      onCancel={cancel}
      />
  );
};
