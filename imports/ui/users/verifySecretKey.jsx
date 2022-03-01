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
  Spinner
} from 'reactstrap';

import {
  setCurrentUserData
} from '/imports/redux/currentUserSlice';

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

import {
  checkSecretKey,
} from '/imports/other/helperFunctions';

const allRights = [
  {
    label: "System admin",
    value: "sysAdmin",
  }
]

export default function VerifySecretKey( props ) {

  const dispatch = useDispatch();

  const currentUser = useTracker( () => Meteor.user() );
  const {
    secretKey,
    secretKeyVerified
  } = useSelector( ( state ) => state.currentUserData.value );

  const [ enteredSecretKey, setEnteredSecretKey ] = useState( "" );
  const [ errorMessage, setErrorMessage ] = useState( "" );
  const [ checking, setChecking ] = useState( false );

  useEffect( () => {
    handleSecretKeyCheck();
  }, [] );

  async function handleSecretKeyCheck() {
    let usedSK = enteredSecretKey.length > 0 ? enteredSecretKey : secretKey;
    if ( usedSK ) {
      const secretKeyCorrect = await checkSecretKey( currentUser.profile.publicKey, currentUser.profile.privateKey, usedSK );
      if ( secretKeyCorrect ) {
        setErrorMessage( "" );
        dispatch( setCurrentUserData( {
          secretKey: usedSK,
          secretKeyVerified: true
        } ) );
      } else {
        setErrorMessage( "Incorrect secret key!" );
      }
    }
    setChecking( false );
  }

  return (
    <LoginContainer>

      <div>
        <Form columns={true}>

          <h2>Secret key verification</h2>

          {
            errorMessage &&
            <section>
              <label htmlFor="key">Enter secret key</label>
              <span className="error-message">{ errorMessage }</span>
              <Input
                id="key"
                name="key"
                placeholder="Enter key"
                type="text"
                value={enteredSecretKey}
                onChange={(e) => {
                  setEnteredSecretKey(e.target.value);
                }}
                />
            </section>
          }

          <ButtonRow>

            <BorderedFullButton
              style={{margin: "0px"}}
              onClick={(e) => {
                e.preventDefault();
                setChecking(true);
                handleSecretKeyCheck();
              }}
              >
              {
                !checking &&
                <img className="icon" style={{marginRight: "7px"}} src={SendIcon} alt="Send" />
              }
              {
                checking &&
                <Spinner className="spinner" color="white" children="" style={{ height: "1.3em", width: "1.6em",  marginRight: "7px"}}/>
              }
              {
                !checking &&
                <span>
                  Verify!
                </span>
              }
              {
                checking &&
                <span>
                  Verifying!
                </span>
              }
            </BorderedFullButton>
          </ButtonRow>

        </Form>
      </div>
    </LoginContainer>
  );
};
