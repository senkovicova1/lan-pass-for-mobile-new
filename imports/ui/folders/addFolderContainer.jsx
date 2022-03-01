import React from 'react';

import {
  useTracker
} from 'meteor/react-meteor-data';

import FolderForm from '/imports/ui/folders/folderForm';

import {
  listPasswordsInFolderStart
} from "/imports/other/navigationLinks";

import {
  str2ab,
  ab2str,
  generateKey,
  importKeyAndEncrypt
} from '/imports/other/helperFunctions';

export default function AddFolderContainer( props ) {

  const {
    history
  } = props;

  const currentUser = useTracker( () => Meteor.user() );


  async function addNewFolder( name, users, dbUsers ) {

    const iv = window.crypto.getRandomValues( new Uint8Array( 12 ) );
    const algorithm = {
      name: "AES-GCM",
      iv
    };
    const symetricKey = await generateKey();
    const exportedSymetricKey = await window.crypto.subtle.exportKey(
      "raw",
      symetricKey
    );
    const exportedSKBuffer = new Uint8Array( exportedSymetricKey );
    const string = btoa( exportedSKBuffer );

    let key = {};

    for ( var i = 0; i < users.length; i++ ) {
      const user = dbUsers.find( u => u._id === users[ i ]._id );

      const encryptedSymetricKey = await importKeyAndEncrypt( user.publicKey, "async", string );

      key[ user._id ] = encryptedSymetricKey;
    }

    Meteor.call(
      'folders.addFolder',
      name,
      users,
      key,
      algorithm,
      ( err, response ) => {
        if ( err ) {} else if ( response ) {
          props.history.push( `/folders/list/${response}` );
        }
      }
    );

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
