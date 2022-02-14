import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useTracker } from 'meteor/react-meteor-data';

import {
  useDispatch,
  useSelector
} from 'react-redux';

import PasswordForm from './form';

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
  const { secretKey } = useSelector( ( state ) => state.currentUserData.value );
  const folderID = match.params.folderID;
  const folder = useSelector( ( state ) => state.folders.value ).find( f => f._id === folderID );

  const [enteredSecretKey, setEnteredSecretKey] = useState("");

  useEffect( () => {
    if ( folder ) {
      const userCanAdd = folder.users.find( user => user._id === userId ).level <= 1;

      if ( !userCanAdd ) {
        history.goBack();
      }
    }

  }, [ userId, folder ] );

      const decryptStringWithXORtoHex = (text, key) => {
        let c = "";
        let usedKey = key;

        while (usedKey.length < (text.length/2)) {
             usedKey += usedKey;
        }

        for (var j = 0; j < text.length; j = j+2) {
          let hexValueString = text.substring(j, j+2);

          let value1 = parseInt(hexValueString, 16);
          let value2 = usedKey.charCodeAt(j/2);

          let xorValue = value1 ^ value2;
          c += String.fromCharCode(xorValue) + "";
        }

        return c;
      }

  async function encryptPassword(text){

        if (!folder.algorithm || !folder.key[userId]){
          return "";
        }

        const privateKey = decryptStringWithXORtoHex(currentUser.profile.privateKey, secretKey);

        const importedPrivateKey = await window.crypto.subtle.importKey(
          "pkcs8",
          str2ab(window.atob(privateKey)),
            {
              name: "RSA-OAEP",
              hash: "SHA-256"
            },
          true,
          ["decrypt"]
        );

        const folderDecryptedKey = await window.crypto.subtle.decrypt(
          {
            name: "RSA-OAEP",
            modulusLength: 4096,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256"
          },
            importedPrivateKey,
            str2ab(window.atob(folder.key[userId])),
          );

          let dec = new TextDecoder();
          const decodedFolderDecryptedKey = dec.decode(folderDecryptedKey);

        const importedFolderKey = await crypto.subtle.importKey(
          "raw",
            new Uint8Array(atob(decodedFolderDecryptedKey).split(',')),
            folder.algorithm,
          true,
          ["encrypt", "decrypt"]
        );

        let encoder = new TextEncoder();
        let encryptedPassword = await crypto.subtle.encrypt(
            folder.algorithm,
            importedFolderKey,
            encoder.encode( text )
        );

        return window.btoa(ab2str(encryptedPassword));
  }

  async function addNewPassword ( title, folder, username, password, originalPassword, url, note, expires, expireDate, createdDate){

    const encryptedPassword = await encryptPassword(password);

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
        (err, response) => {
        if (err) {
        } else if (response) {
          history.push( `/folders/${folderID}/${response}` );
        }
      }
      );
  }

  const close = () => {
    history.goBack();
  }

    if (secretKey.length === 0){
      return (

      <Form>

        <Card>

        <section>
          <label htmlFor="secretKey">Secret key</label>
          <span>Please enter your secret key in order to decrypt the password. (Your key will be remembered until you close the window.)</span>
          <div>
            <Input
              type="text"
              id="secretKey"
              name="secretKey"
              value={enteredSecretKey}
              onChange={(e) => {
                setEnteredSecretKey(e.target.value);
              }}
              />
            <LinkButton
              className="icon"
              onClick={(e) => {
                e.preventDefault();
                if (enteredSecretKey.length > 0) {
                    dispatch( setCurrentUserData( { secretKey: enteredSecretKey } ));
                }
              }}
              >
              <img className="icon" src={SendIcon} alt="Send" />
            </LinkButton>
          </div>
        </section>

      </Card>

    </Form>
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
