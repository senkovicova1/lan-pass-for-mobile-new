import React, {
  useState,
  useEffect,
} from 'react';

import {
  useTracker
} from 'meteor/react-meteor-data';

import {
  PencilIcon,
  SendIcon,
  BackIcon,
  DeleteIcon
} from "/imports/other/styles/icons";

import {
  Form,
  Input,
  LoginContainer,
  ButtonRow,
  BorderedLinkButton,
  BorderedFullButton,
} from "/imports/other/styles/styledComponents";

const allRights = [
  {
    label: "System admin",
    value: "sysAdmin",
  }
]

export default function CreateSecretKey( props ) {

  const currentUser = useTracker( () => Meteor.user() );

  const [ key1, setKey1 ] = useState( "" );
  const [ key2, setKey2 ] = useState( "" );

  const [ errors, setErrors ] = useState( [] );


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

  const handleSecretKeyCreations = () => {
    if ( !currentUser || currentUser.profile.hasSecretKey ) {
      return;
    }
    const decryptedPrivateKey = decryptStringWithXORtoHex( currentUser.profile.privateKey, "secretKey" );

    const encryptedPrivateKey = encryptStringWithXORtoHex( decryptedPrivateKey, key1 );

    Meteor.users.update( currentUser._id, {
      $set: {
        "profile.privateKey": encryptedPrivateKey,
        "profile.hasSecretKey": true,
      },
    }, ( error ) => {
      if ( error ) {
        console.log( error );
      } else {
        props.history.push( "" );
      }
    } );

  }

  return (
    <LoginContainer>

      <div>
        <Form columns={true}>

          <h2>Create secret key</h2>
          <span style={{display: "block"}}>This key will be used to encrypt and decrypt your passwords.</span>
          <span className="error-message">Please remember this key, it will not be saved in the database and cannot be retrieved.</span>

          <section>
            <label htmlFor="key1">Key (10-20 characters, A-Z, a-z, 0-9)</label>
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

          <section>
            <label htmlFor="key2">Repeat key</label>
            <Input
              error={errors.includes("key2") && true}
              id="key2"
              name="key2"
              placeholder="Enter key"
              type="text"
              onpaste="return false;"
              ondrop="return false;"
              autocomplete="off"
              value={key2}
              onChange={(e) => {
                setKey2(e.target.value);
                if (e.target.value.length >= 10 || e.target.value.length <= 20){
                  setErrors(errors.filter(e => e !== "key2"));
                }
              }}
              />
          </section>

          <ButtonRow>

            <BorderedFullButton
              style={{margin: "0px"}}
              onClick={(e) => {
                e.preventDefault();
                let errors = [];
                if (key1.length < 10 || key1.length > 20){
                  errors.push("key");
                }
                if (key1.length >= 10 && key1.length <= 20 && key1 === key2 ) {
                  handleSecretKeyCreations();
                }
                setErrors(errors);
              }}
              >
              <img
                src={SendIcon}
                alt=""
                className="icon start"
                />
              Done!
            </BorderedFullButton>
          </ButtonRow>

        </Form>
      </div>
    </LoginContainer>
  );
};
