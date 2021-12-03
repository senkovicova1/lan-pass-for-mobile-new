import React, {
  useEffect
} from 'react';

import {
  useSelector
} from 'react-redux';

import moment from 'moment';

import {
  PasswordsCollection
} from '/imports/api/passwordsCollection';

import PasswordForm from './form';

export default function EditPasswordContainer( props ) {

  const {
    match,
    history,
    revealPassword
  } = props;

  const userId = Meteor.userId();
  const encryptionData = useSelector( ( state ) => state.encryptionData.value );
  const folderID = match.params.folderID;
  const folder = useSelector( ( state ) => state.folders.value ).find( f => f._id === folderID );
  const passwords = useSelector( ( state ) => state.passwords.value );

  useEffect( () => {
    if ( folder ) {
      const userCanEdit = folder.users.find( user => user._id === userId ).level <= 1;

      if ( !userCanEdit ) {
        history.goBakc();
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

    async function decryptPassword(text){
      if (!encryptionData){
        return [];
      }
      const symetricKey = await crypto.subtle.importKey(
        "raw",
          encryptionData.symetricKey,
          encryptionData.algorithm,
        true,
        ["encrypt", "decrypt"]
      );

      let decryptedText = null;
      await window.crypto.subtle.decrypt(
        encryptionData.algorithm,
        symetricKey,
        text
      )
      .then(function(decrypted){
        decryptedText = decrypted;
      })
      .catch(function(err){
        console.error(err);
      });
      let dec = new TextDecoder();
      const decryptedValue = dec.decode(decryptedText);
      return decryptedValue;
    }

  async function editPassword( title, folder, username, password, originalPassword, quality, note, expires, expireDate, createdDate, updatedDate, passwordId ) {
    let previousDecryptedPassword = "";
    if (originalPassword){
      previousDecryptedPassword = await decryptPassword(originalPassword)
    }
    let decryptedPassword = password;
    if (typeof password !== "string"){
      previousDecryptedPassword = await decryptPassword(password)
    }
    let newPassword = decryptedPassword;

    if (decryptedPassword === previousDecryptedPassword){
      newPassword = originalPassword;
    } else {
      newPassword = await encryptPassword(newPassword);
    }

    PasswordsCollection.insert( {
      title,
      folder,
      username,
      password: newPassword,
      quality,
      note,
      expires,
      expireDate,
      folder,
      createdDate,
      version: 0,
      updatedDate,
      passwordId,
    }, ( error, _id ) => {
      if ( error ) {
        console.log( error );
      } else {
        history.push( `/folders/${folderID}/${_id}` );
      }
    } );

    const passwordsToUpdate = passwords.filter( pass => [ pass.passwordId, pass._id ].includes( passwordId ) );

    passwordsToUpdate.forEach( ( pass, index ) => {
      if ( pass.version >= 20 ) {
        PasswordsCollection.remove( {
          _id: pass._id
        } );
      } else {
        if ( pass.version === 0 ) {
          PasswordsCollection.update( pass._id, {
            $inc: {
              version: 1
            },
            $set: {
              editedBy: userId
            }
          } );
        } else {
          PasswordsCollection.update( pass._id, {
            $inc: {
              version: 1
            }
          } );
        }
      }
    } );

  }

  const close = () => {
    history.push( `/folders/list/${folderID}` );
  }

  return (
    <PasswordForm
      {...props}
      revealPassword={revealPassword}
      onSubmit={editPassword}
      onCancel={close}
      />
  );
};
