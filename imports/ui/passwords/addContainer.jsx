import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useSelector
} from 'react-redux';

import {
  useTracker
} from 'meteor/react-meteor-data';

import {
  PasswordsCollection
} from '/imports/api/passwordsCollection';

import PasswordForm from './form';

export default function AddPasswordContainer( props ) {

  const {
    match,
    history,
    revealPassword
  } = props;

  const userId = Meteor.userId();
  const encryptionData = useSelector( ( state ) => state.encryptionData.value );
  const folderID = match.params.folderID;
  const folder = useSelector( ( state ) => state.folders.value ).find( f => f._id === folderID );

  useEffect( () => {
    if ( folder ) {
      const userCanAdd = folder.users.find( user => user._id === userId ).level <= 1;

      if ( !userCanAdd ) {
        history.goBack();
      }
    }

  }, [ userId, folder ] );

  async function encryptPassword(text){

    const symetricKey = await crypto.subtle.importKey(
      "raw",
        encryptionData.symetricKey,
        encryptionData.algorithm,
      true,
      ["encrypt", "decrypt"]
    );

    let encoder = new TextEncoder();
    let encryptedPassword = await crypto.subtle.encrypt(
        encryptionData.algorithm,
        symetricKey,
        encoder.encode( text )
    );

    return new Uint8Array(encryptedPassword);
  }

  async function addNewPassword ( title, folder, username, password, originalPassword, quality, note, expires, expireDate, createdDate ){

    const encryptedPassword = await encryptPassword(password);

    PasswordsCollection.insert( {
      title,
      username,
      password: encryptedPassword,
      quality,
      note,
      expires,
      expireDate,
      folder,
      createdDate,
      version: 0,
      updatedDate: createdDate,
    }, ( error, _id ) => {
      if ( error ) {
        console.log( error );
      } else {
        history.push( `/folders/${folderID}/${_id}` );
      }
    } );
  }

  const close = () => {
    history.goBack();
  }

  return (
    <PasswordForm
      {...props}
      revealPassword={revealPassword}
      onSubmit={addNewPassword}
      onCancel={close}
      />
  );
};
