import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import Select from 'react-select';

import {
  useTracker
} from 'meteor/react-meteor-data';

import {
  useDispatch,
  useSelector
} from 'react-redux';

import {
  Modal,
  ModalBody
} from 'reactstrap';

import SharePassword from './sharing/shareForm';

import Loader from '/imports/ui/other/loadingScreen';

import {
  PasswordsCollection
} from '/imports/api/passwordsCollection';

import {
  PreviousPasswordsCollection
} from '/imports/api/previousPasswordsCollection';

import {
  setCurrentUserData
} from '/imports/redux/currentUserSlice';

import {
  RestoreIcon,
  EyeIcon,
  CopyIcon,
  PencilIcon,
  BackIcon,
  HourglassIcon,
  DeleteIcon,
  SendIcon
} from "/imports/other/styles/icons";

import {
  selectStyle
} from '/imports/other/styles/selectStyles';

import {
  Card,
  BorderedFullButton,
  PasswordContainer,
  Form,
  ItemContainer,
  ViewInput,
  Input,
  ViewTextarea,
  ButtonCol,
  LinkButton,
  GroupButton,
  FloatingButton,
  DifficultyInput
} from "/imports/other/styles/styledComponents";

import {
  PLAIN,
  COLUMNS
} from "/imports/other/constants";

import {
  listAllPasswords,
  listPasswordsInFolderStart,
  listDeletedPasswordsInFolder
} from "/imports/other/navigationLinks";

import {
  str2ab,
} from '/imports/other/helperFunctions';

const { DateTime } = require("luxon");

export default function PasswordView( props ) {

  const dispatch = useDispatch();

  const {
    match,
    history,
    location,
    columns,
    passwords
  } = props;

  const userId = Meteor.userId();
    const currentUser = useTracker( () => Meteor.user() );
  const { secretKey } = useSelector( ( state ) => state.currentUserData.value );
  const {
    passwordID,
    folderID
  } = match.params;
  const layout = useSelector( ( state ) => state.metadata.value ).layout;
  const encryptionData = useSelector( ( state ) => state.encryptionData.value );

  const folders = useSelector( ( state ) => state.folders.value );
  let folder = useSelector( ( state ) => state.metadata.value ).selectedFolder;

  if (!folder && folders.length > 0){
    folder = folders.find(f => f._id === folderID);
  }

  const usedPassword = useSelector( ( state ) => state.metadata.value ).usedPassword;

  const { password, passwordLoading } = useTracker(() => {
    const noDataAvailable = { password: {}, passwordLoading: true };
    if (!Meteor.user()) {
      return noDataAvailable;
    }
    let handler = null;

    if (location.pathname.includes("version")){
      handler = Meteor.subscribe('previousPasswords');

      if (!handler.ready()) {
        return noDataAvailable;
      }

      const password = PreviousPasswordsCollection.findOne( {_id: passwordID} )

      return { password, passwordLoading: false };
    }
      handler = Meteor.subscribe('passwords');


    if (!handler.ready()) {
      return noDataAvailable;
    }

    const password = PasswordsCollection.findOne( {_id: passwordID} )

    return { password, passwordLoading: false };
  });

  const { users, usersLoading } = useTracker(() => {
    const noDataAvailable = { users: [], usersLoading: true };
    if (!Meteor.user()) {
      return noDataAvailable;
    }

    const handler = Meteor.subscribe('users');

    if (!handler.ready()) {
      return noDataAvailable;
    }

    let users = Meteor.users.find( {}, {
    sort: {name: 1}
  }).fetch();

  users =  users.map( user =>  ({
            _id: user._id,
            ...user.profile,
            email: user.emails[0].address,
            label: `${user.profile.name} ${user.profile.surname}`,
            value: user._id,
          })
         )

    return {users, usersLoading: false};
  });

  const [ revealPassword, setRevealPassword ] = useState( false );
  const [ decryptedPassword, setDecryptedPassword ] = useState( "" );
  const [ showCopyResponse, setShowCopyResponse ] = useState( [false, false, false, false, false] );
  const [ showSharePasswordDialog, setShowSharePasswordDialog ] = useState( false );

  const [ copiedText, setCopiedText ] = useState( "" );

  const [errorMessage, setErrorMessage] = useState("");
  const [enteredSecretKey, setEnteredSecretKey] = useState("");

  let timeout = null;

  async function toggleRevealPassword(){
    setRevealPassword( !revealPassword );
    if (decryptedPassword.length === 0){
      const decrypted = await decryptPassword(password.password);
      setDecryptedPassword(decrypted);
    }
  }

    const decryptStringWithXORtoHex = (text, key) => {
      let c = "";
      let usedKey = key;

      while (usedKey.length < (text.length/2)) {
           usedKey += usedKey;
      }

      for (var j = 0; j < text.length; j = j+2) {
        let hexValueString = text.substring(j, j+2);

        let value1 = parseInt(hexValueString, 16);
        let value2 = usedKey.charCodeAt(j/2);

        let xorValue = value1 ^ value2;
        c += String.fromCharCode(xorValue) + "";
      }

      return c;
    }

    async function decryptPassword(text){
      if (!folder.algorithm || !folder.key[userId]){
        return "";
      }

      const privateKey = decryptStringWithXORtoHex(currentUser.profile.privateKey, secretKey.length > 0 ? secretKey : enteredSecretKey);

      const importedPrivateKey = await window.crypto.subtle.importKey(
        "pkcs8",
        str2ab(window.atob(privateKey)),
          {
            name: "RSA-OAEP",
            hash: "SHA-256"
          },
        true,
        ["decrypt"]
      );

      const folderDecryptedKey = await window.crypto.subtle.decrypt(
        {
          name: "RSA-OAEP",
          modulusLength: 4096,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256"
        },
          importedPrivateKey,
          str2ab(window.atob(folder.key[userId])),
        );

        let dec = new TextDecoder();
        const decodedFolderDecryptedKey = dec.decode(folderDecryptedKey);

      const importedFolderKey = await crypto.subtle.importKey(
        "raw",
          new Uint8Array(atob(decodedFolderDecryptedKey).split(',')),
          folder.algorithm,
        true,
        ["encrypt", "decrypt"]
      );

      let decryptedText = null;
      await window.crypto.subtle.decrypt(
        folder.algorithm,
        importedFolderKey,
        str2ab(window.atob(text)),
      )
      .then(function(decrypted){
        decryptedText = decrypted;
      })
      .catch(function(err){
        console.error(err);
      });
      const decryptedValue = dec.decode(decryptedText);
      return decryptedValue;
    }

    const toggleMissingSecretKey = () => {
      setErrorMessage("Please enter your secret key in order to decrypt the password. (Your key will be remembered until you close the window.)")
    }

  const restorePasswordVersion = () => {
    if ( window.confirm( "Are you sure you want to restore this version?" ) ) {

          Meteor.call(
            'passwords.handleRestore',
            {
              ...password,
              updatedDate: parseInt(DateTime.now().toSeconds()),
              updatedBy: userId,
            },
          );

      history.push( `${listPasswordsInFolderStart}${folderID}` );
    }
  };

  const restoreDeletedPassword = () => {
    if ( window.confirm( "Are you sure you want to restore this deleted password?" ) ) {
      let data = {
        deletedDate: null,
      };

      Meteor.call(
        'passwords.update',
        password._id,
        data,
      );

      history.goBack();
    }
  }

  const removePassword = () => {
    const passwordToRemove = password;
    let message = "Are you sure you want to remove this password? Note: Password will be moved to the \"Deleted passwords\" section.";
    if ( passwordToRemove.version ) {
      message = "Are you sure you want to remove this version? ";
    }
    if ( !passwordToRemove.version && passwordToRemove.deletedDate) {
      message = "Are you sure you want to permanently remove this password? ";
    }
    if ( window.confirm( message ) ) {
      if ( !passwordToRemove.version && !passwordToRemove.deletedDate ) {
        let data = {
          deletedDate: parseInt(DateTime.now().toSeconds()),
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

  const passwordScore = useMemo( () => {
    let score = 0;
    if ( !password || !password.password || password.password.length === 0 || decryptedPassword.length === 0)
      return score;

    let letters = {};
    for ( let i = 0; i < decryptedPassword.length; i++ ) {
      letters[ decryptedPassword[ i ] ] = ( letters[ decryptedPassword[ i ] ] || 0 ) + 1;
      score += 5.0 / letters[ decryptedPassword[ i ] ];
    }

    let variations = {
      digits: /\d/.test( decryptedPassword ),
      lower: /[a-z]/.test( decryptedPassword ),
      upper: /[A-Z]/.test( decryptedPassword ),
      nonWords: /\W/.test( decryptedPassword ),
    }

    let variationCount = 0;
    for ( let check in variations ) {
      variationCount += ( variations[ check ] == true ) ? 1 : 0;
    }
    score += ( variationCount - 1 ) * 10;

    return parseInt( score );
  }, [ password ] );

  const getUser = (id) => {
    const user = users.find(user => user._id === id);
    return user ? user.label : "Unknown";
  }

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
    return <span style={{color: result.colour}}>{result.mark}</span>
  }, [ passwordScore ] );

  if ( !password || !folder) {
    return <div></div>;
  }

  const passwordCanBeEdited = folder.users.find( user => user._id === userId ).level <= 1 && !password.version && !password.deletedDate;
  const passwordCanBeRestored = folder.users.find( user => user._id === userId ).level <= 1 && !password.version && password.deletedDate;
  const passwordVersionCanBeRestored = folder.users.find( user => user._id === userId ).level <= 1 && password.version;

  const editedBy = password.editedBy ? dbUsers.find( user => user._id === password.editedBy ) : {};

  if (passwordLoading){
    return ( <Loader />)
  }

  return (
    <Form columns={columns}>

      {
        password.version > 0 &&
        <PasswordContainer style={{padding: "0.5em 1em"}}>
          <img
            onClick={() => history.goBack()}
            src={BackIcon}
            alt=""
            className="icon start"
            />
          <img
            src={HourglassIcon}
            alt=""
            className="icon start"
            />
          <div>
            <label className="title">
              {`Version from ${DateTime.fromSeconds(password.updatedDate ? password.updatedDate : password.createdDate ).toFormat("dd.LL.y HH:mm")}`}
            </label>
            <label className="username">
              {`Changed password ${getUser(password.updatedBy ? password.updatedBy : password.editedBy)}`}
            </label>
          </div>


          {
            usedPassword &&
            !usedPassword.deletedDate &&
            passwordVersionCanBeRestored &&
            <LinkButton
              onClick={(e) => {
                e.preventDefault();
                //restorePasswordVersion();
              }}
              >
              <img
                src={RestoreIcon}
                alt=""
                className="icon"
                />
            </LinkButton>
          }
        </PasswordContainer>
      }


        {
          !password.version &&
          <span className="command-bar">
            <div className="command">
                <BorderedFullButton
                  fit={true}
                  onClick={(e) => {
                    e.preventDefault();
                    if (folder && !password.deletedDate){
                      history.push(`${listPasswordsInFolderStart}${folder._id}`);
                    } else if (folder && password.deletedDate){
                      history.push(`/folders/list/${folder._id}/deleted`);
                    } else {
                      history.goBack();
                    }
                  }}
                  >
                  <img
                    src={BackIcon}
                    alt=""
                    className="icon"
                    />
                  Back
                </BorderedFullButton>
              </div>

                <div className="command">
              <BorderedFullButton
                fit={true}
                colour="red"
                font="red"
                onClick={(e) => {
                  e.preventDefault();
                  removePassword();
                }}
                >
                <img className="icon red" src={DeleteIcon} alt="delete" />
                {`${password.deletedDate ? "Delete forever" : "Delete" }`}
              </BorderedFullButton>
            </div>

              {
                !folder.deletedDate &&
                passwordCanBeEdited &&
                  <div className="command">
                <BorderedFullButton
                  fit={true}
                  onClick={() => history.push(`${location.pathname}/edit`)}
                  >
                  <img
                    src={PencilIcon}
                    alt=""
                    className="icon"
                    />
                    <span>Edit</span>
                </BorderedFullButton>
              </div>
              }

              {
                passwordCanBeRestored &&
                  <div className="command">
                <BorderedFullButton
                  fit={true}
                  onClick={(e) => {
                    e.preventDefault();
                    restoreDeletedPassword();
                  }}
                  >
                  <img
                    src={RestoreIcon}
                    alt=""
                    className="icon"
                    />
                  Restore
                </BorderedFullButton>
              </div>
              }

              <div className="command">
                  <BorderedFullButton
                    fit={true}
                    onClick={(e) => {
                      e.preventDefault();
                      setShowSharePasswordDialog(true);
                    }}
                    >
                    <img
                      src={SendIcon}
                      alt=""
                      className="icon"
                      />
                    Share
                  </BorderedFullButton>
                </div>
      </span>
    }

      <Card style={{marginBottom: "1em"}}>
      <section>
        <label htmlFor="title">Title</label>
        <div>
          <ViewInput
            type="text"
            id="title"
            name="title"
            placeholder="title"
            disabled={true}
            value={password.title ? password.title : "Untitled"}
            />
            {
              !/Mobi|Android/i.test(navigator.userAgent) &&
          <LinkButton onClick={(e) => {
              e.preventDefault();
              let newCopyResponses = [...showCopyResponse];
              newCopyResponses[0] = true;
              setShowCopyResponse(newCopyResponses);
              timeout = setTimeout(() => {
                let newCopyResponses = [...showCopyResponse];
                newCopyResponses[0] = false;
                setShowCopyResponse(newCopyResponses);
              }, 2000);

              if (/Mobi|Android/i.test(navigator.userAgent)){
                var copyText = document.getElementById("title");
                copyText.select();
            //    setCopiedText(copyText);
                document.execCommand("copy");
              } else {
                navigator.clipboard.writeText(password.title ? password.title : "Untitled");
              }
            }}
            >
            <img
              src={CopyIcon}
              alt=""
              className="icon"
              />
             {
                showCopyResponse[0] &&
                <span>
                  Copied!
                </span>
              }
          </LinkButton>
        }
        </div>
      </section>

      <section>
        <label htmlFor="folder">Folder</label>
        <ViewInput
          type="text"
          id="folder"
          name="folder"
          placeholder="folder"
          disabled={true}
          value={folder.name ? folder.name : "Untitled"}
          />
      </section>

      <section>
        <label htmlFor="username">Login</label>
        <div>
          <ViewInput
            type="text"
            id="username"
            name="username"
            disabled={true}
            value={password.username ? password.username : "No login"}
            />
          {
              !/Mobi|Android/i.test(navigator.userAgent) &&
          <LinkButton
            onClick={(e) => {
              e.preventDefault();
              let newCopyResponses = [...showCopyResponse];
              newCopyResponses[1] = true;
              setShowCopyResponse(newCopyResponses);
              timeout = setTimeout(() => {
                let newCopyResponses = [...showCopyResponse];
                newCopyResponses[1] = false;
                setShowCopyResponse(newCopyResponses);
              }, 2000);

              if (/Mobi|Android/i.test(navigator.userAgent)){
                var copyText = document.getElementById("title");
                copyText.select();
                document.execCommand("copy");
              } else {
                navigator.clipboard.writeText(password.username ? password.username : "No login");
              }
            }}
            >
            <img
              src={CopyIcon}
              alt=""
              className="icon"
              />
             {
                showCopyResponse[1] &&
                <span>
                  Copied!
                </span>
              }
          </LinkButton>
        }
        </div>
      </section>

      {
        errorMessage.length > 0 &&
      <section>
        <label htmlFor="secretKey">Secret key</label>
        <span>{errorMessage}</span>
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
              if (enteredSecretKey.length > 0) {
                  setErrorMessage("");
                  dispatch( setCurrentUserData( { secretKey: enteredSecretKey } ));
                  toggleRevealPassword();
              }
            }}
            >
            <img className="icon" src={SendIcon} alt="Send" />
          </LinkButton>
        </div>
      </section>
    }

      <section>
        <label htmlFor="password">Password</label>
        <div>
          <ViewInput
            type={revealPassword ? "text" : "password"}
            id="password"
            name="password"
            disabled={true}
            value={revealPassword  ? decryptedPassword : "decrypting_password"}
            />
          <LinkButton
            className="icon"
            onClick={(e) => {
              e.preventDefault();
              if (secretKey.length === 0){
                toggleMissingSecretKey();
              } else {
                toggleRevealPassword();
              }
            }}
            >
            <img className="icon" src={EyeIcon} alt="reveal pass" />
          </LinkButton>
          {
            !/Mobi|Android/i.test(navigator.userAgent) &&
          <LinkButton
            onClick={(e) => {
              e.preventDefault();
              let newCopyResponses = [...showCopyResponse];
              newCopyResponses[2] = true;
              setShowCopyResponse(newCopyResponses);
              timeout = setTimeout(() => {
                let newCopyResponses = [...showCopyResponse];
                newCopyResponses[2] = false;
                setShowCopyResponse(newCopyResponses);
              }, 2000);

              if (/Mobi|Android/i.test(navigator.userAgent)){
                var copyText = document.getElementById("title");
                copyText.select();
                document.execCommand("copy");
              } else {
                navigator.clipboard.writeText(password.password ? password.password : "No password");
              }
            }}
            >
            <img
              src={CopyIcon}
              alt=""
              className="icon"
              />
            {
              showCopyResponse[2] &&
              <span>
                Copied!
              </span>
            }
          </LinkButton>
        }
        </div>
      </section>

      {
        decryptedPassword &&
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

      <section>
        <label htmlFor="url">URL</label>
        <div>
        <ViewInput
          type="text"
          id="url"
          name="url"
          placeholder="url"
          disabled={true}
          value={password.url ? password.url : "No url"}
          />
          {
            !/Mobi|Android/i.test(navigator.userAgent) &&
        <LinkButton
              onClick={(e) => {
                e.preventDefault();
                let newCopyResponses = [...showCopyResponse];
                newCopyResponses[3] = true;
                setShowCopyResponse(newCopyResponses);
                timeout = setTimeout(() => {
                  let newCopyResponses = [...showCopyResponse];
                  newCopyResponses[3] = false;
                  setShowCopyResponse(newCopyResponses);
                }, 2000);

                if (/Mobi|Android/i.test(navigator.userAgent)){
                  var copyText = document.getElementById("title");
                  copyText.select();
                  document.execCommand("copy");
                } else {
                  navigator.clipboard.writeText(password.url ? password.url : "No URL");
                }
              }}
              >
              <img
            src={CopyIcon}
            alt=""
            className="icon"
            />
          {
            showCopyResponse[3] &&
            <span>
              Copied!
            </span>
          }
        </LinkButton>
      }
      </div>
      </section>

      <section>
        <label htmlFor="note">Note</label>
        <div>
          <ViewInput
            id="note"
            name="note"
            disabled={true}
            value={password.note ? password.note : "No note"}
            />
          {
            !/Mobi|Android/i.test(navigator.userAgent) &&
          <LinkButton
            onClick={(e) => {
              e.preventDefault();
              let newCopyResponses = [...showCopyResponse];
              newCopyResponses[4] = true;
              setShowCopyResponse(newCopyResponses);
              timeout = setTimeout(() => {
                let newCopyResponses = [...showCopyResponse];
                newCopyResponses[4] = false;
                setShowCopyResponse(newCopyResponses);
              }, 2000);

              if (/Mobi|Android/i.test(navigator.userAgent)){
                var copyText = document.getElementById("title");
                copyText.select();
                document.execCommand("copy");
              } else {
                navigator.clipboard.writeText(password.note ? password.note : "No note");
              }
            }}
            >
            <img
              src={CopyIcon}
              alt=""
              className="icon"
              />
              {
                showCopyResponse[4] &&
                <span>
                  Copied!
                </span>
              }
          </LinkButton>
        }
        </div>

      </section>

      <section>
        <label htmlFor="expires">Expires</label>
        <div style={{alignItems: "center", marginLeft: "7px", marginTop: "7px"}}>
          <ViewInput
            disabled={true}
            type="checkbox"
            id="expires"
            name="expires"
            checked={password.expires}
            />
          {
            password.expires &&
            <span>
              {password.expireDate ? DateTime.fromSeconds(password.expireDate).toFormat("dd.LL.y HH:mm") : "Expiry date not set"}
            </span>
          }
          {!password.expires &&
            <ViewInput
              disabled={true}
              type="text"
              value={"No expiration date"}
              />
          }
        </div>
      </section>

      <section>
        <label htmlFor="expires">Created</label>
        <div style={{alignItems: "center", marginLeft: "7px", marginTop: "7px"}}>
            <span>
              {password.createdDate ? DateTime.fromSeconds(password.createdDate).toFormat("dd.LL.y HH:mm") : ""}
            </span>
        </div>
      </section>

      <section>
        <label htmlFor="expires">Last updated</label>
          <div style={{alignItems: "center", marginLeft: "7px", marginTop: "7px"}}>
            <span>
              {password.updatedDate ? DateTime.fromSeconds(password.updatedDate).toFormat("dd.LL.y HH:mm") : ""}
            </span>
          </div>
      </section>

    </Card>

    {
      !password.deletedDate &&
        !password.version &&
    <ItemContainer key={"history"}>
      <span
        style={{paddingLeft: "0px"}}
        onClick={(e) => history.push(`/folders/${folderID}/${password.originalPasswordId ? password.originalPasswordId : password._id}/history`)}
        >
          Password History
      </span>
    </ItemContainer>
    }

    <Modal isOpen={showSharePasswordDialog} toggle={() => setShowSharePasswordDialog(false)}>
      <ModalBody>
        <SharePassword
          {...props}
          close={() => setShowSharePasswordDialog(false)}
          />
      </ModalBody>
    </Modal>

    </Form>
  );
};
