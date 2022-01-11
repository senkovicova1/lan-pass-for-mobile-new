import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useDispatch,
  useSelector
} from 'react-redux';

import Select from 'react-select';

import {
  useTracker
} from 'meteor/react-meteor-data';

import {
  setUsedPassword
} from '/imports/redux/metadataSlice';

import {
  selectStyle
} from '/imports/other/styles/selectStyles';

import {
  PasswordsCollection
} from '/imports/api/passwordsCollection';

import {
  BackIcon,
  HourglassIcon,
  RestoreIcon,
} from "/imports/other/styles/icons";

import {
  BorderedLinkButton,
  Card,
  List,
  LinkButton,
  PasswordContainer,
} from "/imports/other/styles/styledComponents";

import {
  listPasswordsInFolderStart,
  viewPasswordStart,
} from "/imports/other/navigationLinks";

const { DateTime } = require("luxon");

export default function PasswordHistoryList( props ) {

  const dispatch = useDispatch();

  const {
    match,
    history,
    search,
    columns
  } = props;

  const userId = Meteor.userId();

  const dbUsers = useSelector( ( state ) => state.users.value );

  const {passwordID, folderID} = match.params;

  const folders = useSelector( ( state ) => state.folders.value );
  const folder = useMemo( () => {
    if ( folders.length > 0 ) {
      return folders.find( folder => folder._id === folderID );
    }
    return {};
  }, [ folders, folderID ] );

  const passwords = useTracker( () => PasswordsCollection.find( {
    $or: [
      {_id: passwordID},
      {passwordId: passwordID}
    ]
  }, {
    sort: {
      version: -1
    }
  } ).fetch() );
  const usedVersion = passwords.find( pass => pass.version === 0 );
  const previousVersions = passwords.filter( pass => pass.version > 0 ).sort( ( p1, p2 ) => p1 > p2 ? 1 : -1 ).map( pass => ( {
    ...pass,
    editedBy: dbUsers.find( user => user._id === pass.editedBy )
  } ) );


  const restorePassword = ( password ) => {
    if ( window.confirm( "Are you sure you want to restore this version?" ) ) {
      const passwordId = password.passwordId ? password.passwordId : password._id;

      PasswordsCollection.insert( {
        title: password.title,
        username: password.username,
        password: password.password,
        quality: password.quality,
        note: password.note,
        expires: password.expires,
        expireDate: password.expireDate,
        folder: password.folder,
        createdDate: password.createdDate,
        version: 0,
        updatedDate: parseInt(DateTime.now().toSeconds()),
        passwordId,
      } );

      passwords.forEach( ( pass, index ) => {
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

  const userCanRestorePassword = () => {
    return folder.users.find( user => user._id === userId )?.level <= 1;
  }

  return (
    <List columns={columns}>

      <h2>Previous versions</h2>

      <div className="command-bar">
          <BorderedLinkButton
            left
            onClick={(e) => {
              e.preventDefault();
              history.goBack();
            }}
            >
            <img
              src={BackIcon}
              alt=""
              className="icon"
              />
            Back
          </BorderedLinkButton>
      </div>

      {
        previousVersions.length === 0 &&
        <Card>
        <span className="message">There are no previous versions.</span>
      </Card>
      }

      {
        previousVersions.map((password) => (
          <PasswordContainer key={password._id}>
            <img
              onClick={() => {
                dispatch(setUsedPassword(password));
                history.push(`${viewPasswordStart}${folderID}/version/${password._id}`);
              }}
              src={HourglassIcon}
              alt=""
              className="icon start"
              />
            <div  onClick={() => {
                dispatch(setUsedPassword(password));
                history.push(`${viewPasswordStart}${folderID}/version/${password._id}`);
              }}>
              <label className="title">
                {`Version from ${DateTime.fromSeconds(password.updatedDate).toFormat("dd.LL.y HH:mm")}`}
              </label>
              <label className="username">
                {`Changed password ${password.editedBy ? password.editedBy.label : ""}`}
              </label>
            </div>
            {
              !usedVersion.deletedDate &&
              userCanRestorePassword &&
              <LinkButton onClick={(e) => {e.preventDefault(); restorePassword(password);}}>
                <img
                  src={RestoreIcon}
                  alt=""
                  className="icon"
                  />
              </LinkButton>
            }
          </PasswordContainer>
        ))
      }


    </List>
  );
};
