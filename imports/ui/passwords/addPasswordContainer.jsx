import React, {
  useState,
  useMemo,
  useEffect
} from 'react';
import { useSelector } from 'react-redux';

import {
  PasswordsCollection
} from '/imports/api/passwordsCollection';

import {
  useTracker
} from 'meteor/react-meteor-data';

import PasswordForm from './passwordForm';

export default function AddPasswordContainer( props ) {

  const {
    match,
    history,
    revealPassword
  } = props;

  const userId = Meteor.userId();
  const folderID = match.params.folderID;
  const folder = useSelector((state) => state.folders.value).find(f => f._id === folderID);

  useEffect( () => {
    if (folder){
      const userCanAdd = folder.users.find(user => user._id === userId).level <= 1;

      if ( !userCanAdd ) {
        history.goBack();
      }
    }

  }, [ userId, folder ] );

  const addNewPassword = ( title, username, password, quality, note, expires, expireDate, createdDate ) => {
    PasswordsCollection.insert( {
      title,
      username,
      password,
      quality,
      note,
      expires,
      expireDate,
      folder: match.params.folderID,
      createdDate,
      version: 0,
      updatedDate: createdDate,
    }, (error) => {
      if (error) {
        console.log(error);
      } else {
        history.goBack();
      }
    } );
  }

  const close = () => {
    history.goBack();
  }

  return (
    <PasswordForm {...props} revealPassword={revealPassword} onSubmit={addNewPassword} onCancel={close}/>
  );
};
