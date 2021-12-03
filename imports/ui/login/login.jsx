import React, {
  useState
} from 'react';

import {
  Meteor
} from 'meteor/meteor';

import {
  Accounts
} from 'meteor/accounts-base';

import Loader from "/imports/ui/other/loadingScreen";

import {
  FullButton,
  Form,
  Input,
  LinkButton
} from "/imports/other/styles/styledComponents";

import {
  listPasswordsInFolderStart
} from "/imports/other/navigationLinks";

export default function LoginForm( props ) {

  const {
    history,
  } = props;

  const [ email, setEmail ] = useState( '' );
  const [ password, setPassword ] = useState( '' );
  const [ errorMessage, setErrorMessage ] = useState( '' );
  const [ showLoading, setShowLoading ] = useState( false );

  const onSubmit = event => {
    setShowLoading( true );
    setErrorMessage( "" );
    event.preventDefault();
    Meteor.loginWithPassword( email, password, ( error ) => {
      setShowLoading( false );
      if ( error ) {
        if ( error.reason === "Incorrect password." || error.reason === "User not found." ) {
          setErrorMessage( "Incorrect login details." );
        } else {
          setErrorMessage( error.reason );
        }
        setShowLoading( false );
      }
    } );
    history.push( "" );
  };

  const handleForgotPassword = () => {
    Accounts.forgotPassword( {
      email
    } );
  };

  return (
    <Form onSubmit={onSubmit}>

      {
        (showLoading || Meteor.loggingIn()) &&
        <Loader />
      }

      <section>
        <label htmlFor="email">Email</label>
        <Input
          type="text"
          placeholder="Email"
          name="email"
          id="email"
          required
          onChange={e => setEmail(e.target.value)}
          />
      </section>

      <section>
        <label htmlFor="password">Password</label>
        <Input
          type="password"
          placeholder="Password"
          name="password"
          id="password"
          required
          onChange={e => setPassword(e.target.value)}
          />
      </section>

      {
        errorMessage &&
        <p>{errorMessage}</p>
      }

      <FullButton type="submit" style={{marginTop: "1.5em"}}>Log In</FullButton>

      {
        false &&
        <LinkButton
          disabled={email.length === 0}
          onClick={(e) => {
            e.preventDefault();
            handleForgotPassword()
          }}
          >
          Forgot password
        </LinkButton>
      }


    </Form>
  );
};
