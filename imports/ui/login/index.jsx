import React, {
  useState
} from 'react';

import Login from './login';

import {
  GroupButton,
  LoginContainer
} from "/imports/other/styles/styledComponents";

export default function LoginForm( props ) {

  return (
    <LoginContainer>

        <div>
          <Login {...props} openSignUp={() => setShowLogin(!showLogin)}/>
        </div>

    </LoginContainer>
  );
};
