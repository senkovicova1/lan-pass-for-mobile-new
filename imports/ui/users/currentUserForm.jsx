import React, {
  useState,
  useEffect,
} from 'react';

import { useTracker } from 'meteor/react-meteor-data';

import {
  useSelector
} from 'react-redux';

import { MetaCollection } from '/imports/api/metaCollection';

import {
  PasswordsCollection
} from '/imports/api/passwordsCollection';


import {
  isEmail,
  uint8ArrayToImg
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
  const folders = useSelector( ( state ) => state.folders.value );
  const encryptionData = useSelector( ( state ) => state.encryptionData.value );

  const [ name, setName ] = useState( "" );
  const [ surname, setSurname ] = useState( "" );
  const [ email, setEmail ] = useState( "" );
  const [ avatar, setAvatar ] = useState( {
    name: "",
    buffer: null,
    img: null
  } );
  // const [ password1, setPassword1 ] = useState( '' );
  // const [ password2, setPassword2 ] = useState( '' );

  const [ errors, setErrors ] = useState( [] );

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

  async function generateKey(){
    return window.crypto.subtle.generateKey(
      {
      name: "AES-GCM",
      length: 256
      },
        true,
        ["encrypt", "decrypt"]
    );
  }

  async function createMetadata(){
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
    const exportedKeyBuffer = new Uint8Array(exportedSymetricKey);

    MetaCollection.insert( {
      algorithm,
      symetricKey: exportedKeyBuffer,
    } );
  }

  const allPasswords = useTracker( () => PasswordsCollection.find( {} ).fetch() );

  async function encryptPassword(password){

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
        encoder.encode( password.password )
    );

    PasswordsCollection.update( password._id, {
      $set: {
        password: new Uint8Array(encryptedPassword),
        originalPassword: password.password,
      }
    } );

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


      {
        /*
        false &&
        !user &&
        <section>
          <label htmlFor="password1">Password<span style={{color: "red"}}>*</span></label>
          <Input
            error={errors.includes("password") && true}
            type="password"
            placeholder="Password"
            id="password1"
            name="password1"
            type="password"
            value={password1}
            required
            onChange={e => {
              setPassword1(e.target.value);
              if (e.target.value === password2 && password2.length >= 7){
                setErrors(errors.filter(e => e !== "password"));
              }
            }}
            />
        </section>
        */
      }
      {
        /*
        false &&
        !user &&
        <section>
          <label htmlFor="password2">Repeat password<span style={{color: "red"}}>*</span></label>
          <Input
            error={errors.includes("password") && true}
            type="password"
            placeholder="Repeat password"
            id="password2"
            name="password2"
            type="password"
            value={password2}
            required
            onChange={e => {
              setPassword2(e.target.value);
              if (e.target.value === password1 && password1.length >= 7){
                setErrors(errors.filter(e => e !== "password"));
              }
            }}
            />
        </section>
        */
      }

      {
        errorMessage &&
        <p>{errorMessage}</p>
      }
          
{
  /*
  userCanManageUsers &&
        <section>
        <BorderedLinkButton
          onClick={(e) => {
            e.preventDefault();
            createMetadata();
          }}
          >
            Create metadata
        </BorderedLinkButton>

        <button  onClick={() => {
            MetaCollection.remove( {
              _id: encryptionData._id
            } );
          }}
          >
          Delete meta
        </button>

        <BorderedLinkButton
          onClick={(e) => {
            e.preventDefault();
            allPasswords.forEach((password, i) => {
              encryptPassword(password);
            });
          }}
          >
            Encrypt data
        </BorderedLinkButton>
      </section>
    */}

    </Card>

      <CommandRow>
        {
          onCancel &&
          <BorderedLinkButton
            colour="grey"
            onClick={(e) => {
              e.preventDefault();
              onCancel()
            }}
            >
              <img
                src={BackIcon}
                alt=""
                className="icon start"
                />
            Back
          </BorderedLinkButton>
        }
        {
          openLogIn &&
          <BorderedLinkButton
            colour="grey"
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
        {
          onRemove &&
          false &&
          <BorderedLinkButton
            colour="red"
            onClick={(e) => {
              e.preventDefault();
              onRemove(userId);
              onCancel();
            }}
            >
              <img
                src={DeleteIcon}
                alt=""
                className="icon start"
                />
            Delete
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
            if (name.length > 0 &&surname.length > 0 && (user || isEmail(email))  ) {
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
