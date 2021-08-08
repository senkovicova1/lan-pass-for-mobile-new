import {
  Meteor
} from 'meteor/meteor';
import React, {
  useState
} from 'react';

import Login from './login';
import SignIn from './signIn';

import {
  GroupButton,
  LoginContainer
} from "../../other/styles/styledComponents";

export default function LoginForm( props ) {
  const [ showLogin, setShowLogin ] = useState( true );

  return (
    <LoginContainer>

      {showLogin &&
        <div>
        <Login {...props} openSignUp={() => setShowLogin(!showLogin)}/>
      </div>
      }
      {!showLogin && <SignIn {...props} openLogIn={() => setShowLogin(!showLogin)}/>}
    </LoginContainer>
  );
};
