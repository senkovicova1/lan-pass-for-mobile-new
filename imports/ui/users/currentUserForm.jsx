import React, {
  useState,
  useEffect,
} from 'react';

import { useTracker } from 'meteor/react-meteor-data';

import {
  useDispatch,
  useSelector
} from 'react-redux';

import { MetaCollection } from '/imports/api/metaCollection';

import {
  PasswordsCollection
} from '/imports/api/passwordsCollection';

import {
  FoldersCollection
} from '/imports/api/foldersCollection';

import {
  PreviousPasswordsCollection
} from '/imports/api/previousPasswordsCollection';

import {
  setCurrentUserData
} from '/imports/redux/currentUserSlice';

import {
  isEmail,
  uint8ArrayToImg,
  str2ab,
  ab2str,
  generateKey,
  generateKeyPairForUser
} from '/imports/other/helperFunctions';

import {
  PencilIcon,
  BackIcon,
  DeleteIcon
} from "/imports/other/styles/icons";

import {
  Form,
  Input,
  Card,
  CommandRow,
  BorderedLinkButton,
  BorderedFullButton,
} from "/imports/other/styles/styledComponents";

export default function UserForm( props ) {

  const dispatch = useDispatch();

  const {
    _id: userId,
    user,
    onSubmit,
    onRemove,
    onCancel,
    isSignIn,
    openLogIn,
    errorMessage
  } = props;

  const currentUser = useTracker( () => Meteor.user() );
  const encryptionData = useSelector( ( state ) => state.encryptionData.value );
  const {privateKey} = useSelector( ( state ) => state.currentUserData.value );

  const [ name, setName ] = useState( "" );
  const [ surname, setSurname ] = useState( "" );
  const [ email, setEmail ] = useState( "" );
  const [ avatar, setAvatar ] = useState( {
    name: "",
    buffer: null,
    img: null
  } );
  const [ key, setKey ] = useState( "" );

  const [ generatedPrivateKey, setGeneratedPrivateKey ] = useState( "" );

  const [ errors, setErrors ] = useState( [] );

  const { myFolders, foldersLoading } = useTracker(() => {
    const noDataAvailable = { myFolders: [], foldersLoading: true };
    if (!Meteor.user()) {
      return noDataAvailable;
    }
    const handler = Meteor.subscribe('folders');

    if (!handler.ready()) {
      return noDataAvailable;
    }

    const myFolders = FoldersCollection.find({
      users: {
        $elemMatch: {
          _id: userId
        }
      },
    }, {
      sort: {name: 1}
    }).fetch();

    return { myFolders, foldersLoading: false };
  });

  const { passwords, passwordsLoading } = useTracker(() => {
    const noDataAvailable = { passwords: [], passwordsLoading: true};
    if (!Meteor.user()) {
      return noDataAvailable;
    }
    const handler = Meteor.subscribe('passwords');

    if (!handler.ready() || myFolders.length === 0) {
      return noDataAvailable;
    }

    const passwords = PasswordsCollection.find(
       {
         folder: {
           $in: myFolders.map( folder => folder._id )
         }
       }).fetch();

    return { passwords, passwordsLoading: false };
  });

  const { previousVersions, prevPasswordsLoading } = useTracker(() => {
    const noDataAvailable = { previousVersions: [], prevPasswordsLoading: false };
    if (!Meteor.user()) {
      return noDataAvailable;
    }
    const handler = Meteor.subscribe('previousPasswords');

    if (!handler.ready()) {
      return noDataAvailable;
    }

    const previousVersions = PreviousPasswordsCollection.find(
       {
         folder: {
           $in: myFolders.map( folder => folder._id )
         }
       }).fetch()

    return { previousVersions, prevPasswordsLoading: false };
  });

  useEffect( () => {
    if ( user?.name ) {
      setName( user.name );
    } else {
      setName( "" );
    }
    if ( user?.surname ) {
      setSurname( user.surname );
    } else {
      setSurname( "" );
    }
    if ( user?.avatar ) {
      const img = uint8ArrayToImg( user.avatar );
      setAvatar( {
        name: "",
        buffer: user.avatar,
        img
      } );
    } else {
      setAvatar( {
        name: "",
        buffer: null,
        img: null
      } );
    }
  }, [ user ] );

  const encryptStringWithXORtoHex = (text, key) => {
    let c = "";
    let usedKey = key;

    while (usedKey.length < text.length) {
         usedKey += usedKey;
    }

    for (var i = 0; i < text.length; i++) {
      let value1 = text[i].charCodeAt(0);
      let value2 = usedKey[i].charCodeAt(0);

      let xorValue = value1 ^ value2;

      let xorValueAsHexString = xorValue.toString("16");

      if (xorValueAsHexString.length < 2) {
          xorValueAsHexString = "0" + xorValueAsHexString;
      }

      c += xorValueAsHexString;
    }

    return c;
  }

  const decryptStringWithXORtoHex = (text) => {
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


  async function handleEncryption(){
    if (ley.length > 20 || key.length < 10){
      return;
    }
    const keyPair = await generateKeyPairForUser();

    const exportedPublicKey = await window.crypto.subtle.exportKey(
      "spki",
      keyPair.publicKey
    );
    const exportedPublicAsString = ab2str(exportedPublicKey);
    //save this to DB
    const exportedPublicAsBase64 = window.btoa(exportedPublicAsString);

    const exportedPrivateKey = await window.crypto.subtle.exportKey(
      "pkcs8",
      keyPair.privateKey
    );
    const exportedPrivateAsString = ab2str(exportedPrivateKey);
    //encrypt with key and save to db
    const exportedPrivateAsBase64 = window.btoa(exportedPrivateAsString);

    const encryptedEPAsB64 = encryptStringWithXORtoHex(exportedPrivateAsBase64);

    Meteor.users.update(userId, {
      $set: {
        "profile.publicKey": exportedPublicAsBase64,
        "profile.privateKey": encryptedEPAsB64,
      }
    }, (error) => {
      if (error){
        console.log(error);
      }
    });

    let updatedFolders = [];

    const publicKey = await window.crypto.subtle.importKey(
      "spki",
      str2ab(window.atob(exportedPublicAsBase64)),
        {
          name: "RSA-OAEP",
          hash: "SHA-256"
        },
      true,
      ["encrypt"]
    );

    let enc = new TextEncoder();

    for (var i = 0; i < myFolders.length; i++) {
      updatedFolders.push(myFolders[i]);
      const iv = window.crypto.getRandomValues( new Uint8Array( 12 ) );
      const algorithm = {
        name: "AES-GCM",
        iv
      };
      const symetricKey = await generateKey();
      const exportedSymetricKey = await window.crypto.subtle.exportKey(
        "raw",
        symetricKey
      );
      const exportedSKBuffer = new Uint8Array(exportedSymetricKey);
      const string = btoa(exportedSKBuffer);

      updatedFolders[i].symetricKey = string;
      updatedFolders[i].key = {};

      const encryptedSymetricKey = await window.crypto.subtle.encrypt(
          {
            name: "RSA-OAEP"
          },
          publicKey,
          enc.encode( string )
        );

      updatedFolders[i].key[userId] = window.btoa(ab2str(encryptedSymetricKey));
      updatedFolders[i].algorithm = algorithm;
    }

    let updatedPasswords = [];

    for (var i = 0; i < passwords.length; i++) {
      updatedPasswords.push(passwords[i]);

      const decryptedPass = await decryptPassword(passwords[i].password, encryptionData);

      const folder = updatedFolders.find(f => f._id === passwords[i].folder);

      const folderDecryptedKey = await window.crypto.subtle.decrypt(
        {
          name: "RSA-OAEP",
          modulusLength: 4096,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256"
        },
          keyPair.privateKey,
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
      const encryptedPass = await crypto.subtle.encrypt(
          folder.algorithm,
          importedFolderKey,
          encoder.encode( decryptedPass )
      );

      updatedPasswords[i].oldPassword = decryptedPass;
      updatedPasswords[i].password = window.btoa(ab2str(encryptedPass));

      const a = await decryptPassword(
        encryptedPass,
        {
      symetricKey: new Uint8Array(atob(decodedFolderDecryptedKey).split(',')),
       algorithm: folder.algorithm
    },
    folder,
    passwords[i]
    );
    }


        let updatedPreviousPasswords = [];

        for (var i = 0; i < previousVersions.length; i++) {
          updatedPreviousPasswords.push(previousVersions[i]);

          const decryptedPass = await decryptPassword(previousVersions[i].password, encryptionData);

          const folder = updatedFolders.find(f => f._id === previousVersions[i].folder);

          const folderDecryptedKey = await window.crypto.subtle.decrypt(
            {
              name: "RSA-OAEP",
              modulusLength: 4096,
              publicExponent: new Uint8Array([1, 0, 1]),
              hash: "SHA-256"
            },
              keyPair.privateKey,
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
          const encryptedPass = await crypto.subtle.encrypt(
              folder.algorithm,
              importedFolderKey,
              encoder.encode( decryptedPass )
          );

          updatedPreviousPasswords[i].oldPassword = decryptedPass;
          updatedPreviousPasswords[i].password = window.btoa(ab2str(encryptedPass));

          const a = await decryptPassword(
            encryptedPass,
            {
          symetricKey: new Uint8Array(atob(decodedFolderDecryptedKey).split(',')),
           algorithm: folder.algorithm
        },
        );
        }

    for (var i = 0; i < updatedFolders.length; i++) {

            Meteor.call(
              'folders.setKey',
              updatedFolders[i]._id,
              {...updatedFolders[i].key},
              updatedFolders[i].algorithm,
              (err, response) => {
              if (err) {
                console.log(updatedFolders[i], err);
              }
            }
            );

    }

    for (var i = 0; i < updatedPasswords.length; i++) {

            Meteor.call(
              'passwords.update',
              updatedPasswords[i]._id,
              {
                password: updatedPasswords[i].password,
            //    oldPassword: updatedPasswords[i].oldPassword
              },
              (err, response) => {
              if (err) {
                console.log(updatedPasswords[i], err);
              }
            }
            );

    }

    for (var i = 0; i < updatedPreviousPasswords.length; i++) {

            Meteor.call(
              'previousPasswords.update',
              updatedPreviousPasswords[i]._id,
              {
                password: updatedPreviousPasswords[i].password,
      //      oldPassword: updatedPreviousPasswords[i].oldPassword
              },
              (err, response) => {
              if (err) {
                console.log(updatedPreviousPasswords[i], err);
              }
            }
            );

    }

  }

  async function decryptPassword(text, encryptionData){
    if (!encryptionData){
      return "";
    }

    const symetricKey = await crypto.subtle.importKey(
      "raw",
        encryptionData.symetricKey,
        encryptionData.algorithm,
      true,
      ["encrypt", "decrypt"]
    );

    try {

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

    } catch (e) {
      if (e instanceof TypeError) {
      } else {
        console.log(e);
      }
    }

  }

  if (myFolders.length === 0){
    return <div>NO</div>
  }

    const userCanManageUsers = currentUser && currentUser.profile.rights && currentUser.profile.rights.sysAdmin;
    
  return (
    <Form>

        <h2>User profile</h2>

      <Card>

      <section>
        <label htmlFor="name">Name<span style={{color: "red"}}>*</span></label>
        <Input
          error={errors.includes("name") && true}
          id="name"
          name="name"
          placeholder="Enter name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (e.target.value.length > 0){
              setErrors(errors.filter(e => e !== "name"));
            }
          }}
          />
      </section>

      <section>
        <label htmlFor="surname">Surname<span style={{color: "red"}}>*</span></label>
        <Input
          error={errors.includes("surname") && true}
          id="surname"
          name="surname"
          placeholder="Enter surname"
          type="text"
          value={surname}
          onChange={(e) =>  {
            setSurname(e.target.value);
            if (e.target.value.length > 0){
              setErrors(errors.filter(e => e !== "surname"));
            }
          }}
          />
      </section>

      {
        !user &&
        <section>
          <label  htmlFor="email">Email<span style={{color: "red"}}>*</span></label>
          <Input
            error={errors.includes("email") && true}
            name="email"
            id="email"
            placeholder="Enter email"
            type="text"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (isEmail(e.target.value)){
                setErrors(errors.filter(e => e !== "email"));
              }
            }}
            />
        </section>
      }

      <section>
        <label htmlFor="avatar">Avatar</label>
        <div>
          {
            avatar.img &&
            <img src={avatar.img} alt="avatar" width="50" height="50"/>
          }
          <Input
            id="avatar"
            name="avatar"
            type="file"
            value={avatar.name}
            onChange={(e) =>  {
              e.persist();
              var file = e.target.files[0];
              if (!file) return;
              var reader = new FileReader();
              reader.onload = function(event){
                var buffer = new Uint8Array(reader.result);
                const img = uint8ArrayToImg(buffer);
                setAvatar({name: e.target.value, buffer, img});
              }
              reader.readAsArrayBuffer(file);
            }}
            />
        </div>
      </section>

      <section>
        <label htmlFor="key">Key (10-20 characters, A-Z, a-z, 0-9)</label>
        <Input
          error={errors.includes("key") && true}
          id="key"
          name="key"
          placeholder="Enter key"
          type="text"
          value={key}
          onChange={(e) => {
            setKey(e.target.value);
            if (e.target.value.length >= 10 || e.target.value.length <= 20){
              setErrors(errors.filter(e => e !== "key"));
            }
          }}
          />
      </section>

      {
        errorMessage &&
        <p>{errorMessage}</p>
      }

      {
        user &&
        !user.publicKey &&
      <section>
      <BorderedLinkButton
        onClick={(e) => {
          e.preventDefault();
          handleEncryption();
        }}
        >
          Generate key pair
      </BorderedLinkButton>

    </section>
  }

      {

  userCanManageUsers &&
  name === "Anabeth" &&
        <section>
        <button  onClick={() => {
            MetaCollection.remove( {
              _id: encryptionData._id
            } );
          }}
          >
          Delete meta
        </button>

      </section>
    }

    </Card>

      <CommandRow>
        {
          onCancel &&
          <BorderedLinkButton
            font="red"
            onClick={(e) => {
              e.preventDefault();
              onCancel()
            }}
            >
              <img
                src={BackIcon}
                alt=""
                className="icon red"
                />
            Back
          </BorderedLinkButton>
        }
        {
          openLogIn &&
          <BorderedLinkButton
            font="grey"
            onClick={(e) => {
              e.preventDefault();
              openLogIn()
            }}
            >
              <img
                src={BackIcon}
                alt=""
                className="icon start"
                />
            Cancel
          </BorderedLinkButton>
        }
        <BorderedFullButton
          colour=""
          onClick={(e) => {
            e.preventDefault();
            let errors = [];
            if (name.length === 0){
              errors.push("name");
            }
            if (surname.length === 0){
              errors.push("surname");
            }
            if (!user && !isEmail(email)){
              errors.push("email");
            }
            if (name.length > 0 && surname.length > 0 && (user || isEmail(email)) ) {
              onSubmit(
                name,
                surname,
                avatar.buffer,
                user.rights,
              );
            }
            setErrors(errors);
          }}
          >
            <img
              src={PencilIcon}
              alt=""
              className="icon start"
              />
          { isSignIn ? "Sign in" : "Save changes"}
        </BorderedFullButton>
      </CommandRow>

    </Form>
  );
};
