import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useTracker
} from 'meteor/react-meteor-data';

import {
  useDispatch,
  useSelector
} from 'react-redux';

import PasswordForm from './form';
import EnterSecretKey from '/imports/ui/other/enterSecretKey';

import {
  setCurrentUserData
} from '/imports/redux/currentUserSlice';

import {
  SendIcon
} from "/imports/other/styles/icons";

import {
  Card,
  Form,
  Input,
  LinkButton,
} from "/imports/other/styles/styledComponents";

import {
  str2ab,
  ab2str,
  checkSecretKey,
  importKeyAndDecrypt,
  importKeyAndEncrypt
} from '/imports/other/helperFunctions';

export default function AddPasswordContainer( props ) {

  const dispatch = useDispatch();

  const {
    match,
    history,
    revealPassword
  } = props;

  const userId = Meteor.userId();
  const currentUser = useTracker( () => Meteor.user() );
  const {
    secretKey
  } = useSelector( ( state ) => state.currentUserData.value );
  const folderID = match.params.folderID;
  const folder = useSelector( ( state ) => state.folders.value ).find( f => f._id === folderID );

  const [ enteredSecretKey, setEnteredSecretKey ] = useState( "" );
  const [ errorMessage, setErrorMessage ] = useState( "" );

  useEffect( () => {
    if ( folder ) {
      const userCanAdd = folder.users.find( user => user._id === userId ).level <= 1;

      if ( !userCanAdd ) {
        history.goBack();
      }
    }

  }, [ userId, folder ] );

  const decryptStringWithXORtoHex = ( text, key ) => {
    let c = "";
    let usedKey = key;

    while ( usedKey.length < ( text.length / 2 ) ) {
      usedKey += usedKey;
    }

    for ( var j = 0; j < text.length; j = j + 2 ) {
      let hexValueString = text.substring( j, j + 2 );

      let value1 = parseInt( hexValueString, 16 );
      let value2 = usedKey.charCodeAt( j / 2 );

      let xorValue = value1 ^ value2;
      c += String.fromCharCode( xorValue ) + "";
    }

    return c;
  }


  async function handleSeretKeySend() {
    if ( enteredSecretKey.length > 0 ) {
      const secretKeyCorrect = await checkSecretKey( currentUser.profile.publicKey, currentUser.profile.privateKey, enteredSecretKey );
      if ( secretKeyCorrect ) {
        setErrorMessage( "" );
        dispatch( setCurrentUserData( {
          secretKey: enteredSecretKey
        } ) );
      } else {
        setErrorMessage( "Incorrect secret key!" );
      }
    }
  }

  async function encryptPassword( text ) {

    if ( !folder.algorithm || !folder.key[ userId ] ) {
      return "";
    }

    const privateKey = decryptStringWithXORtoHex( currentUser.profile.privateKey, secretKey );
    const decodedFolderDecryptedKey = await importKeyAndDecrypt( privateKey, "async", folder.key[ userId ] );

    const encryptedPassword = await importKeyAndEncrypt( decodedFolderDecryptedKey, "sync", text, folder.algorithm );

    return encryptedPassword;
  }

  async function addNewPassword( title, folder, username, password, originalPassword, url, note, expires, expireDate, createdDate ) {

    const encryptedPassword = await encryptPassword( password );

    Meteor.call(
      'passwords.create',
      title,
      folder,
      username,
      encryptedPassword,
      url,
      note,
      expires,
      expireDate,
      createdDate,
      createdDate,
      ( err, response ) => {
        if ( err ) {} else if ( response ) {
          history.push( `/folders/${folderID}/${response}` );
        }
      }
    );
  }

  const close = () => {
    history.goBack();
  }

  if ( secretKey.length === 0 ) {
    return (
      <EnterSecretKey />
    )
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
