import React, {
  useState
} from 'react';
import {
  Modal,
  ModalBody
} from 'reactstrap';

import UserForm from './form';

import {
  useDispatch,
} from 'react-redux';

import {
  setFolders
} from '../../redux/foldersSlice';

import {
  setPasswords
} from '../../redux/passwordsSlice';

import {
  PlusIcon
} from "/imports/other/styles/icons";

import {
  Accounts
} from 'meteor/accounts-base';

import {
  BorderedLinkButton
} from '/imports/other/styles/styledComponents';

import {
  ab2str,
  generateKeyPairForUser
} from '/imports/other/helperFunctions';

export default function AddContainer( props ) {

  const dispatch = useDispatch();

  const [ addUserModalOpen, showAddUserModal ] = useState( false );
  const [ privateKey, setPrivateKey ] = useState( "" );

  const toggleAddUserModal = () => showAddUserModal( !addUserModalOpen );


  const encryptStringWithXORtoHex = ( text, key ) => {
    let c = "";
    let usedKey = key;

    while ( usedKey.length < text.length ) {
      usedKey += usedKey;
    }

    for ( var i = 0; i < text.length; i++ ) {
      let value1 = text[ i ].charCodeAt( 0 );
      let value2 = usedKey[ i ].charCodeAt( 0 );

      let xorValue = value1 ^ value2;

      let xorValueAsHexString = xorValue.toString( "16" );

      if ( xorValueAsHexString.length < 2 ) {
        xorValueAsHexString = "0" + xorValueAsHexString;
      }

      c += xorValueAsHexString;
    }

    return c;
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

  async function addNewUser( name, surname, avatar, rights, email, password ) {
    const keyPair = await generateKeyPairForUser();

    const exportedPublicKey = await window.crypto.subtle.exportKey(
      "spki",
      keyPair.publicKey
    );
    const exportedPublicAsString = ab2str( exportedPublicKey );
    //save this to DB
    const exportedPublicAsBase64 = window.btoa( exportedPublicAsString );

    const exportedPrivateKey = await window.crypto.subtle.exportKey(
      "pkcs8",
      keyPair.privateKey
    );
    const exportedPrivateAsString = ab2str( exportedPrivateKey );
    //encrypt with key and save to db
    const exportedPrivateAsBase64 = window.btoa( exportedPrivateAsString );
    const encryptedEPAsB64 = encryptStringWithXORtoHex( exportedPrivateAsBase64, "secretKey" );

    Accounts.createUser( {
      password,
      email.trim(),
      profile: {
        name,
        surname,
        avatar,
        rights,
        hasSecretKey: false,
        publicKey: exportedPublicAsBase64,
        privateKey: encryptedEPAsB64,
      }
    }, ( error ) => {
      if ( error ) {
        console.log( error );
      } else {

        dispatch( setFolders( [] ) );
        dispatch( setPasswords( [] ) );

        setPrivateKey( true );

        //props.history.push("/folders/add");
        //  showAddUserModal( false );
      }
    } );


  };

  const closeModal = () => {
    showAddUserModal( false );
  }

  return (
    <div style={{borderBottom: "0px"}}>
      <BorderedLinkButton onClick={toggleAddUserModal} fit={true}>
        <img
          className="icon"
          style={{marginRight: "0.6em"}}
          src={PlusIcon}
          alt=""
          />
        User
      </BorderedLinkButton>
      <Modal isOpen={addUserModalOpen} toggle={toggleAddUserModal}>
        <ModalBody>
          <UserForm
            title={"Add user"}
            privateKey={privateKey}
            onSubmit={addNewUser}
            onCancel={closeModal}
            />
        </ModalBody>
      </Modal>
    </div>
  );
};
