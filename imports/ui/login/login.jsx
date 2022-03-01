import React, {
  useState
} from 'react';

import {
  Meteor
} from 'meteor/meteor';

import {
  useTracker
} from 'meteor/react-meteor-data';

import {
  Accounts
} from 'meteor/accounts-base';

import {
  Spinner
} from 'reactstrap';

import {
  useDispatch,
} from 'react-redux';

import {
  setCurrentUserData
} from '/imports/redux/currentUserSlice';

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

import {
  checkSecretKey,
} from '/imports/other/helperFunctions';

export default function LoginForm( props ) {

  const dispatch = useDispatch();

  const {
    history,
  } = props;

  const currentUser = useTracker( () => Meteor.user() );

  const [ email, setEmail ] = useState( '' );
  const [ password, setPassword ] = useState( '' );
  const [ secretKey, setSecretKey ] = useState( '' );
  const [ errorMessage, setErrorMessage ] = useState( '' );
  const [ showLoading, setShowLoading ] = useState( false );

  const onSubmit = event => {
    setShowLoading( true );
    setErrorMessage( "" );
    event.preventDefault();
    if ( secretKey.length > 0 ) {
      dispatch( setCurrentUserData( {
        secretKey
      } ) );
    }
    Meteor.loginWithPassword( email.trim(), password, ( error, other ) => {
      setShowLoading( false );
      if ( error ) {
        if ( error.reason === "Incorrect password." || error.reason === "User not found." ) {
          setErrorMessage( "Incorrect login details." );
        } else {
          setErrorMessage( error.reason );
        }
        setShowLoading( false );
      } else {
        history.push( "" );
      }
    } );
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

      <section>
        <label htmlFor="key">Private key</label>
        <Input
          type="text"
          placeholder="Key"
          name="key"
          id="key"
          onChange={e => setSecretKey(e.target.value)}
          />
      </section>

      {
        errorMessage &&
        <p className="error-message">{errorMessage}</p>
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
