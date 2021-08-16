import React, {
  useEffect
} from 'react';

import { useSelector } from 'react-redux';
import {
  PasswordsCollection
} from '/imports/api/passwordsCollection';
import moment from 'moment';

import PasswordForm from './passwordForm';

export default function EditPasswordContainer( props ) {

  const {
    match,
    history,
    revealPassword
  } = props;

  const userId = Meteor.userId();
  const folderID = match.params.folderID;
  const folder = useSelector((state) => state.folders.value).find(f => f._id === folderID);
  const passwords = useSelector((state) => state.passwords.value);

  useEffect( () => {
    if (folder){
      const userCanEdit = folder.users.find(user => user._id === userId).level <= 1;

      if ( !userCanEdit ) {
        history.goBakc();
      }
    }

  }, [ userId, folder ] );

  const editPassword = ( title, username, password, quality, note, expires, expireDate, createdDate, updatedDate, passwordId ) => {

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
        updatedDate,
        passwordId,
      }, (error, _id) => {
        if (error){
          console.log(console.error());
        } else {
          history.push(`/folders/${folderID}/${_id}`);
        }
      });

    const passwordsToUpdate = passwords.filter(pass => [pass.passwordId, pass._id].includes(passwordId) );

    passwordsToUpdate.forEach((pass, index) => {
      if (pass.version >= 20){
        PasswordsCollection.remove( {
       _id: pass._id
       } );
      } else {
        if (pass.version === 0) {
          PasswordsCollection.update( pass._id, { $inc: { version: 1 }, $set: {editedBy: userId} } );
        } else {
          PasswordsCollection.update( pass._id, { $inc: { version: 1 } } );
        }
    }
    });

  }

    const close = () => {
      history.push(`/folders/list/${folderID}`);
    }

  return (
        <PasswordForm {...props} revealPassword={revealPassword} onSubmit={editPassword} onCancel={close} />
  );
};
