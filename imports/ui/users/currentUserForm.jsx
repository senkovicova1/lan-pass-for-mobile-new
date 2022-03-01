import React, {
  useState,
  useEffect,
} from 'react';

import {
  useTracker
} from 'meteor/react-meteor-data';

import {
  useDispatch,
  useSelector
} from 'react-redux';

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
  generateKeyPairForUser,
  checkSecretKey
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
  } = props;

  const currentUser = useTracker( () => Meteor.user() );
  const {
    privateKey
  } = useSelector( ( state ) => state.currentUserData.value );

  const [ name, setName ] = useState( "" );
  const [ surname, setSurname ] = useState( "" );
  const [ email, setEmail ] = useState( "" );
  const [ avatar, setAvatar ] = useState( {
    name: "",
    buffer: null,
    img: null
  } );
  const [ currentKey, setCurrentKey ] = useState( "" );
  const [ key1, setKey1 ] = useState( "" );
  const [ key2, setKey2 ] = useState( "" );

  const [ errors, setErrors ] = useState( [] );
  const [ errorMessage, setErrorMessage ] = useState( "" );

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

  async function secretKeyCorrect() {
    if ( currentKey.length > 0 ) {
      const secretKeyCorrect = await checkSecretKey( currentUser.profile.publicKey, currentUser.profile.privateKey, currentKey );
      if ( secretKeyCorrect ) {
        return true;
      }
    }
    return false;
  }

  async function handleSubmit() {
    let errors = [];
    let newErrorMessage = ``;
    if ( name.length === 0 ) {
      errors.push( "name" );
    }
    if ( surname.length === 0 ) {
      errors.push( "surname" );
    }
    if ( !user && !isEmail( email ) ) {
      errors.push( "email" );
    }
    const correctSK = await secretKeyCorrect();
    if ( currentKey.length > 0 && !correctSK ) {
      errors.push( "current_key" );
      newErrorMessage += `Current secret key is incorrect! \n`;
    }
    if ( key1.length > 0 ) {
      if ( key1 !== key2 ) {
        errors.push( "key1" );
        errors.push( "key2" );
        newErrorMessage += `New keys do not match! \n`;
      }
      if ( key1.length === key2.length && ( key1.length < 10 || key1.length > 20 ) ) {
        newErrorMessage += `New keys have incorrect length! \n`;
      } else {
        if ( key1.length < 10 || key1.length > 20 ) {
          newErrorMessage += `The first new key has incorrect length! \n`;
        }
        if ( key2.length < 10 || key2.length > 20 ) {
          newErrorMessage += `The second new key has incorrect length! \n`;
        }
      }
      if ( currentKey.length === 0 ) {
        errors.push( "current_key" );
        newErrorMessage += `You need to enter your current secret key for verification! \n`;
      }
    }
    if ( name.length > 0 && surname.length > 0 && ( user || isEmail( email ) ) && ( ( currentKey.length === 0 && key1.length === 0 && key2.length === 0 ) || ( correctSK && key1.length >= 10 && key1.length <= 20 && key1 === key2 ) ) ) {
      onSubmit(
        name,
        surname,
        avatar.buffer,
        user.rights,
        currentKey,
        key1
      );
    }
    setErrors( errors );
    setErrorMessage( newErrorMessage );
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


        <h3>Change your secret key</h3>

        {
          user.hasSecretKey &&
          <section>
            <label htmlFor="current_key">Current key</label>
            <Input
              error={errors.includes("current_key") && true}
              id="current_key"
              name="current_key"
              placeholder="Enter key"
              type="text"
              value={currentKey}
              onChange={(e) => {
                setCurrentKey(e.target.value);
                if (e.target.value.length >= 10 || e.target.value.length <= 20){
                  setErrors(errors.filter(e => e !== "current_key"));
                }
              }}
              />
          </section>
        }

        {
          user.hasSecretKey &&
          <section>
            <label htmlFor="key1">New key (10-20 characters, A-Z, a-z, 0-9)</label>
            <Input
              error={errors.includes("key1") && true}
              id="key1"
              name="key1"
              placeholder="Enter key"
              type="text"
              value={key1}
              onChange={(e) => {
                setKey1(e.target.value);
                if (e.target.value.length >= 10 || e.target.value.length <= 20){
                  setErrors(errors.filter(e => e !== "key1"));
                }
              }}
              />
          </section>
        }

        {
          user.hasSecretKey &&
          <section>
            <label htmlFor="key2">Repeat new key</label>
            <Input
              error={errors.includes("key2") && true}
              id="key2"
              name="key2"
              placeholder="Enter key"
              type="text"
              value={key2}
              onChange={(e) => {
                setKey2(e.target.value);
                if (e.target.value.length >= 10 || e.target.value.length <= 20){
                  setErrors(errors.filter(e => e !== "key2"));
                }
              }}
              />
          </section>
        }

        {
          errorMessage &&
          <p className='error-message'>{errorMessage}</p>
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
            handleSubmit();
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
