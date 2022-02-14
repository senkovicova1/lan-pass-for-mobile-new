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

import {
  Modal,
  ModalBody
} from 'reactstrap';

import {
  setCurrentUserData
} from '/imports/redux/currentUserSlice';

import FolderForm from '/imports/ui/folders/folderForm';

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
} from '/imports/other/helperFunctions';

const { DateTime } = require("luxon");

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
  const {secretKey} = useSelector( ( state ) => state.currentUserData.value );

  const [enteredSecretKey, setEnteredSecretKey] = useState("");

  useEffect( () => {
    if ( folder ) {
      const userIsAdmin = folder.users.find( user => user._id === userId ).level === 0;

      if ( !userIsAdmin ) {
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

  async function editFolder ( name, users, dbUsers ) {

      let newKey = {};

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

        let encoder = new TextEncoder();
        let dec = new TextDecoder();
        const decodedFolderDecryptedKey = dec.decode(folderDecryptedKey);

      for (var i = 0; i < users.length; i++) {
        const user = dbUsers.find(u => u._id === users[i]._id);
        if (folder.key[user._id]){
          newKey[user._id] = folder.key[user._id];
        } else {
          const encryptedSymetricKey = await window.crypto.subtle.encrypt(
              {
                name: "RSA-OAEP"
              },
              user.publicKey,
              enc.encode( decodedFolderDecryptedKey )
            );

          newKey[user._id] = window.btoa(ab2str(encryptedSymetricKey));
        }
      }

      Meteor.call(
        'folders.update',
        folderID,
        {
          name,
          users,
          newKey,
        },
        (err, response) => {
        if (err) {
        } else if (response) {
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
          parseInt(DateTime.now().toSeconds()),
          (err, response) => {
          if (err) {
          } else if (response) {
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

    // TODO: spravti zvlast komponentu
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
    <FolderForm
      {...folder}
      onSubmit={editFolder}
      onCancel={cancel}
      onRemove={removeFolder}
      />
  );
};
