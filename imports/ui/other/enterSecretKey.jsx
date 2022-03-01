import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useTracker
} from 'meteor/react-meteor-data';

import {
  useDispatch,
  useSelector
} from 'react-redux';

import {
  Modal,
  ModalBody,
  Spinner
} from 'reactstrap';

import {
  setCurrentUserData
} from '/imports/redux/currentUserSlice';

import FolderForm from '/imports/ui/folders/folderForm';

import {
  SendIcon
} from "/imports/other/styles/icons";

import {
  Card,
  Form,
  Input,
  LinkButton,
} from "/imports/other/styles/styledComponents";

import {
  listPasswordsInFolderStart,
} from "/imports/other/navigationLinks";

import {
  str2ab,
  ab2str,
  checkSecretKey,
  importKeyAndDecrypt
} from '/imports/other/helperFunctions';

export default function EnterSecretKey( props ) {

  const dispatch = useDispatch();

  const {
    columns
  } = props;

  const currentUser = useTracker( () => Meteor.user() );

  const [ enteredSecretKey, setEnteredSecretKey ] = useState( "" );
  const [ errorMessage, setErrorMessage ] = useState( "" );
  const [ checking, setChecking ] = useState( false );

  async function handleSeretKeySend() {
    if ( enteredSecretKey.length > 0 ) {
      const secretKeyCorrect = await checkSecretKey( currentUser.profile.publicKey, currentUser.profile.privateKey, enteredSecretKey );
      if ( secretKeyCorrect ) {
        setErrorMessage( "" );
        dispatch( setCurrentUserData( {
          secretKey: enteredSecretKey,
          secretKeyVerified: true
        } ) );
      } else {
        setErrorMessage( "Incorrect secret key!" );
      }
    }
    setChecking( false );
  }

  const body = () => {
    return (
      <section>
        <label htmlFor="secretKey">Secret key</label>
        <span className="error-message">
          { errorMessage ? errorMessage : "Please enter your secret key in order to decrypt the password. (Your key will be remembered until you close the window.)"}
        </span>
        <div>
          <Input
            type="text"
            id="secretKey"
            name="secretKey"
            value={enteredSecretKey}
            onChange={(e) => {
              setEnteredSecretKey(e.target.value);
            }}
            />

          <LinkButton
            className="icon"
            onClick={(e) => {
              e.preventDefault();
              setChecking(true);
              handleSeretKeySend();
            }}
            >
            {
              !checking &&
              <img className="icon" style={{marginLeft: "7px"}} src={SendIcon} alt="Send" />
            }
            {
              checking &&
              <Spinner className="spinner" color="primary" children="" style={{ height: "1.3em", width: "1.3em",  marginLeft: "7px"}}/>
            }
          </LinkButton>


        </div>
      </section>
    )
  }

  if ( columns ) {
    return (
      <Form columns={columns}>
        {
          body()
        }
      </Form>
    )
  }

  return (
    <Form columns={columns}>
      <Card>
        {
          body()
        }
      </Card>
    </Form>
  )

};
