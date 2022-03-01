import React, {
  useEffect,
  useState
} from 'react';

import {
  useDispatch,
  useSelector
} from 'react-redux';

import {
  useTracker
} from 'meteor/react-meteor-data';

import {
  PasswordsCollection
} from '/imports/api/passwordsCollection';

import {
  setCurrentUserData
} from '/imports/redux/currentUserSlice';

import PasswordForm from './form';
import EnterSecretKey from '/imports/ui/other/enterSecretKey';

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
  importKeyAndEncrypt,
  importKeyAndDecrypt
} from '/imports/other/helperFunctions';

const {
  DateTime
} = require( "luxon" );

export default function EditPasswordContainer( props ) {

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
  const {
    folderID,
    passwordID
  } = match.params;
  const folder = useSelector( ( state ) => state.folders.value ).find( f => f._id === folderID );
  const passwords = useSelector( ( state ) => state.passwords.value );

  const password = useTracker( () => PasswordsCollection.findOne( {
    _id: passwordID
  } ) );

  const [ enteredSecretKey, setEnteredSecretKey ] = useState( "" );
  const [ errorMessage, setErrorMessage ] = useState( "" );

  useEffect( () => {
    if ( folder ) {
      const userCanEdit = folder.users.find( user => user._id === userId ).level <= 1;

      if ( !userCanEdit ) {
        history.goBakc();
      }
    }

  }, [ userId, folder ] );

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

  async function encryptPassword( text ) {

    if ( !folder.algorithm || !folder.key[ userId ] ) {
      return "";
    }

    const privateKey = decryptStringWithXORtoHex( currentUser.profile.privateKey, secretKey );

    const decodedFolderDecryptedKey = await importKeyAndDecrypt( privateKey, "async", folder.key[ userId ] );

    const encryptedPassword = await importKeyAndEncrypt( decodedFolderDecryptedKey, "sync", text, folder.algorithm );

    return encryptedPassword;
  }

  async function decryptPassword( text ) {
    if ( !folder.algorithm || !folder.key[ userId ] ) {
      return "";
    }

    const privateKey = decryptStringWithXORtoHex( currentUser.profile.privateKey, secretKey );

    const decodedFolderDecryptedKey = await importKeyAndDecrypt( privateKey, "async", folder.key[ userId ] );

    const decryptedValue = await importKeyAndDecrypt( decodedFolderDecryptedKey, "sync", text, folder.algorithm );

    return decryptedValue;
  }

  async function editPassword( title, folder, username, password1, originalPassword, passwordWasDecrypted, url, note, expires, expireDate, createdDate, updatedDate, originalPasswordId ) {
    let previousDecryptedPassword = "";
    if ( originalPassword ) {
      previousDecryptedPassword = await decryptPassword( originalPassword );
    }
    let newDecryptedPassword = password1;
    if ( !passwordWasDecrypted ) {
      newDecryptedPassword = await decryptPassword( password1 );
    }
    let newPassword = "";

    if ( newDecryptedPassword === previousDecryptedPassword ) {
      newPassword = originalPassword;
    } else {
      newPassword = await encryptPassword( newDecryptedPassword );
    }

    if (
      title === password.title &&
      folder === password.folder &&
      username === password.username &&
      newDecryptedPassword === previousDecryptedPassword &&
      url === password.url &&
      note === password.note &&
      expires === password.expires &&
      expireDate === password.expireDate
    ) {
      history.push( `/folders/${folderID}/${passwordID}` );
    } else {

      Meteor.call(
        'passwords.handlePasswordUpdate', {
          title,
          folder,
          username,
          password: newPassword,
          url,
          note,
          expires,
          expireDate,
          createdDate,
          updatedBy: userId,
          updatedDate,
          originalPasswordId
        }, {
          ...password,
          updatedBy: userId,
        },
        ( err, response ) => {
          if ( err ) {
            console.log( err );
          } else if ( response ) {
            history.push( `/folders/${folderID}/${response}` );
          }
        }
      );

    }

  }

  const close = () => {
    history.push( `/folders/list/${folderID}` );
  }

  if ( secretKey.length === 0 ) {
    return (
      <EnterSecretKey />
    )
  }

  return (
    <PasswordForm
      {...props}
      password={password}
      revealPassword={revealPassword}
      onSubmit={editPassword}
      onCancel={close}
      />
  );
};
