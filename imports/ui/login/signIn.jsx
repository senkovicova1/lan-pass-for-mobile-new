import React, {
  useState
} from 'react';

import {
  Meteor
} from 'meteor/meteor';

import {
  Accounts
} from 'meteor/accounts-base';

import Loader from "../other/loadingScreen";
import AddUser from '../users/userForm';

import {
  listPasswordsInFolderStart
} from "/imports/other/navigationLinks";

export default function SignInForm( props ) {

  const { history, openLogIn } = props;
  const [ errorMessage, setErrorMessage ] = useState( '' );
  const [ showLoading, setShowLoading ] = useState( false );

  const onSubmit = ( name, surname, avatar, email, password ) => {
    setShowLoading(true);
    setErrorMessage("");
    createUser( name, surname, avatar, email, password );
    history.push(`${listPasswordsInFolderStart}all`);
  };

  const createUser = ( name, surname, avatar, email, password ) => {
    Accounts.createUser( {
      password,
      email,
      profile: {
        name,
        surname,
        avatar,
      }
    }, (error) => {
      setShowLoading(false);
      if (error) {
        if (error.reason === "Incorrect password." || error.reason === "User not found."){
          setErrorMessage("Incorrect login details.");
        } else {
          setErrorMessage(error.reason);
        }
      }
    } );
  };

  return (
    <div>
      {
        showLoading &&
        <Loader />
      }
      <AddUser onSubmit={onSubmit} isSignIn openLogIn={openLogIn} errorMessage={errorMessage}/>
    </div>
  );
};
