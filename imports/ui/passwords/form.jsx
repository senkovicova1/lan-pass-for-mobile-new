import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useSelector
} from 'react-redux';

import {
  useTracker
} from 'meteor/react-meteor-data';

import Select from 'react-select';

import moment from 'moment';

import PasswordGenerator from './passwordGenerator';

import {
  PasswordsCollection
} from '/imports/api/passwordsCollection';

import {
  EyeIcon
} from "/imports/other/styles/icons";

import {
  selectStyle
} from '/imports/other/styles/selectStyles';

import {
  ButtonCol,
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

const NUMBERS = "0123456789";
const SYMBOLS = "/*-+><.,?!@#$%^*()[]{}";
const UPPER_CASE = "ABCDEFGHTIJKLMNOPQRSTUVWXYZ";
const LOWER_CASE = "abcdefghtijklmnopqrstuvwxyz";

export default function PasswordForm( props ) {
const {
  match,
  history,
  onSubmit,
  onCancel,
} = props;

const userId = Meteor.userId();
const user = useTracker( () => Meteor.user() );

const folderID = match.params.folderID;
const allFolders = useSelector( ( state ) => state.folders.value );
const folders = useMemo( () => {
  return allFolders.filter( folder => !folder.deletedDate );
}, [ allFolders ] );

const passwordID = match.params.passwordID;
const passwords = useSelector( ( state ) => state.passwords.value );
const password = useSelector( ( state ) => state.passwords.value ).find( p => p._id === passwordID );

const [ title, setTitle ] = useState( "" );
const [ folder, setFolder ] = useState( null );
const [ username, setUsername ] = useState( "" );
const [ password1, setPassword1 ] = useState( "" );
const [ password2, setPassword2 ] = useState( "" );
const [ quality, setQuality ] = useState( 29 );
const [ note, setNote ] = useState( "" );
const [ expires, setExpires ] = useState( false );
const [ expireDate, setExpireDate ] = useState( "" );

const [ revealPassword, setRevealPassword ] = useState( false );

const toggleRevealPassword = () => {
  setRevealPassword( !revealPassword )
};

useEffect( () => {
  if ( password ) {
    setTitle( password.title );
    setFolder( {
      ...folders.find( f => f._id === password.folder )
    } );
    setUsername( password.username );
    setPassword1( password.password );
    setPassword2( password.password );
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
    setQuality( 29 );
    setNote( "" );
    setExpires( false );
    setExpireDate( "" );
  }
}, [ password, folders, folderID ] );

const removePassword = () => {
  const passwordToRemove = password;
  let message = "Are you sure you want to remove this password? Note: Password will be moved to the \"Deleted passwords\" section.";
  if ( passwordToRemove.version > 0 ) {
    message = "Are you sure you want to remove this version? ";
  }
  if ( window.confirm( message ) ) {
    if ( passwordToRemove.version === 0 && !passwordToRemove.deletedDate ) {
      let data = {
        deletedDate: moment().unix(),
      };
      PasswordsCollection.update( passwordToRemove._id, {
        $set: {
          ...data
        }
      } );
    } else if ( passwordToRemove.version === 0 ) {
      PasswordsCollection.remove( {
        _id: passwordToRemove._id
      } );
      const passwordsToUpdate = passwords.filter( pass => [ pass.passwordId, pass._id ].includes( passwordToRemove.passwordId ) );
      passwordsToUpdate.forEach( ( pass, index ) => {
        PasswordsCollection.remove( {
          _id: pass._id
        } );
      } );
    } else {
      PasswordsCollection.remove( {
        _id: passwordToRemove._id
      } );
      const passwordsToUpdate = passwords.filter( pass => [ pass.passwordId, pass._id ].includes( passwordToRemove.passwordId ) && pass.version > passwordToRemove.version );
      passwordsToUpdate.forEach( ( pass, index ) => {
        PasswordsCollection.update( pass._id, {
          $inc: {
            version: -1
          }
        } );
      } );
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
  let settings = user.profile.passwordSettings || defaultSettings;
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
}, [ user?.profile.passwordSettings ] )

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

  return (
    <Form>

      <section>
        <label htmlFor="title">Title</label>
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
        <label htmlFor="username">Username</label>
        <Input
          type="text"
          id="username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          />
      </section>

      <section className="password">
        <label htmlFor="password" className="password-label">Password</label>
        <div className="input-section">
          <Input
            type={revealPassword ? "text" : "password"}
            id="password"
            name="password"
            value={password1}
            onChange={(e) => setPassword1(e.target.value)}
            />
          <LinkButton
            className="icon"
            onClick={(e) => {
              e.preventDefault();
              toggleRevealPassword();
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
          id="repeat-password"
          name="repeat-password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          />
      </section>
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
            value={expireDate ? moment.unix(expireDate).add((new Date).getTimezoneOffset(), 'minutes').format("yyyy-MM-DD hh:mm").replace(" ", "T") : ""}
            min={moment.unix().add((new Date).getTimezoneOffset(), 'minutes').format("yyyy-MM-DD hh:mm").replace(" ", "T")}
            onChange={(e) => setExpireDate(e.target.valueAsNumber/1000)}
            />
        </div>
      </section>

      <ButtonCol>
        <FullButton colour="grey" onClick={(e) => {e.preventDefault(); history.goBack()}}>Cancel</FullButton>
        <FullButton colour="red" onClick={(e) => {e.preventDefault(); removePassword();}}>Delete</FullButton>
        {
          folder &&
          folder.users &&
          folder.users.find(user => user._id === userId) &&
          folder.users.find(user => user._id === userId).level<= 1 &&
          <FullButton
            colour=""
            disabled={title.length === 0 || password1 !== password2}
            onClick={(e) => {e.preventDefault(); onSubmit(
              title,
              folder.value,
              username,
              password1,
              quality,
              note,
              expires,
              expireDate,
              password ? password.createdDate : moment().unix(),
              moment().unix(),
              password ? (password.passwordId ? password.passwordId : password._id) : null
            );}}
            >
            Save
          </FullButton>
        }
      </ButtonCol>

    </Form>
  );
};
