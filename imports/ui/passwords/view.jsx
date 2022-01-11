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
  useSelector
} from 'react-redux';

import {
  PasswordsCollection
} from '/imports/api/passwordsCollection';

import {
  RestoreIcon,
  EyeIcon,
  CopyIcon,
  PencilIcon,
  BackIcon,
  HourglassIcon,
  DeleteIcon
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

const { DateTime } = require("luxon");

export default function PasswordView( props ) {

  const {
    match,
    history,
    location,
    columns
  } = props;

  const userId = Meteor.userId();
  const {
    passwordID,
    folderID
  } = match.params;
  const layout = useSelector( ( state ) => state.metadata.value ).layout;
  const encryptionData = useSelector( ( state ) => state.encryptionData.value );

  const dbUsers = useSelector( ( state ) => state.users.value );

  const passwords = useSelector( ( state ) => state.passwords.value );
  const folders = useSelector( ( state ) => state.folders.value );
  let folder = useSelector( ( state ) => state.metadata.value ).selectedFolder;

  if (!folder && folders.length > 0){
    folder = folders.find(f => f._id === folderID);
  }

  const usedPassword = useSelector( ( state ) => state.metadata.value ).usedPassword;

  const password = useTracker( () => PasswordsCollection.findOne( {_id: passwordID} ) );

  const [ revealPassword, setRevealPassword ] = useState( false );
  const [ decryptedPassword, setDecryptedPassword ] = useState( "" );
  const [ showCopyResponse, setShowCopyResponse ] = useState( [false, false, false, false, false] );

  const [ copiedText, setCopiedText ] = useState( "" );

  let timeout = null;

  async function toggleRevealPassword(){
    setRevealPassword( !revealPassword );
    if (decryptedPassword.length === 0){
      const decrypted = await decryptPassword(password.password);
      setDecryptedPassword(decrypted);
    }
  }

    async function decryptPassword(text){
      if (!encryptionData){
        return [];
      }

      const symetricKey = await crypto.subtle.importKey(
        "raw",
          encryptionData.symetricKey,
          encryptionData.algorithm,
        true,
        ["encrypt", "decrypt"]
      );

      let decryptedText = null;
      await window.crypto.subtle.decrypt(
        encryptionData.algorithm,
        symetricKey,
        text
      )
      .then(function(decrypted){
        decryptedText = decrypted;
      })
      .catch(function(err){
        console.error(err);
      });
      let dec = new TextDecoder();
      const decryptedValue = dec.decode(decryptedText);
      return decryptedValue;
    }

  const restorePasswordVersion = () => {
    if ( window.confirm( "Are you sure you want to restore this version?" ) ) {
      const passwordId = password.passwordId ? password.passwordId : password._id;

      PasswordsCollection.insert( {
        title: password.title,
        username: password.username,
        password: password.password,
        quality: password.quality,
        url: password.url,
        note: password.note,
        expires: password.expires,
        expireDate: password.expireDate,
        folder: password.folder,
        createdDate: password.createdDate,
        version: 0,
        updatedDate: parseInt(DateTime.now().toSeconds()),
        passwordId,
      } );

      const passwordsToUpdate = passwords.filter( pass => [ pass.passwordId, pass._id ].includes( passwordId ) );

      passwordsToUpdate.forEach( ( pass, index ) => {
        if ( pass.version >= 20 ) {
          PasswordsCollection.remove( {
            _id: pass._id
          } );
        } else {
          if ( pass.version === 0 ) {
            PasswordsCollection.update( pass._id, {
              $inc: {
                version: 1
              },
              $set: {
                editedBy: userId
              }
            } );
          } else {
            PasswordsCollection.update( pass._id, {
              $inc: {
                version: 1
              }
            } );
          }
        }
      } );
      history.push( `${listPasswordsInFolderStart}${folderID}` );
    }
  };

  const restoreDeletedPassword = () => {
    if ( window.confirm( "Are you sure you want to restore this deleted password?" ) ) {
      let data = {
        deletedDate: null,
      };
      PasswordsCollection.update( password._id, {
        $set: {
          ...data
        }
      } );
      history.goBack();
    }
  }

  const removePassword = () => {
    const passwordToRemove = password;
    let message = "Are you sure you want to remove this password? Note: Password will be moved to the \"Deleted passwords\" section.";
    if ( passwordToRemove.version > 0 ) {
      message = "Are you sure you want to remove this version? ";
    }
    if ( window.confirm( message ) ) {
      if ( passwordToRemove.version === 0 && !passwordToRemove.deletedDate ) {
        let data = {
          deletedDate: parseInt(DateTime.now().toSeconds()),
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

  const passwordCanBeEdited = folder.users.find( user => user._id === userId ).level <= 1 && password.version === 0 && !password.deletedDate;
  const passwordCanBeRestored = folder.users.find( user => user._id === userId ).level <= 1 && password.version === 0 && password.deletedDate;
  const passwordVersionCanBeRestored = folder.users.find( user => user._id === userId ).level <= 1 && password.version > 0;

  const editedBy = password.editedBy ? dbUsers.find( user => user._id === password.editedBy ) : {};

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
              {`Version from ${DateTime.fromSeconds(password.updatedDate).toFormat("dd.LL.y HH:mm")}`}
            </label>
            <label className="username">
              {`Changed password ${editedBy ? editedBy.label : ""}`}
            </label>
          </div>


          {
            !usedPassword.deletedDate &&
            passwordVersionCanBeRestored &&
            <LinkButton
              onClick={(e) => {
                e.preventDefault(); restorePasswordVersion();
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
          password.version === 0 &&
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

            {
              !password.deletedDate &&
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
                Delete
              </BorderedFullButton>
            </div>
            }

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
              toggleRevealPassword();
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
    <ItemContainer key={"history"}>
      <span
        style={{paddingLeft: "0px"}}
        onClick={(e) => history.push(`/folders/${folderID}/${password.passwordId ? password.passwordId : password._id}/history`)}
        >
          Password History
      </span>
    </ItemContainer>
    }
    </Form>
  );
};
