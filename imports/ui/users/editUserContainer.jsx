import React from 'react';

import {
  useTracker
} from 'meteor/react-meteor-data';
import {
  useDispatch,
  useSelector
} from 'react-redux';

import UserForm from './form';
import CurrentUserForm from './currentUserForm';
import Loader from '/imports/ui/other/loadingScreen';

import {
  setCurrentUserData
} from '/imports/redux/currentUserSlice';

import {
  getGoToLink
} from "/imports/other/navigationLinks";
import {
  UserIcon
} from "/imports/other/styles/icons";

import {
  uint8ArrayToImg
} from '/imports/other/helperFunctions';

export default function EditUserContainer( props ) {

  const dispatch = useDispatch();

  const {
    history,
    userID,
    closeSelf
  } = props;

  const userId = Meteor.userId();

  const {
    user
  } = useTracker( () => {
    const noDataAvailable = {
      users: [],
      usersLoading: true
    };
    if ( !Meteor.user() ) {
      return noDataAvailable;
    }

    const handler = Meteor.subscribe( 'users' );

    if ( !handler.ready() ) {
      return noDataAvailable;
    }

    let user = Meteor.users.findOne( {
      _id: ( userID ? userID : userId )
    } );

    user = {
      _id: user._id,
      ...user.profile,
      email: user.emails[ 0 ].address,
      label: `${user.profile.name} ${user.profile.surname}`,
      value: user._id,
      img: user.profile.avatar ? uint8ArrayToImg( user.profile.avatar ) : UserIcon
    };

    return {
      user
    };
  } );

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

  async function editUser( name, surname, avatar, rights, currentKey, newKey ) {
    let data = {
      "profile.name": name,
      "profile.surname": surname,
      "profile.avatar": avatar,
      "profile.rights": rights,
    }
    if ( currentKey ) {
      const decryptedPrK = decryptStringWithXORtoHex( user.privateKey, currentKey );
      const encryptedPrK = encryptStringWithXORtoHex( decryptedPrK, newKey );
      data = {
        ...data,
        "profile.privateKey": encryptedPrK,
      }
    }
    Meteor.users.update( ( userID ? userID : userId ), {
      $set: {
        ...data
      }
    }, ( error ) => {
      if ( error ) {
        console.log( error );
      } else if ( closeSelf ) {
        if ( currentKey ) {
          dispatch( setCurrentUserData( {
            secretKey: newKey
          } ) );
        }
        closeSelf();
      } else {
        if ( currentKey ) {
          dispatch( setCurrentUserData( {
            secretKey: newKey
          } ) );
        }
        history.push( "" );
      }
    } );

  };

  const onCancel = () => {
    if ( closeSelf ) {
      closeSelf();
    } else {
      history.push( "" );
    }
  }

  if ( !user ) {
    return <Loader />
  }

  if ( !userID ) {
    return (
      <CurrentUserForm
        _id={user._id}
        user={user}
        onSubmit={editUser}
        onCancel={onCancel}
        />
    )
  }

  return (
    <UserForm
      user={user}
      onSubmit={editUser}
      onCancel={onCancel}
      />
  );
};
