import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useDispatch,
  useSelector
} from 'react-redux';

import {
  useTracker
} from 'meteor/react-meteor-data';

import Select from 'react-select';

import PasswordGenerator from './passwordGenerator';

import {
  PasswordsCollection
} from '/imports/api/passwordsCollection';

import {
  setCurrentUserData
} from '/imports/redux/currentUserSlice';

import {
  listPasswordsInFolderStart
} from "/imports/other/navigationLinks";

import {
  EyeIcon,
  BackIcon,
  CloseIcon,
  DeleteIcon,
  PencilIcon,
  SendIcon,
} from "/imports/other/styles/icons";

import {
  selectStyle
} from '/imports/other/styles/selectStyles';

import {
  ButtonCol,
  Card,
  CommandRow,
  BorderedLinkButton,
  BorderedFullButton,
  DifficultyInput,
  Form,
  FormTable,
  FullButton,
  GroupButton,
  Input,
  LinkButton,
  TitleInput,
  Textarea,
} from "/imports/other/styles/styledComponents";

import {
  str2ab,
  importKeyAndDecrypt
} from '/imports/other/helperFunctions';

const NUMBERS = "0123456789";
const SYMBOLS = "/*-+><.,?!@#$%^*()[]{}";
const UPPER_CASE = "ABCDEFGHTIJKLMNOPQRSTUVWXYZ";
const LOWER_CASE = "abcdefghtijklmnopqrstuvwxyz";

const {
  DateTime
} = require( "luxon" );

export default function PasswordForm( props ) {

  const dispatch = useDispatch();

  const {
    password,
    match,
    location,
    history,
    onSubmit,
    onCancel,
  } = props;

  const userId = Meteor.userId();
  const currentUser = useTracker( () => Meteor.user() );
  const {
    secretKey
  } = useSelector( ( state ) => state.currentUserData.value );

  const folderID = match.params.folderID;
  const allFolders = useSelector( ( state ) => state.folders.value );
  const folders = useMemo( () => {
    return allFolders.filter( folder => !folder.deletedDate );
  }, [ allFolders ] );

  const passwordID = match.params.passwordID;
  const passwords = useSelector( ( state ) => state.passwords.value );

  const [ title, setTitle ] = useState( "" );
  const [ folder, setFolder ] = useState( null );
  const [ username, setUsername ] = useState( "" );
  const [ url, setUrl ] = useState( "" );
  const [ password1, setPassword1 ] = useState( "" );
  const [ password2, setPassword2 ] = useState( "" );
  const [ quality, setQuality ] = useState( 29 );
  const [ note, setNote ] = useState( "" );
  const [ expires, setExpires ] = useState( false );
  const [ expireDate, setExpireDate ] = useState( "" );

  const [ revealPassword, setRevealPassword ] = useState( false );

  const [ passwordWasDecrypted, setPasswordWasDecrypted ] = useState( false );

  useEffect( () => {
    if ( password ) {
      setTitle( password.title );
      setFolder( {
        ...folders.find( f => f._id === password.folder )
      } );
      setUsername( password.username );
      setPassword1( password.password );
      setPassword2( password.password );
      setUrl( password.url );
      setQuality( password.quality );
      setNote( password.note );
      setExpires( password.expires );
      setExpireDate( password.expireDate );
    } else {
      setTitle( "" );
      setFolder( {
        ...folders.find( f => f._id === folderID )
      } );
      setUsername( "" );
      setPassword1( "" );
      setPassword2( "" );
      setUrl( "" );
      setQuality( 29 );
      setNote( "" );
      setExpires( false );
      setExpireDate( "" );
    }
  }, [ password, folders, folderID ] );

  const removePassword = () => {
    const passwordToRemove = password;
    let message = "Are you sure you want to remove this password? Note: Password will be moved to the \"Deleted passwords\" section.";
    if ( passwordToRemove.version ) {
      message = "Are you sure you want to remove this version? ";
    }
    if ( !passwordToRemove.version && passwordToRemove.deletedDate ) {
      message = "Are you sure you want to permanently remove this password? ";
    }
    if ( window.confirm( message ) ) {
      if ( !passwordToRemove.version && !passwordToRemove.deletedDate ) {
        let data = {
          deletedDate: parseInt( DateTime.now().toSeconds() ),
        };
        Meteor.call(
          'passwords.update',
          passwordToRemove._id,
          data,
        );

      } else if ( !passwordToRemove.version ) {

        Meteor.call(
          'passwords.remove',
          passwordToRemove._id,
          passwordToRemove.originalPasswordId ? passwordToRemove.originalPasswordId : passwordToRemove._id
        );

      } else {

        Meteor.call(
          'previousPasswords.remove',
          passwordToRemove._id,
          passwordToRemove.originalPasswordId ? passwordToRemove.originalPasswordId : passwordToRemove._id,
          passwordToRemove.version
        );

      }
      history.push( `${listPasswordsInFolderStart}${folderID}` );
    }
  };

  const generatePassword = useCallback( () => {
    let defaultSettings = {
      length: 16,
      upperCase: true,
      lowerCase: true,
      includeNumbers: true,
      includeSymbols: true,
    }
    let settings = currentUser.profile.passwordSettings || defaultSettings;
    let characters = "";
    if ( settings.upperCase ) {
      characters += UPPER_CASE;
    }
    if ( settings.lowerCase ) {
      characters += LOWER_CASE;
    }
    if ( settings.includeNumbers ) {
      characters += NUMBERS;
    }
    if ( settings.includeSymbols ) {
      characters += SYMBOLS;
    }
    let newPassword = "";
    for ( var i = 0; i < settings.length; i++ ) {
      newPassword += characters.charAt( Math.floor( Math.random() * characters.length ) );
    }
    setPassword1( newPassword );
    setPassword2( newPassword );
  }, [ currentUser?.profile.passwordSettings ] )

  const passwordScore = useMemo( () => {
    let score = 0;
    if ( password1.length === 0 )
      return score;

    let letters = {};
    for ( let i = 0; i < password1.length; i++ ) {
      letters[ password1[ i ] ] = ( letters[ password1[ i ] ] || 0 ) + 1;
      score += 5.0 / letters[ password1[ i ] ];
    }

    let variations = {
      digits: /\d/.test( password1 ),
      lower: /[a-z]/.test( password1 ),
      upper: /[A-Z]/.test( password1 ),
      nonWords: /\W/.test( password1 ),
    }

    let variationCount = 0;
    for ( let check in variations ) {
      variationCount += ( variations[ check ] == true ) ? 1 : 0;
    }
    score += ( variationCount - 1 ) * 10;

    return parseInt( score );
  }, [ password1 ] );

  const scoreTranslation = useCallback( () => {
    let result = {
      mark: "Very weak",
      colour: "#ff0053"
    };
    if ( passwordScore > 30 ) {
      result.mark = "Weak";
      result.colour = "#ee6e8f";
    }
    if ( passwordScore > 60 ) {
      result.mark = "Good";
      result.colour = "#f4e531";
    }
    if ( passwordScore > 80 ) {
      result.mark = "Strong";
      result.colour = "#bbe147";
    }
    if ( passwordScore > 100 ) {
      result.mark = "Very strong";
      result.colour = "#0bb829";
    }
    return <span style={{color: result.colour, width: "40%", textAlign: "end"}}>{result.mark}</span>
  }, [ passwordScore ] );

  async function toggleRevealPassword() {
    setRevealPassword( !revealPassword );
    if ( passwordID && !passwordWasDecrypted ) {
      const decryptedPassword = await decryptPassword( password1 );
      setPasswordWasDecrypted( true );
      setPassword1( decryptedPassword );
      setPassword2( decryptedPassword );
    }
  };

  const toggleMissingPrivateKey = () => {
    setErrorMessage( "Please enter your private key in order to decrypt the password. (Your key will be remembered until you close the window.)" )
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

  async function decryptPassword( text ) {
    if ( !folder.algorithm || !folder.key[ currentUser._id ] ) {
      return "";
    }

    const privateKey = decryptStringWithXORtoHex( currentUser.profile.privateKey, secretKey );

    const decodedFolderDecryptedKey = await importKeyAndDecrypt( privateKey, "async", folder.key[ userId ] );

    const decryptedValue = await importKeyAndDecrypt( decodedFolderDecryptedKey, "sync", text, folder.algorithm );

    return decryptedValue;
  }

  let password1Value = "";
  if ( passwordWasDecrypted ) {
    password1Value = password1;
  } else if ( revealPassword ) {
    password1Value = password1;
  } else if ( passwordID === "password-add" && password1.length === 0 ) {
    password1Value = "";
  } else if ( passwordID === "password-add" && password1.length > 0 ) {
    password1Value = password1;
  } else {
    password1Value = "decrypting_password...";
  }
  let password2Value = "";
  if ( passwordWasDecrypted ) {
    password2Value = password2;
  } else if ( revealPassword ) {
    password2Value = password2;
  } else if ( passwordID ) {
    password2Value = "";
  } else {
    password2Value = "decrypting_password...";
  }

  const getOffset = () => {
    let jan = new Date( 2009, 0, 1, 2, 0, 0 );
    let jul = new Date( 2009, 6, 1, 2, 0, 0 );
    let offset = ( jan.getTime() % 24 * 60 * 60 * 1000 ) > ( jul.getTime() % 24 * 60 * 60 * 1000 ) ? jan.getTimezoneOffset() : jul.getTimezoneOffset();
    return offset;
  }

  return (
    <Form autoComplete="off">

      <Card>

        <Input
          style={{position: "fixed", top: "50000px"}}
          type="email"
          id="mail_hidden"
          name="mail_hidden"
          />

        <Input
          style={{position: "fixed", top: "50000px"}}
          type="password"
          id="pass"
          name="pass"
          />

        <section>
          <label htmlFor="title">Title <span style={{color: "red"}}>*</span></label>
          <Input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            />
        </section>

        <section>
          <label htmlFor="folder">Folder</label>
          <Select
            id="folder"
            name="folder"
            styles={selectStyle}
            value={folder}
            onChange={(e) => setFolder(e)}
            options={folders}
            />
        </section>

        <section>
          <label htmlFor="username">Login</label>
          <Input
            type="text"
            autoComplete="off"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            />
        </section>

        <section className="password">
          <label htmlFor="first-password" className="password-label">Password</label>
          <div className="input-section">
            <Input
              type={revealPassword ? "text" : "password"}
              autocomplete="new-password"
              autoComplete="off"
              id="first-password"
              name="first-password"
              value={password1Value}
              onChange={(e) => setPassword1(e.target.value)}
              />
            <LinkButton
              className="icon"
              onClick={(e) => {
                e.preventDefault();
                if (location.pathname.includes("add")){
                  setRevealPassword(true);
                } else {

                  toggleRevealPassword();
                }
              }}
              >
              <img className="icon" src={EyeIcon} alt="reveal pass" />
            </LinkButton>
          </div>
        </section>

        <section>
          <label htmlFor="repeat-password">Repeat password</label>
          <Input
            type={revealPassword ? "text" : "password"}
            autocomplete="new-password"
            autoComplete="off"
            id="repeat-password"
            name="repeat-password"
            value={password2Value}
            onChange={(e) => setPassword2(e.target.value)}
            />
        </section>
        {
          password1Value !== "decrypting_password" &&
          <section>
            <div style={{display: "flex", justifyContent: "space-between"}}>
              <label htmlFor="repeat-password">Password strength </label>
              {scoreTranslation()}
            </div>
            <DifficultyInput
              block
              type="range"
              name="quality"
              id="quality"
              readOnly
              min={0}
              max={110}
              step={1}
              value={passwordScore}
              />
          </section>
        }

        <section style={{display: "flex"}}>
          <PasswordGenerator />
          <FullButton
            style={{marginLeft: "auto", width: '200px'}}
            onClick={(e) => {
              e.preventDefault();
              generatePassword();
            }}
            >
            Generate password
          </FullButton>
        </section>

        <section>
          <label htmlFor="url">URL</label>
          <Input
            type="text"
            id="url"
            name="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            />
        </section>

        <section>
          <label htmlFor="note">Note</label>
          <Textarea
            id="note"
            name="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            />
        </section>

        <section>
          <label htmlFor="expires">Expires</label>
          <div style={{alignItems: "center"}}>
            <Input
              type="checkbox"
              id="expires"
              name="expires"
              checked={expires}
              onChange={() => setExpires(!expires)}
              />
            <Input
              disabled={!expires}
              type="datetime-local"
              placeholder="Deadline"
              value={
                expireDate ? DateTime.fromSeconds(expireDate).toFormat("y-LL-dd HH:mm").replace(" ", "T") : ""
              }
              min={DateTime.now()}
              onChange={(e) => setExpireDate(DateTime.fromMillis(e.target.valueAsNumber).plus({minutes: getOffset()}).toSeconds())}
              />
          </div>
        </section>
      </Card>

      <CommandRow>
        <BorderedLinkButton
          font="red"
          fit={true}
          onClick={(e) => {
            e.preventDefault();
            history.goBack()
          }}
          >
          <img
            src={CloseIcon}
            alt=""
            className="icon red"
            />
          Cancel
        </BorderedLinkButton>
        {
          password &&
          <BorderedFullButton
            fit={true}
            font="red"
            colour="red"
            onClick={(e) => {
              e.preventDefault();
              removePassword();
            }}
            >
            <img
              src={DeleteIcon}
              alt=""
              className="icon red"
              />
            Delete
          </BorderedFullButton>
        }
        {
          folder &&
          folder.users &&
          folder.users.find(currentUser => currentUser._id === userId) &&
          folder.users.find(currentUser => currentUser._id === userId).level<= 1 &&
          <BorderedFullButton
            type="submit"
            fit={true}
            disabled={title.length === 0 || password1 !== password2}
            onClick={(e) => {
              e.preventDefault();
              onSubmit(
                title,
                folder.value,
                username,
                password1,
                password ? password.password : null,
                passwordWasDecrypted,
                url,
                note,
                expires,
                expireDate,
                password ? password.createdDate : parseInt(DateTime.now().toSeconds()),
                parseInt(DateTime.now().toSeconds()),
                password ? (password.originalPasswordId ? password.originalPasswordId : password._id) : null
              );
            }}
            >
            <img
              src={PencilIcon}
              alt=""
              className="icon"
              />
            Save
          </BorderedFullButton>
        }
      </CommandRow>
    </Form>
  );
};
