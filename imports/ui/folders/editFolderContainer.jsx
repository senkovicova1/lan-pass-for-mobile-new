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

import {
  Modal,
  ModalBody
} from 'reactstrap';

import {
  setCurrentUserData
} from '/imports/redux/currentUserSlice';

import FolderForm from '/imports/ui/folders/folderForm';
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
  listPasswordsInFolderStart,
} from "/imports/other/navigationLinks";

import {
  str2ab,
  ab2str,
  checkSecretKey,
  importKeyAndDecrypt
} from '/imports/other/helperFunctions';

const {
  DateTime
} = require( "luxon" );

export default function EditFolderContainer( props ) {

  const dispatch = useDispatch();

  const {
    match,
    history
  } = props;

  const folderID = match.params.folderID;
  const folders = useSelector( ( state ) => state.folders.value );
  const folder = useMemo( () => {
    return folders.find( folder => folder._id === folderID );
  }, [ folders, folderID ] );

  const userId = Meteor.userId();
  const currentUser = useTracker( () => Meteor.user() );
  const {
    secretKey
  } = useSelector( ( state ) => state.currentUserData.value );

  const [ enteredSecretKey, setEnteredSecretKey ] = useState( "" );
  const [ errorMessage, setErrorMessage ] = useState( "" );

  useEffect( () => {
    if ( folder ) {
      const userIsAdmin = folder.users.find( user => user._id === userId ).level === 0;

      if ( !userIsAdmin ) {
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

  async function editFolder( name, users, dbUsers ) {

    let newKey = {};

    const privateKey = decryptStringWithXORtoHex( currentUser.profile.privateKey, secretKey );

    const decodedFolderDecryptedKey = importKeyAndDecrypt( privateKey, "async", folder.key[ userId ] );

    let enc = new TextEncoder();
    for ( var i = 0; i < users.length; i++ ) {
      const user = dbUsers.find( u => u._id === users[ i ]._id );
      if ( folder.key[ user._id ] ) {
        newKey[ user._id ] = folder.key[ user._id ];
      } else {

        const importedKey = await window.crypto.subtle.importKey(
          "spki",
          str2ab( window.atob( user.publicKey ) ), {
            name: "RSA-OAEP",
            hash: "SHA-256"
          },
          true,
                [ "encrypt" ]
        );

        const encryptedSymetricKey = await window.crypto.subtle.encrypt( {
            name: "RSA-OAEP"
          },
          importedKey,
          enc.encode( decodedFolderDecryptedKey )
        );

        newKey[ user._id ] = window.btoa( ab2str( encryptedSymetricKey ) );
      }
    }

    Meteor.call(
      'folders.update',
      folderID, {
        name,
        users,
        newKey,
      },
      ( err, response ) => {
        if ( err ) {} else if ( response ) {
          props.history.push( `/folders/list/${folderID}` );
        }
      }
    );

  };

  const removeFolder = ( folderId ) => {
    if ( window.confirm( "Are you sure you want to remove this folder? Note: Folder will be moved to the \"Deleted fodlers\" section." ) ) {

      Meteor.call(
        'folders.deleteFolder',
        folderID,
        parseInt( DateTime.now().toSeconds() ),
        ( err, response ) => {
          if ( err ) {} else if ( response ) {
            props.history.push( `/folders/list/${folderId}` );
          }
        }
      );

      props.history.goBack();

    }
  }

  const cancel = () => {
    props.history.goBack();
  }

  if ( secretKey.length === 0 ) {
    return (
      <EnterSecretKey />
    )
  }

  return (
    <FolderForm
      {...folder}
      onSubmit={editFolder}
      onCancel={cancel}
      onRemove={removeFolder}
      />
  );
};
